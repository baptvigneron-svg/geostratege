import fs from "fs";
import path from "path";

export type QuizQuestion = {
  question: string;
  choix: string[];
  bonneReponse: number;
  explication: string;
};

export type Article = {
  id: string;
  titre: string;
  resume: string;
  contenu: string;
  categorie: string;
  date: string;
  quiz: QuizQuestion[];
};

const DATA_FILE = path.join(process.cwd(), "data", "articles.json");

export function getAllArticles(): Article[] {
  const raw = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(raw) as Article[];
}

export function getArticleById(id: string): Article | undefined {
  return getAllArticles().find((a) => a.id === id);
}

export function saveArticle(article: Article): void {
  const articles = getAllArticles();
  const index = articles.findIndex((a) => a.id === article.id);
  if (index >= 0) {
    articles[index] = article;
  } else {
    articles.unshift(article);
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(articles, null, 2), "utf-8");
}
