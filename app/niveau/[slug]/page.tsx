import { supabase } from "@/lib/supabase";
import Ad from "@/components/Ad";
export const dynamic = "force-dynamic";
export default async function Level({ params }: { params: { slug: string } }) {
  const { data: level } = await supabase.from("levels").select("*").eq("slug", params.slug).maybeSingle();
  if (!level) return <main className="wrap"><h1>Niveau introuvable</h1></main>;
  const { data: ls } = await supabase.from("level_subjects").select("subjects(id,name,icon)").eq("level_id", level.id);
  const { data: res } = await supabase.from("resources").select("*, chapters(title)").eq("level_id", level.id).order("created_at", { ascending: false });
  const { data: ads } = await supabase.from("ads").select("*").eq("enabled", true);
  const ad = (s: string) => (ads || []).find((a: any) => a.slot === s);
  const subjects = (ls || []).map((x: any) => x.subjects).filter(Boolean);
  return (
    <main className="wrap">
      <h1>{level.name}</h1>
      <div className="two"><div>
        {subjects.map((s: any) => {
          const items = (res || []).filter((r: any) => r.subject_id === s.id);
          const chaps = Array.from(new Set(items.map((r: any) => r.chapters?.title || "Sans chapitre")));
          return (
            <section key={s.id}><h2>{s.icon} {s.name}</h2>
              {!items.length && <p>Aucune ressource pour le moment.</p>}
              {chaps.map((c: any) => (
                <div key={c}><h3>{c}</h3>
                  {items.filter((r: any) => (r.chapters?.title || "Sans chapitre") === c).map((r: any) => (
                    <div className="card" key={r.id} style={{ marginBottom: 10 }}>
                      <span className="tag">{r.type}</span>{r.is_premium && <span className="tag">🔒 Premium</span>}
                      <b> {r.title}</b>{r.description && <p>{r.description}</p>}
                      {r.file_url && !r.is_premium && <a className="btn alt" href={r.file_url} target="_blank">Consulter / Télécharger</a>}
                    </div>
                  ))}
                </div>
              ))}
              <Ad ad={ad("entre")} />
            </section>
          );
        })}
      </div><aside><Ad ad={ad("sidebar")} /></aside></div>
    </main>
  );
}
