
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const fileUrl = request.nextUrl.searchParams.get("url");

  if (!fileUrl) {
    return new Response("Lien manquant", { status: 400 });
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      return new Response("Configuration manquante", { status: 500 });
    }

    const file = new URL(fileUrl);
    const supabase = new URL(supabaseUrl);

    // Sécurité : autoriser uniquement les fichiers publics Supabase du site
    if (
      file.hostname !== supabase.hostname ||
      !file.pathname.includes("/storage/v1/object/public/")
    ) {
      return new Response("Lien non autorisé", { status: 403 });
    }

    const response = await fetch(fileUrl);

    if (!response.ok || !response.body) {
      return new Response("Fichier introuvable", { status: 404 });
    }

    const filename =
      decodeURIComponent(file.pathname.split("/").pop() || "document.pdf")
        .replace(/[^a-zA-Z0-9._-]/g, "_");

    return new Response(response.body, {
      headers: {
        "Content-Type":
          response.headers.get("content-type") || "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new Response("Erreur de téléchargement", { status: 500 });
  }
}
