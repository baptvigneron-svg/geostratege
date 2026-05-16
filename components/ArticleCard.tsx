import Link from "next/link";
import type { Article } from "@/lib/articles";

const CATEGORY_COLORS: Record<string, string> = {
  OTAN: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Énergie: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "Indo-Pacifique": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Moyen-Orient": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Afrique: "bg-green-500/20 text-green-400 border-green-500/30",
  "Économie mondiale": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
};

const CATEGORY_ICONS: Record<string, string> = {
  OTAN: "🛡️",
  Énergie: "⚡",
  "Indo-Pacifique": "🌏",
  "Moyen-Orient": "🕌",
  Afrique: "🌍",
  "Économie mondiale": "📊",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ArticleCard({ article }: { article: Article }) {
  const colorClass =
    CATEGORY_COLORS[article.categorie] ??
    "bg-gray-500/20 text-gray-400 border-gray-500/30";
  const icon = CATEGORY_ICONS[article.categorie] ?? "🌐";

  return (
    <Link href={`/article/${article.id}`} className="group block h-full">
      <article className="h-full flex flex-col bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden hover:border-blue-500/50 hover:bg-gray-900 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10">
        {/* Image placeholder */}
        <div className="relative h-44 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/30 via-transparent to-transparent" />
          <span className="text-6xl opacity-30 group-hover:opacity-50 transition-opacity duration-300 select-none">
            {icon}
          </span>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-900/90 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-5 gap-3">
          {/* Category + Date */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${colorClass}`}
            >
              {article.categorie}
            </span>
            <time className="text-xs text-gray-500">{formatDate(article.date)}</time>
          </div>

          {/* Title */}
          <h2 className="font-serif text-lg font-bold text-white leading-snug group-hover:text-blue-300 transition-colors duration-200 line-clamp-2">
            {article.titre}
          </h2>

          {/* Summary */}
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 flex-1">
            {article.resume}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800">
            <span className="text-xs text-gray-500">
              {article.quiz.length} questions
            </span>
            <span className="text-xs text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              Lire l&apos;article
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
