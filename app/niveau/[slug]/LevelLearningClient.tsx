"use client";

import { useMemo, useState } from "react";

const BLUE = "#0645b8";
const NAVY = "#08245f";

const styles: Record<string, React.CSSProperties> = {
  page: {
    color: NAVY, 
    background: "#f7faff",
    padding: "16px 1.2% 28px",
    fontFamily: "Arial, sans-serif",
  },
  breadcrumb: { 
    color: BLUE,
    fontWeight: 700,
    fontSize: 14,
    margin: "0 0 14px",
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  banner: {
    borderRadius: 18,
    padding: "24px 30px",
    color: "white",
    background: "linear-gradient(105deg,#0645b8,#087fe5 60%,#063a96)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    boxShadow: "0 5px 15px #124a9b20",
    marginBottom: 16,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(240px, 23%) minmax(0, 1fr)",
    gap: 14,
    alignItems: "stretch",
  },
  sidebar: {
    border: "1px solid #b9cce8",
    borderRadius: 17,
    background: "white",
    overflow: "hidden",
    minHeight: 300,
  },
  sideHead: {
    padding: "16px 20px",
    background: "linear-gradient(90deg,#073b8d,#0756bd)",
    color: "white",
    fontWeight: 900,
    fontSize: 22,
  },
  main: {
    border: "1px solid #b9cce8",
    borderRadius: 17,
    padding: 12,
    background: "white",
    minWidth: 0,
  },
  section: {
    border: "1px solid #b8cce9",
    borderRadius: 14,
    padding: 13,
    background: "#fff",
    marginTop: 14,
    minWidth: 0,
  },
};

export default function LevelLearningClient({
  level,
  subjects,
  chapters,
  resources,
}: {
  level: any;
  subjects: any[];
  chapters: any[];
  resources: any[];
}) {
  const [subjectId, setSubjectId] = useState(String(subjects[0]?.id ?? ""));
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [viewingResource, setViewingResource] = useState<any>(null);

  const subject =
    subjects.find((item) => String(item.id) === subjectId) || subjects[0];

  const subjectResources = useMemo(
    () => resources.filter((resource) => String(resource.subject_id) === String(subject?.id)),
    [resources, subject?.id]
  );

  const subjectChapters = useMemo(
