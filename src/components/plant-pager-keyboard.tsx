"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Atalhos ← → para mudar de planta (quando não está digitando). */
export function PlantPagerKeyboard({
  prevId,
  nextId,
}: {
  prevId: string | null;
  nextId: string | null;
}) {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.key === "ArrowLeft" && prevId) {
        router.push(`/plantas/${prevId}`);
      }
      if (e.key === "ArrowRight" && nextId) {
        router.push(`/plantas/${nextId}`);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [prevId, nextId, router]);

  return null;
}
