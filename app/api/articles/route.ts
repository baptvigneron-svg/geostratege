import { NextResponse } from "next/server";
import { getAllArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const articles = getAllArticles();
    return NextResponse.json(articles);
  } catch {
    return NextResponse.json({ error: "Erreur lecture articles" }, { status: 500 });
  }
}
