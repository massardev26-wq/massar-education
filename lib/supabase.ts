import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
export const TYPES = ["Cours","Résumé","Exercice","Exercice corrigé","Examen","Contrôle continu","Correction","Fiche PDF","Image pédagogique"];
