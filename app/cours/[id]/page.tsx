import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function CoursePage({ params }: { params: { id: string } }) {
  const { data: resource, error } = await supabase
    .from("resources")
    .select("*, levels(name,slug), subjects(name,icon), chapters(title)")
    .eq("id", Number(params.id))
    .maybeSingle();

  if (error || !resource) {
    return <main style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}><h1>Cours introuvable</h1><Link href="/">Retour à l’accueil</Link></main>;
  }

  const downloadHref = resource.file_url && !resource.is_premium
    ? `/api/download?url=${encodeURIComponent(resource.file_url)}&title=${encodeURIComponent(resource.title || "document")}&resource_id=${encodeURIComponent(String(resource.id))}&level_id=${encodeURIComponent(String(resource.level_id || ""))}&subject_id=${encodeURIComponent(String(resource.subject_id || ""))}`
    : null;

  return (
    <main style={{ maxWidth: 1050, margin: "28px auto", padding: "20px 4%", color: "#102354" }}>
      <div style={{ color: "#56708f", fontWeight: 700, marginBottom: 18 }}>
        <Link href="/" style={{ color: "#0750ad", textDecoration: "none" }}>Accueil</Link>
        {resource.levels?.name ? ` › ${resource.levels.name}` : ""}
        {resource.subjects?.name ? ` › ${resource.subjects.name}` : ""}
        {resource.chapters?.title ? ` › ${resource.chapters.title}` : ""}
      </div>
      <article style={{ background: "white", border: "1px solid #dce5f3", borderRadius: 18, padding: "clamp(20px,4vw,42px)", boxShadow: "0 8px 28px #102d5b0d" }}>
        <div style={{ color: "#0750ad", fontWeight: 800, marginBottom: 8 }}>{resource.type || "Cours"}</div>
        <h1 style={{ color: "#123579", fontSize: "clamp(28px,4vw,40px)", margin: "0 0 18px" }}>{resource.title}</h1>
        {resource.description && <p style={{ color: "#526078", fontSize: 17, lineHeight: 1.7 }}>{resource.description}</p>}
        <div style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.9, fontSize: 17, color: "#24334d", minHeight: 180, marginTop: 20 }}>
          {resource.content?.trim() || "Le contenu détaillé de ce cours n’a pas encore été ajouté. Il sera affiché ici dès qu’il sera renseigné depuis l’administration."}
        </div>
        {downloadHref && <div style={{ borderTop: "1px solid #e5edf7", marginTop: 30, paddingTop: 22 }}><a href={downloadHref} style={{ display: "inline-block", background: "#159447", color: "white", padding: "12px 20px", borderRadius: 10, fontWeight: 800, textDecoration: "none" }}>⬇ Télécharger le document</a></div>}
        {resource.is_premium && <p style={{ marginTop: 24, color: "#996515", fontWeight: 700 }}>🔒 Ce contenu est réservé aux membres Premium.</p>}
      </article>
    </main>
  );
}
