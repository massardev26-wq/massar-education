
import { NextRequest } from "next/server";
import { PDFDocument } from "pdf-lib";

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

    if (!response.ok) {
      return new Response("Image introuvable", {
        status: 404,
      });
    }

    const imageBytes = new Uint8Array(
      await response.arrayBuffer()
    );

    const pdfDoc = await PDFDocument.create();

    let image;

    if (file.pathname.toLowerCase().endsWith(".png")) {
      image = await pdfDoc.embedPng(imageBytes);
    } else if (
      file.pathname.toLowerCase().endsWith(".jpg") ||
      file.pathname.toLowerCase().endsWith(".jpeg")
    ) {
      image = await pdfDoc.embedJpg(imageBytes);
    } else {
      return new Response("Format image non supporté", {
        status: 400,
      });
    }

    const page = pdfDoc.addPage([
      image.width,
      image.height,
    ]);

    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });

    const pdfBytes = await pdfDoc.save();

    const filename =
      file.pathname.split("/").pop()?.replace(/\.[^.]+$/, "") ||
      "document";

    return new Response(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF conversion error:", error);

    return new Response("Erreur de conversion PDF", {
      status: 500,
    });
  }
}
