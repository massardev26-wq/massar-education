"use client";

import { useEffect, useState } from "react";
import { supabase, TYPES } from "@/lib/supabase";

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const nm = (a: any[], id: any) =>
  a.find((x) => x.id === id)?.name || "?";

export default function Admin() {
  const [st, setSt] = useState("load");
  const [em, setEm] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");

  const [D, setD] = useState<any>({
    levels: [],
    subjects: [],
    chapters: [],
    resources: [],
    ads: [],
  });

  const [f, setF] = useState<any>({ type: TYPES[0] });
  const [nl, setNl] = useState({ name: "", cycle: "Primaire" });
  const [ns, setNs] = useState<any>({
    name: "",
    icon: "📘",
    lv: [],
  });
  const [nc, setNc] = useState("");

  // Charger les données
  async function load() {
    try {
      const [levels, subjects, chapters, resources, ads] =
        await Promise.all([
          supabase.from("levels").select("*").order("position"),
          supabase.from("subjects").select("*").order("name"),
          supabase.from("chapters").select("*").order("title"),
          supabase.from("resources").select("*").order("created_at"),
          supabase.from("ads").select("*").order("slot"),
        ]);

      console.log("LOAD LEVELS:", levels.error);
      console.log("LOAD SUBJECTS:", subjects.error);
      console.log("LOAD CHAPTERS:", chapters.error);
      console.log("LOAD RESOURCES:", resources.error);
      console.log("LOAD ADS:", ads.error);

      if (
        levels.error ||
        subjects.error ||
        chapters.error ||
        resources.error ||
        ads.error
      ) {
        setMsg("Erreur de chargement. Consultez la Console.");
      }

      setD({
        levels: levels.data || [],
        subjects: subjects.data || [],
        chapters: chapters.data || [],
        resources: resources.data || [],
        ads: ads.data || [],
      });
    } catch (error) {
      console.error("LOAD ERROR:", error);
      setMsg("Erreur lors du chargement des données.");
    }
  }

  // Vérifier si l'utilisateur est administrateur
  async function check() {
    setSt("load");
    setMsg("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("USER:", user);
      console.log("USER ERROR:", userError);

      if (userError) {
        setMsg("Erreur utilisateur : " + userError.message);
      }

      if (!user) {
        setSt("out");
        return;
      }

      const { data, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      console.log("ADMIN USER ID:", user.id);
      console.log("ADMIN DATA:", data);
      console.log("ADMIN ERROR:", error);

      if (error) {
        setMsg("Erreur Admin : " + error.message);
        setSt("no");
        return;
      }

      if (data) {
        setSt("ok");
        await load();
      } else {
        setMsg("Aucun accès administrateur trouvé pour ce compte.");
        setSt("no");
      }
    } catch (error) {
      console.error("CHECK ERROR:", error);
      setMsg("Erreur de vérification.");
      setSt("out");
    }
  }

  useEffect(() => {
    check();
  }, []);

  // Exécuter une opération
  async function run(
    p: any,
    ok = "Enregistré ✅"
  ) {
    const { error } = await p;

    if (error) {
      console.error("DATABASE ERROR:", error);
      setMsg("Erreur : " + error.message);
    } else {
      setMsg(ok);
    }

    await load();
  }

  // Connexion
  async function login() {
    setMsg("");

    if (!em || !pw) {
      setMsg("Veuillez saisir votre email et votre mot de passe.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: em.trim(),
      password: pw,
    });

    if (error) {
      console.error("LOGIN ERROR:", error);
      setMsg("Connexion impossible : " + error.message);
      return;
    }

    await check();
  }

  // Ajouter une ressource PDF ou image
  async function addRes() {
    if (!f.level_id || !f.subject_id || !f.title) {
      setMsg(
        "Choisissez le niveau, la matière et écrivez un titre."
      );
      return;
    }

    let file_url = null;

    if (f.file) {
      const path =
        Date.now() +
        "-" +
        slug(f.file.name.replace(/\.[^.]+$/, "")) +
        "." +
        f.file.name.split(".").pop();

      const { error } = await supabase.storage
        .from("files")
        .upload(path, f.file);

      if (error) {
        console.error("UPLOAD ERROR:", error);
        setMsg("Erreur d’envoi du fichier : " + error.message);
        return;
      }

      file_url = supabase.storage
        .from("files")
        .getPublicUrl(path).data.publicUrl;
    }

    await run(
      supabase.from("resources").insert({
        level_id: +f.level_id,
        subject_id: +f.subject_id,
        chapter_id: f.chapter_id ? +f.chapter_id : null,
        type: f.type,
        title: f.title,
        description: f.description || null,
        is_premium: !!f.is_premium,
        file_url,
      }),
      "Ressource publiée ✅"
    );

    setF({ type: TYPES[0] });
  }

  // Sélecteur
  const sel = (
    v: any,
    on: any,
    items: any[],
    ph: string
  ) => (
    <select
      value={v || ""}
      onChange={(e) => on(e.target.value)}
    >
      <option value="">{ph}</option>
      {items.map((i) => (
        <option key={i.id} value={i.id}>
          {i.name || i.title}
        </option>
      ))}
    </select>
  );

  // Confirmation suppression
  const ask = (t: string, p: any) =>
    confirm("Supprimer définitivement : " + t + " ?") &&
    run(p, "Supprimé ✅");

  // Chargement
  if (st === "load") {
    return (
      <main className="wrap">
        <p>Chargement…</p>
      </main>
    );
  }

  // Connexion et vérification Admin
  if (st !== "ok") {
    return (
      <main className="wrap">
        <h1>Administration</h1>

        {st === "no" && (
          <p className="msg">
            Ce compte n’est pas administrateur.
          </p>
        )}

        <div className="form">
          <input
            type="email"
            placeholder="Email"
            value={em}
            onChange={(e) => setEm(e.target.value)}
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />

          <button onClick={login}>
            Se connecter
          </button>
        </div>

        {msg && <p className="msg">{msg}</p>}
      </main>
    );
  }

  const chs = D.chapters.filter(
    (c: any) =>
      c.level_id == f.level_id &&
      c.subject_id == f.subject_id
  );

  // Tableau de bord Admin
  return (
    <main className="wrap">
      <h1>Administration Massar</h1>

      <button
        className="alt"
        onClick={async () => {
          await supabase.auth.signOut();
          setSt("out");
          setMsg("");
        }}
      >
        Se déconnecter
      </button>

      {msg && <p className="msg">{msg}</p>}

      {/* 1. Ressources */}
      <h2>1. Ajouter une ressource (PDF ou image)</h2>

      <div className="form">
        {sel(
          f.level_id,
          (v: any) =>
            setF({ ...f, level_id: v, chapter_id: "" }),
          D.levels,
          "Niveau"
        )}

        {sel(
          f.subject_id,
          (v: any) =>
            setF({ ...f, subject_id: v, chapter_id: "" }),
          D.subjects,
          "Matière"
        )}

        {sel(
          f.chapter_id,
          (v: any) => setF({ ...f, chapter_id: v }),
          chs,
          "Chapitre (facultatif)"
        )}

        <select
          value={f.type}
          onChange={(e) =>
            setF({ ...f, type: e.target.value })
          }
        >
          {TYPES.map((t: string) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <input
          placeholder="Titre"
          value={f.title || ""}
          onChange={(e) =>
            setF({ ...f, title: e.target.value })
          }
        />

        <input
          placeholder="Description"
          value={f.description || ""}
          onChange={(e) =>
            setF({ ...f, description: e.target.value })
          }
        />

        <label>
          <input
            type="checkbox"
            checked={!!f.is_premium}
            onChange={(e) =>
              setF({
                ...f,
                is_premium: e.target.checked,
              })
            }
          />
          Premium
        </label>

        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) =>
            setF({
              ...f,
              file: e.target.files?.[0],
            })
          }
        />

        <button onClick={addRes}>
          Publier
        </button>
      </div>

      {/* 2. Ressources publiées */}
      <h2>
        2. Ressources publiées ({D.resources.length})
      </h2>

      {D.resources
        .slice()
        .reverse()
        .map((r: any) => (
          <div className="row" key={r.id}>
            <span>
              <b>{r.title}</b> – {nm(D.levels, r.level_id)} /
              {nm(D.subjects, r.subject_id)} / {r.type}
              {r.is_premium ? " 🔒" : ""}
            </span>

            <span>
              <button
                className="alt"
                onClick={() => {
                  const t = prompt(
                    "Nouveau titre :",
                    r.title
                  );

                  if (t) {
                    run(
                      supabase
                        .from("resources")
                        .update({ title: t })
                        .eq("id", r.id)
                    );
                  }
                }}
              >
                Modifier
              </button>{" "}

              <button
                className="alt"
                onClick={() =>
                  run(
                    supabase
                      .from("resources")
                      .update({
                        is_premium: !r.is_premium,
                      })
                      .eq("id", r.id)
                  )
                }
              >
                {r.is_premium
                  ? "Rendre gratuit"
                  : "Rendre premium"}
              </button>{" "}

              <button
                className="del"
                onClick={() =>
                  ask(
                    r.title,
                    supabase
                      .from("resources")
                      .delete()
                      .eq("id", r.id)
                  )
                }
              >
                Supprimer
              </button>
            </span>
          </div>
        ))}

      {/* 3. Chapitres */}
      <h2>3. Chapitres</h2>

      <div className="form">
        {sel(
          f.level_id,
          (v: any) => setF({ ...f, level_id: v }),
          D.levels,
          "Niveau"
        )}

        {sel(
          f.subject_id,
          (v: any) => setF({ ...f, subject_id: v }),
          D.subjects,
          "Matière"
        )}

        <input
          placeholder="Titre du chapitre"
          value={nc}
          onChange={(e) => setNc(e.target.value)}
        />

        <button
          onClick={() => {
            if (nc && f.level_id && f.subject_id) {
              run(
                supabase.from("chapters").insert({
                  level_id: +f.level_id,
                  subject_id: +f.subject_id,
                  title: nc,
                }),
                "Chapitre ajouté ✅"
              );

              setNc("");
            } else {
              setMsg(
                "Choisissez niveau, matière et titre."
              );
            }
          }}
        >
          Ajouter
        </button>
      </div>

      {chs.map((c: any) => (
        <div className="row" key={c.id}>
          <span>{c.title}</span>

          <button
            className="del"
            onClick={() =>
              ask(
                c.title,
                supabase
                  .from("chapters")
                  .delete()
                  .eq("id", c.id)
              )
            }
          >
            Supprimer
          </button>
        </div>
      ))}

      {/* 4. Matières */}
      <h2>4. Matières</h2>

      <div className="form">
        <input
          placeholder="Nom de la matière"
          value={ns.name}
          onChange={(e) =>
            setNs({ ...ns, name: e.target.value })
          }
        />

        <input
          style={{ width: 70 }}
          value={ns.icon}
          onChange={(e) =>
            setNs({ ...ns, icon: e.target.value })
          }
        />

        {D.levels.map((l: any) => (
          <label key={l.id}>
            <input
              type="checkbox"
              checked={ns.lv.includes(l.id)}
              onChange={(e) =>
                setNs({
                  ...ns,
                  lv: e.target.checked
                    ? [...ns.lv, l.id]
                    : ns.lv.filter(
                        (x: number) => x !== l.id
                      ),
                })
              }
            />
            {l.name}
          </label>
        ))}

        <button
          onClick={async () => {
            if (!ns.name.trim()) {
              setMsg("Écrivez le nom de la matière.");
              return;
            }

            const { data, error } = await supabase
              .from("subjects")
              .insert({
                name: ns.name,
                icon: ns.icon,
              })
              .select()
              .single();

            if (error) {
              setMsg("Erreur : " + error.message);
              return;
            }

            if (ns.lv.length > 0) {
              const { error: linkError } =
                await supabase
                  .from("level_subjects")
                  .insert(
                    ns.lv.map((l: number) => ({
                      level_id: l,
                      subject_id: data.id,
                    }))
                  );

              if (linkError) {
                setMsg(
                  "Matière ajoutée, mais liaison impossible : " +
                    linkError.message
                );
                await load();
                return;
              }
            }

            setNs({
              name: "",
              icon: "📘",
              lv: [],
            });

            setMsg("Matière ajoutée ✅");
            await load();
          }}
        >
          Ajouter la matière
        </button>
      </div>

      {D.subjects.map((s: any) => (
        <div className="row" key={s.id}>
          <span>
            {s.icon} {s.name}
          </span>

          <button
            className="del"
            onClick={() =>
              ask(
                s.name,
                supabase
                  .from("subjects")
                  .delete()
                  .eq("id", s.id)
              )
            }
          >
            Supprimer
          </button>
        </div>
      ))}

      {/* 5. Niveaux */}
      <h2>5. Niveaux</h2>

      <div className="form">
        <input
          placeholder="Nom du niveau"
          value={nl.name}
          onChange={(e) =>
            setNl({ ...nl, name: e.target.value })
          }
        />

        <select
          value={nl.cycle}
          onChange={(e) =>
            setNl({ ...nl, cycle: e.target.value })
          }
        >
          <option>Primaire</option>
          <option>Collège</option>
          <option>Lycée</option>
        </select>

        <button
          onClick={() => {
            if (!nl.name.trim()) {
              setMsg("Écrivez le nom du niveau.");
              return;
            }

            run(
              supabase.from("levels").insert({
                name: nl.name,
                slug: slug(nl.name),
                cycle: nl.cycle,
                position: 100,
              }),
              "Niveau ajouté ✅"
            );
          }}
        >
          Ajouter
        </button>
      </div>

      {D.levels.map((l: any) => (
        <div className="row" key={l.id}>
          <span>
            {l.cycle} – {l.name}
          </span>

          <button
            className="del"
            onClick={() =>
              ask(
                l.name,
                supabase
                  .from("levels")
                  .delete()
                  .eq("id", l.id)
              )
            }
          >
            Supprimer
          </button>
        </div>
      ))}

      {/* 6. Publicités */}
      <h2>6. Gestion des publicités</h2>

      <p>
        Activez ou désactivez chaque emplacement.
        Collez le code fourni par Google AdSense seulement
        quand votre compte sera validé.
      </p>

      {D.ads.map((a: any) => (
        <div
          className="card"
          key={a.slot}
          style={{ marginBottom: 10 }}
        >
          <label>
            <input
              type="checkbox"
              checked={a.enabled}
              onChange={(e) =>
                run(
                  supabase
                    .from("ads")
                    .update({
                      enabled: e.target.checked,
                    })
                    .eq("slot", a.slot)
                )
              }
            />

            <b>{a.label}</b>
          </label>

          <textarea
            style={{
              width: "100%",
              marginTop: 8,
            }}
            rows={3}
            placeholder="Code AdSense (facultatif)"
            defaultValue={a.code}
            onBlur={(e) =>
              run(
                supabase
                  .from("ads")
                  .update({ code: e.target.value })
                  .eq("slot", a.slot)
              )
            }
          />
        </div>
      ))}
    </main>
  );
}