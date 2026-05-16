import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center">
      <span className="text-6xl mb-6">🌐</span>
      <h1 className="text-4xl font-bold text-white font-serif mb-2">404</h1>
      <p className="text-gray-400 mb-8 text-lg">Cette page n&apos;existe pas.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
