"use client";

import { useRouter, useSearchParams } from "next/navigation";

const CATEGORIES = [
  "Tous",
  "OTAN",
  "Énergie",
  "Indo-Pacifique",
  "Moyen-Orient",
  "Afrique",
  "Économie mondiale",
];

export default function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("categorie") ?? "Tous";

  const handleClick = (cat: string) => {
    if (cat === "Tous") {
      router.push("/");
    } else {
      router.push(`/?categorie=${encodeURIComponent(cat)}`);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => {
        const isActive = cat === active || (cat === "Tous" && !searchParams.get("categorie"));
        return (
          <button
            key={cat}
            onClick={() => handleClick(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-gray-900 text-gray-400 border border-gray-700 hover:border-blue-500/50 hover:text-blue-400"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
