import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "GéoStratège — Géopolitique & Relations internationales",
  description:
    "Décryptage de l'actualité géopolitique mondiale : OTAN, Moyen-Orient, Afrique, Indo-Pacifique, énergie et économie mondiale.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-[#0a0a0a] text-gray-200 min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="border-t border-gray-800 mt-16 py-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} GéoStratège — Tous droits réservés</p>
        </footer>
      </body>
    </html>
  );
}
