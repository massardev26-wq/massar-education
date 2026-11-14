"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

const BLUE = "#0645b8";
const NAVY = "#08245f";

type Subject = {
  id: string | number;
  name?: string;
  title?: string;
};

type Resource = {
  id?: string | number;
  subjectId?: string | number;
  title?: string;
  name?: string;
  description?: string;
  type?: string;
};

type LevelLearningClientProps = {
  level: any;
  subjects: Subject[];
  resources: Resource[];
};

const styles: Record<string, CSSProperties> = {
  page: {
    color: NAVY,
    background: "#f7faff",
    padding: "16px 1.2% 28px",
    fontFamily: "Arial, sans-serif",
    minHeight: "100vh",
    boxSizing: "border-box",
  },
  breadcrumb: {
    color: BLUE,
    fontWeight: 700,
    fontSize: 14,
    margin: "0 0 14px",
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
  bannerTitle: {
    margin: 0,
    fontSize: "clamp(22px, 3vw, 32px)",
    fontWeight: 900,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 23%) minmax(0, 1fr)",
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
    fontSize: 20,
  },
  subjectButton: {
    display: "block",
    width: "100%",
    padding: "13px 16px",
    border: "none",
    borderBottom: "1px solid #edf2fa",
    textAlign: "right",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  main: {
    border: "1px solid #b9cce8",
    borderRadius: 17,
