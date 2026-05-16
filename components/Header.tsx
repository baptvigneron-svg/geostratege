"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const CATEGORIES = [
  "OTAN",
  "Énergie",
  "Indo-Pacifique",
  "Moyen-Orient",
  "Afrique",
  "Économie mondiale",
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleCategoryClick = (cat: string) => {
    router.push(`/?categorie=${encodeURIComponent(cat)}`);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-blue-500 text-2xl">🌐</span>
            <span className="text-xl font-bold text-white font-serif tracking-tight group-hover:text-blue-400 transition-colors">
              GéoStratège
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-all duration-200"
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-blue-500 rounded-md transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Admin
            </Link>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-gray-400 hover:text-white"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-800 py-3 pb-4">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className="px-3 py-1.5 text-sm text-gray-400 hover:text-blue-400 bg-gray-900 hover:bg-blue-500/10 rounded-md transition-all"
                >
                  {cat}
                </button>
              ))}
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-gray-900 border border-gray-700 rounded-md"
              >
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
