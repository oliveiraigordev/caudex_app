"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import { PlantCard } from "@/components/plant-card";
import { phaseLabels, statusLabels } from "@/lib/labels";
import type { PlantDayToDayRow } from "@/lib/plant-day-to-day";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Plant, PlantEvent, PlantPhoto, CultivationLocation } from "@prisma/client";

type PlantForCard = Plant & {
  events: PlantEvent[];
  photos: PlantPhoto[];
  location: CultivationLocation | null;
};

const STORAGE_KEY = "caudexia.plantas.view";

export function PlantsCollection({
  plants,
  rows,
}: {
  plants: PlantForCard[];
  rows: PlantDayToDayRow[];
}) {
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "grid" || saved === "list") setView(saved);
  }, []);

  function changeView(next: "grid" | "list") {
    setView(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <div className="space-y-4">
      <div
        className="flex items-center justify-end gap-1 rounded-full border border-[var(--border)] bg-[var(--card)] p-1"
        role="group"
        aria-label="Modo de visualização"
      >
        <button
          type="button"
          onClick={() => changeView("grid")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition",
            view === "grid"
              ? "bg-[var(--nav-active)] text-[var(--background)] dark:text-[#1a1412]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]",
          )}
          aria-pressed={view === "grid"}
        >
          <LayoutGrid className="h-4 w-4" />
          Quadros
        </button>
        <button
          type="button"
          onClick={() => changeView("list")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition",
            view === "list"
              ? "bg-[var(--nav-active)] text-[var(--background)] dark:text-[#1a1412]"
              : "text-[var(--muted)] hover:text-[var(--foreground)]",
          )}
          aria-pressed={view === "list"}
        >
          <List className="h-4 w-4" />
          Lista
        </button>
      </div>

      {view === "grid" ? (
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      ) : (
        <PlantListTable rows={rows} />
      )}
    </div>
  );
}

function PlantListTable({ rows }: { rows: PlantDayToDayRow[] }) {
  return (
    <div className="min-w-0 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--card-elevated)]/60 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            <th className="px-3 py-3">Código</th>
            <th className="px-3 py-3">Apelido</th>
            <th className="px-3 py-3">Fase</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Rega</th>
            <th className="px-3 py-3">Adubo</th>
            <th className="px-3 py-3">Local</th>
            <th className="px-3 py-3">Vaso</th>
            <th className="px-3 py-3">Altura</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-[var(--border)]/80 transition last:border-0 hover:bg-[var(--card-elevated)]/40"
            >
              <td className="px-3 py-2.5 font-medium">
                <Link
                  href={`/plantas/${row.id}`}
                  className="text-[#c45c4a] hover:underline"
                >
                  {row.code}
                </Link>
              </td>
              <td className="max-w-[8rem] truncate px-3 py-2.5 text-[var(--foreground)]">
                {row.nickname ?? "—"}
              </td>
              <td className="px-3 py-2.5 whitespace-nowrap text-[var(--muted)]">
                {phaseLabels[row.phase]}
              </td>
              <td className="px-3 py-2.5 whitespace-nowrap text-[var(--muted)]">
                {statusLabels[row.status]}
              </td>
              <td className="px-3 py-2.5 whitespace-nowrap">
                {row.lastWaterAt
                  ? `${row.waterDays}d · ${formatDate(row.lastWaterAt)}`
                  : "—"}
              </td>
              <td className="px-3 py-2.5 whitespace-nowrap">
                {row.lastFertAt
                  ? `${row.fertDays}d · ${formatDate(row.lastFertAt)}`
                  : "—"}
              </td>
              <td className="max-w-[6rem] truncate px-3 py-2.5 text-[var(--muted)]">
                {row.locationName}
              </td>
              <td className="max-w-[5rem] truncate px-3 py-2.5 text-[var(--muted)]">
                {row.potLabel}
              </td>
              <td className="px-3 py-2.5 whitespace-nowrap text-[var(--muted)]">
                {row.heightCm ? `${row.heightCm} cm` : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
