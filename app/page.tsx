import { Suspense } from "react";
import { getAllArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import CategoryFilter from "@/components/CategoryFilter";

export const dynamic = "force-dynamic";

export default function HomePage({
  searchParams,
}: {
  searchParams: { categorie?: string };
}) {
  const all = getAllArticles();
  const categorie = searchParams.categorie;
  const articles = categorie
    ? all.filter((a) => a.categorie === categorie)
    : all;

  return (
    <div>
      {/* Hero */}
      <section className="mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">
          Décryptage géopolitique
        </h1>
        <p className="text-gray-400 text-base sm:text-lg max-w-2xl">
          Analyses approfondies des grandes dynamiques internationales — conflits, énergie,
          alliances et économie mondiale.
        </p>
      </section>

      {/* Filters */}
      <section className="mb-8">
        <Suspense fallback={null}>
          <CategoryFilter />
        </Suspense>
      </section>

      {/* Articles grid */}
      {articles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-4">🌐</p>
          <p className="text-lg font-medium text-gray-400">Aucun article dans cette catégorie</p>
          <p className="text-sm mt-1">
            Utilisez{" "}
            <span className="text-blue-400">/admin</span> pour générer de nouveaux articles.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
