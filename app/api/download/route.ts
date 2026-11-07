
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const fileUrl = request.nextUrl.searchParams.get("url");

  if (!fileUrl) {
    return new Response("Lien manquant", { status: 400 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      return new Response("Configuration manquante", {
        status: 500,
      });
    }

    const file = new URL(fileUrl);
    const supabase = new URL(supabaseUrl);

    if (
      file.hostname !== supabase.hostname ||
      !file.pathname.startsWith(
        "/storage/v1/object/public/files/"
      )
    ) {
      return new Response("Lien non autorisé", {
        status: 403,
      });
    }

    const response = await fetch(fileUrl);

    if (!response.ok || !response.body) {
      return new Response("Fichier introuvable", {
        status: response.status,
      });
    }

    const filename = file.pathname.split("/").pop() || "document";

    return new Response(response.body, {
      headers: {
        "Content-Type":
          response.headers.get("content-type") ||
          "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Erreur de téléchargement", {
      status: 500,
    });
  }
}
