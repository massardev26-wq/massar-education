
export const metadata = {
  title: "À propos | Association Massar",
  description: "Découvrez l'Association Massar et sa mission éducative.",
};

export default function AProposPage() {
  return (
    <main style={{ maxWidth: 900, margin: "auto", padding: "40px 20px", color: "#123579" }}>
      <h1>À propos de l'Association Massar</h1>

      <p>
        Bienvenue sur Massar Education, un espace éducatif
        dédié à l'accompagnement des élèves.
      </p>

      <h2>Notre mission</h2>
      <p>
        Notre objectif est de faciliter l'apprentissage des
        élèves à travers des cours, des exercices, des examens
        et des corrections adaptés aux différents niveaux scolaires.
      </p>

      <h2>Nos ressources</h2>
      <ul>
        <li>Cours et résumés scolaires</li>
        <li>Exercices de français, arabe et mathématiques</li>
        <li>Examens et évaluations</li>
        <li>Corrections et activités pédagogiques</li>
      </ul>

      <p>
        Association Massar pour l'Éducation et le Développement.
      </p>
    </main>
  );
}
