import { supabase } from "@/lib/supabase";
import LevelLearningClient from "./LevelLearningClient";

export const dynamic = "force-dynamic";

export default async function Level({ params }: { params: { slug: string } }) {
  const { data: level } = await supabase.from("levels").select("*").eq("slug", params.slug).maybeSingle();
  if (!level) return <main className="wrap"><h1>Niveau introuvable</h1></main>;

  const { data: ls } = await supabase.from("level_subjects").select("subjects(id,name,icon)").eq("level_id", level.id);
  const { data: res } = await supabase.from("resources").select("*, chapters(title,position)").eq("level_id", level.id).order("created_at", { ascending: true });

  const subjects = (ls || []).map((x: any) => x.subjects).filter(Boolean);
  return <LevelLearningClient level={level} subjects={subjects} resources={res || []} />;
}
