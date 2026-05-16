import { NextResponse } from "next/server";
import { getArticleById } from "@/lib/articles";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const article = getArticleById(params.id);
  if (!article) {
    return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
  }
  return NextResponse.json(article);
}
