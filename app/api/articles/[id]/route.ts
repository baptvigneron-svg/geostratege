import { NextResponse } from "next/server";
import { getArticleById } from "@/lib/articles";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = getArticleById(id);
  if (!article) {
    return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
  }
  return NextResponse.json(article);
}
