"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const EXAMPLE_TOPICS = [
  "La montée en puissance militaire de la Chine en Indo-Pacifique",
  "L'instabilité politique au Sahel et ses conséquences régionales",
  "La crise de la dette mondiale et ses implications géopolitiques",
  "Les tensions autour de Taïwan en 2025",
  "La diplomatie turque entre Orient et Occident",
  "Le rôle de l'Inde dans le nouvel ordre mondial multipolaire",
];

export default function AdminPage() {
  // Auth
  const [password, setPassword] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Generate form — uses a separate password field so the value is always explicit
  const [generatePassword, setGeneratePassword] = useState("");
  const [sujet, setSujet] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
    articleId?: string;
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (sessionStorage.getItem("gs_admin") === "1") setIsAuth(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        sessionStorage.setItem("gs_admin", "1");
        setIsAuth(true);
        setGeneratePassword(password); // pre-fill generate form
      } else {
        setAuthError("Mot de passe incorrect.");
      }
    } catch {
      setAuthError("Erreur réseau. Réessayez.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sujet.trim() || !generatePassword || generating) return;
    setGenerating(true);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sujet: sujet.trim(), password: generatePassword }),
      });
      const text = await res.text();
      let data: { error?: string; article?: { titre: string; id: string } } = {};
      try { data = JSON.parse(text); } catch { /* not JSON */ }
      if (!res.ok) {
        setResult({ ok: false, message: data.error ?? `Erreur ${res.status} : ${text.slice(0, 300)}` });
      } else if (data.article) {
        setResult({
          ok: true,
          message: `Article « ${data.article.titre} » généré avec succès !`,
          articleId: data.article.id,
        });
        setSujet("");
      } else {
        setResult({ ok: false, message: "Réponse inattendue du serveur." });
      }
    } catch (err) {
      setResult({ ok: false, message: `Erreur réseau : ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("gs_admin");
    setIsAuth(false);
    setPassword("");
    setGeneratePassword("");
  };

  // ─── Login form ───────────────────────────────────────────────────────────────
  if (!isAuth) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <span className="text-5xl">🔐</span>
            <h1 className="text-2xl font-bold text-white mt-4 font-serif">
              Accès Administration
            </h1>
            <p className="text-gray-400 mt-1 text-sm">Zone réservée — GéoStratège</p>
          </div>

          <form
            onSubmit={handleLogin}
            className="bg-gray-900/70 border border-gray-800 rounded-2xl p-8 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe administrateur
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-lg text-white placeholder-gray-500 outline-none transition-colors"
                required
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading || !password}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-all"
            >
              {authLoading ? "Vérification…" : "Connexion"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Admin interface ──────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white font-serif">
            Générateur d&apos;articles
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Créez du contenu géopolitique via Claude AI
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-400 transition-colors"
        >
          Déconnexion
        </button>
      </div>

      {/* Generate form */}
      <div className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 sm:p-8 mb-6">
        <h2 className="text-lg font-semibold text-white mb-5">Nouveau sujet</h2>

        <form onSubmit={handleGenerate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sujet de l&apos;article
            </label>
            <textarea
              value={sujet}
              onChange={(e) => setSujet(e.target.value)}
              placeholder="Ex : La montée en puissance militaire de la Chine en Indo-Pacifique"
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-lg text-white placeholder-gray-500 outline-none transition-colors resize-none"
              disabled={generating}
            />
            <p className="text-xs text-gray-500 mt-1.5">
              {sujet.length} caractères — plus le sujet est précis, meilleur est le résultat
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mot de passe (requis pour l&apos;API)
            </label>
            <input
              type="password"
              value={generatePassword}
              onChange={(e) => setGeneratePassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 focus:border-blue-500 rounded-lg text-white placeholder-gray-500 outline-none transition-colors"
              disabled={generating}
              required
            />
          </div>

          <button
            type="submit"
            disabled={generating || !sujet.trim() || !generatePassword}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Génération en cours… (30–60 s)
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Générer avec Claude AI
              </>
            )}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`rounded-xl p-4 border mb-6 ${
            result.ok
              ? "bg-green-900/15 border-green-800/40"
              : "bg-red-900/15 border-red-800/40"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              result.ok ? "text-green-400" : "text-red-400"
            }`}
          >
            {result.ok ? "✅" : "❌"} {result.message}
          </p>
          {result.ok && result.articleId && (
            <button
              onClick={() => router.push(`/article/${result.articleId}`)}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300 underline"
            >
              Voir l&apos;article →
            </button>
          )}
        </div>
      )}

      {/* Suggested topics */}
      <div className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Sujets suggérés
        </h3>
        <div className="space-y-2">
          {EXAMPLE_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => setSujet(topic)}
              disabled={generating}
              className="w-full text-left px-3 py-2.5 text-sm text-gray-400 hover:text-blue-400 hover:bg-blue-500/5 rounded-lg border border-transparent hover:border-blue-500/20 transition-all disabled:opacity-50"
            >
              → {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
