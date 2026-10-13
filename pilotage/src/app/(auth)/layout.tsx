import Link from "next/link";
import { APP_NAME } from "@/lib/config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 text-xl font-semibold text-brand-700">
        {APP_NAME}
      </Link>
      <div className="card w-full max-w-md">{children}</div>
    </main>
  );
}
