
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function VisitTracker() {
  const pathname = usePathname();
  const lastPath = useRef("");

  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;

    lastPath.current = pathname;

    let visitorId = localStorage.getItem("massar_visitor_id");

    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem("massar_visitor_id", visitorId);
    }

    supabase.from("site_visits").insert({
      visitor_id: visitorId,
      page_path: pathname,
    }).then(({ error }) => {
      if (error) {
        console.error("Erreur tracking visite:", error);
      }
    });
  }, [pathname]);

  return null;
}
