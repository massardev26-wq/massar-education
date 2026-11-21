import { supabase } from "@/lib/supabase";
import LevelLearningClient from "./LevelLearningClient";

export const dynamic = "force-dynamic";

export default async function Level({ params }: { params: { slug: string } }) {
  const { data: level } = await supabase
    .from("levels")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!level) {
    return (
      <main className="wrap">
        <h1>Niveau introuvable</h1>
      </main>
    );
  }

  const [{ data: levelSubjects }, { data: directChapters }, { data: chapterLinks }] =
    await Promise.all([
      supabase
        .from("level_subjects")
        .select("subjects(id,name,icon)")
        .eq("level_id", level.id),
      supabase
        .from("chapters")
        .select("id,title,position,subject_id")
        .eq("level_id", level.id)
        .order("position", { ascending: true }),
      supabase
        .from("chapter_levels")
        .select("chapter_id")
        .eq("level_id", level.id),
    ]);

  // Récupérer les chapitres du niveau, y compris ceux qui sont partagés
  // avec d'autres niveaux via la table chapter_levels.
  const chapterIds = Array.from(
    new Set([
      ...(directChapters || []).map((chapter: any) => chapter.id),
      ...(chapterLinks || []).map((link: any) => link.chapter_id),
    ])
  );

  let linkedChapters: any[] = directChapters || [];
  if (chapterIds.length) {
    const { data } = await supabase
      .from("chapters")
      .select("id,title,position,subject_id")
      .in("id", chapterIds)
      .order("position", { ascending: true });
    if (data) linkedChapters = data;
  }

  // Les ressources sans chapitre restent propres au niveau courant.
  // Les ressources avec chapitre sont récupérées par chapter_id, même
  // si leur level_id correspond à un autre niveau.
  const [{ data: ownResources }, { data: sharedChapterResources }] =
    await Promise.all([
      supabase
        .from("resources")
        .select("*, chapters(id,title,position)")
        .eq("level_id", level.id)
        .order("created_at", { ascending: true }),
      chapterIds.length
        ? supabase
            .from("resources")
            .select("*, chapters(id,title,position)")
            .in("chapter_id", chapterIds)
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [] as any[] }),
    ]);

  const resourcesById = new Map<string, any>();
  [...(ownResources || []), ...(sharedChapterResources || [])].forEach(
    (resource: any) => resourcesById.set(String(resource.id), resource)
  );

  const subjects = (levelSubjects || [])
    .map((item: any) => item.subjects)
    .filter(Boolean);

  return (
    <LevelLearningClient
      level={level}
      subjects={subjects}
      chapters={linkedChapters || []}
      resources={Array.from(resourcesById.values())}
    />
  );
}
