import { NextResponse } from "next/server";
import { saveArticle } from "@/lib/articles";
import type { Article } from "@/lib/articles";

const CATEGORIES = [
  "OTAN",
  "Énergie",
  "Indo-Pacifique",
  "Moyen-Orient",
  "Afrique",
  "Économie mondiale",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(req: Request) {
  const { sujet, password } = await req.json();

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (!sujet || typeof sujet !== "string" || sujet.trim().length < 5) {
    return NextResponse.json({ error: "Sujet invalide" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Clé API Anthropic manquante" }, { status: 500 });
  }

  const prompt = `Tu es un expert en géopolitique et en relations internationales. Génère un article de géopolitique complet en français sur le sujet suivant : "${sujet.trim()}"

L'article doit :
- Être structuré avec une introduction, un développement (2-3 parties avec sous-titres ## et ###) et une conclusion
- Faire environ 600 mots
- Être informatif, équilibré et factuel
- Utiliser des données, statistiques et exemples concrets
- S'adresser à un lecteur cultivé mais non-spécialiste

Génère aussi 5 questions QCM basées sur le contenu de l'article.

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks) ayant cette structure exacte :
{
  "titre": "titre de l'article",
  "resume": "résumé de 2 phrases maximum",
  "contenu": "contenu complet de l'article avec formatage markdown (## pour les titres de section, ### pour les sous-sections)",
  "categorie": "une seule catégorie parmi : ${CATEGORIES.join(", ")}",
  "quiz": [
    {
      "question": "question complète",
      "choix": ["choix A", "choix B", "choix C", "choix D"],
      "bonneReponse": 0,
      "explication": "explication détaillée de la bonne réponse"
    }
  ]
}

Le champ bonneReponse est l'index (0-3) de la bonne réponse. Génère exactement 5 questions.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: `Erreur API Anthropic (${response.status}): ${err.slice(0, 200)}` },
        { status: 500 }
      );
    }

    const result = await response.json();
    const rawText: string = result.content
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { type: string; text: string }) => b.text)
      .join("");

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Aucun JSON dans la réponse Claude" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!parsed.titre || !parsed.contenu || !parsed.quiz || parsed.quiz.length !== 5) {
      return NextResponse.json({ error: "Structure JSON incomplète" }, { status: 500 });
    }

    if (!CATEGORIES.includes(parsed.categorie)) {
      parsed.categorie = "Économie mondiale";
    }

    const article: Article = {
      id: slugify(parsed.titre) + "-" + Date.now().toString(36),
      titre: parsed.titre,
      resume: parsed.resume,
      contenu: parsed.contenu,
      categorie: parsed.categorie,
      date: new Date().toISOString().split("T")[0],
      quiz: parsed.quiz,
    };

    saveArticle(article);

    return NextResponse.json({ article });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
