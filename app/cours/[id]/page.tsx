import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
}: {
  params: { id: string };
}) {
  const resourceId = Number(params.id);
  if (!Number.isFinite(resourceId)) notFound();

  const { data: resource } = await supabase
    .from("resources")
    .select("*")
    .eq("id", resourceId)
    .maybeSingle();

  if (!resource) notFound();

  const [{ data: level }, { data: subject }] = await Promise.all([
    supabase.from("levels").select("name,slug").eq("id", resource.level_id).maybeSingle(),
    supabase.from("subjects").select("name").eq("id", resource.subject_id).maybeSingle(),
  ]);

  const pageContent = resource.content || resource.description || "";

  return (
    <main style={{ maxWidth: 1050, margin: "0 auto", padding: "28px 20px 50px" }}>
      <nav style={{ color: "#0750ad", fontWeight: 700, fontSize: 14, marginBottom: 18 }}>
        <Link href="/" style={{ textDecoration: "none" }}>Accueil</Link>
        {"  ›  "}
        {level?.slug ? (
          <Link href={`/niveau/${level.slug}`} style={{ textDecoration: "none" }}>
            {level.name}
          </Link>
        ) : (
          level?.name || "Niveau"
        )}
        {"  ›  "}
        {subject?.name || "Matière"}
      </nav>

      <article
        style={{
          background: "#ffffff",
          border: "1px solid #dce7f5",
          borderRadius: 20,
          padding: "clamp(20px,4vw,42px)",
          boxShadow: "0 8px 28px rgba(18,51,122,0.07)",
        }}
      >
        <div style={{ color: "#0750ad", fontWeight: 800, fontSize: 13, marginBottom: 8 }}>
          {resource.type || "Ressource"}{level?.name ? ` • ${level.name}` : ""}
        </div>
        <h1 style={{ color: "#123579", fontSize: "clamp(26px,4vw,38px)", lineHeight: 1.2, margin: "0 0 24px" }}>
          {resource.title}
        </h1>

        {pageContent ? (
          <div
            style={{
              color: "#26364f",
              fontSize: 17,
              lineHeight: 1.9,
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {pageContent}
          </div>
        ) : (
          <div style={{ background: "#f4f8ff", padding: 18, borderRadius: 12, color: "#526078" }}>
            Le contenu détaillé de ce cours n’a pas encore été ajouté.
          </div>
        )}

        {resource.file_url && !resource.is_premium && (
          <div style={{ borderTop: "1px solid #e3eaf5", marginTop: 32, paddingTop: 22 }}>
            <a
              href={resource.file_url}
              download
              target="_blank"
              rel="noopener noreferrer" 
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                background: "#20a43a",
                color: "#ffffff",
                textDecoration: "none",
                padding: "12px 20px",
                borderRadius: 11,
                fontWeight: 900,
              }}
            >
              ⬇ Télécharger le document
            </a>
          </div>
        )}
      </article>
    </main>
  );
}
