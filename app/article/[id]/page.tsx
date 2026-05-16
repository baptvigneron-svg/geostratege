import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleById, getAllArticles } from "@/lib/articles";
import Quiz from "@/components/Quiz";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ id: a.id }));
}

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      elements.push(<h3 key={i}>{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i}>{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h2 key={i}>{line.slice(2)}</h2>);
    } else if (line.trim() !== "") {
      elements.push(<p key={i}>{line}</p>);
    }
    i++;
  }

  return elements;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const CATEGORY_COLORS: Record<string, string> = {
  OTAN: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Énergie: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Indo-Pacifique": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Moyen-Orient": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Afrique: "bg-green-500/20 text-green-400 border-green-500/30",
  "Économie mondiale": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = getArticleById(id);
  if (!article) notFound();

  const colorClass =
    CATEGORY_COLORS[article.categorie] ??
    "bg-gray-500/20 text-gray-400 border-gray-500/30";

  return (
    <article className="max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-400 transition-colors mb-6"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Retour aux articles
      </Link>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className={`inline-flex px-2.5 py-0.5 text-xs font-medium rounded-full border ${colorClass}`}>
          {article.categorie}
        </span>
        <time className="text-sm text-gray-500">{formatDate(article.date)}</time>
      </div>

      {/* Title */}
      <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
        {article.titre}
      </h1>

      {/* Summary */}
      <p className="text-lg text-gray-400 leading-relaxed mb-8 pb-8 border-b border-gray-800">
        {article.resume}
      </p>

      {/* Hero image placeholder */}
      <div className="w-full h-56 sm:h-72 rounded-2xl bg-gradient-to-br from-gray-800 via-gray-900 to-[#0a0a0a] flex items-center justify-center mb-10 relative overflow-hidden border border-gray-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
        <span className="text-8xl opacity-20 select-none">🌐</span>
      </div>

      {/* Content */}
      <div className="article-content mb-16">
        {renderMarkdown(article.contenu)}
      </div>

      {/* Quiz section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-800" />
          <h2 className="text-xl font-bold text-white font-serif whitespace-nowrap">
            Testez vos connaissances
          </h2>
          <div className="flex-1 h-px bg-gray-800" />
        </div>
        <Quiz questions={article.quiz} />
      </section>
    </article>
  );
}
