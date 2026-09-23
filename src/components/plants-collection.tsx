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
        className="flex w-full gap-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-1 sm:ml-auto sm:w-auto sm:rounded-full"
        role="group"
        aria-label="Modo de visualização"
      >
        <button
          type="button"
          onClick={() => changeView("grid")}
          className={cn(
            "inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition sm:flex-none sm:rounded-full sm:py-1.5",
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
            "inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition sm:flex-none sm:rounded-full sm:py-1.5",
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
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      ) : (
        <>
          <PlantListCards rows={rows} className="md:hidden" />
          <PlantListTable rows={rows} className="hidden md:block" />
        </>
      )}
    </div>
  );
}

function PlantListCards({
  rows,
  className,
}: {
  rows: PlantDayToDayRow[];
  className?: string;
}) {
  return (
    <ul className={cn("min-w-0 space-y-1.5", className)}>
      {rows.map((row) => (
        <li key={row.id}>
          <Link
            href={`/plantas/${row.id}`}
            className="block rounded-xl border border-[var(--border)] bg-[var(--card)] px-2.5 py-2 shadow-sm transition active:bg-[var(--card-elevated)]/50 hover:border-[#d4a088]/40"
          >
            <div className="flex items-center justify-between gap-1.5">
              <p className="min-w-0 truncate text-xs leading-tight">
                <span className="font-mono font-semibold text-[#c45c4a]">
                  {row.code}
                </span>
                {row.nickname ? (
                  <span className="font-normal text-[var(--foreground)]">
                    {" "}
                    · {row.nickname}
                  </span>
                ) : null}
              </p>
              <span
                className="max-w-[5.5rem] shrink-0 truncate rounded-md bg-[var(--card-elevated)] px-1.5 py-px text-[9px] font-medium leading-tight text-[var(--muted)]"
                title={phaseLabels[row.phase]}
              >
                {phaseLabels[row.phase]}
              </span>
            </div>
            <dl className="mt-1.5 grid grid-cols-3 gap-x-1.5 gap-y-1 text-[10px] leading-tight text-[var(--muted)]">
              <div className="min-w-0">
                <dt className="text-[9px] font-medium uppercase tracking-wide opacity-75">
                  Rega
                </dt>
                <dd className="truncate tabular-nums">
                  {row.waterDays != null ? `${row.waterDays}d` : "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[9px] font-medium uppercase tracking-wide opacity-75">
                  Adubo
                </dt>
                <dd className="truncate tabular-nums">
                  {row.fertDays != null ? `${row.fertDays}d` : "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[9px] font-medium uppercase tracking-wide opacity-75">
                  Altura
                </dt>
                <dd className="truncate tabular-nums">
                  {row.heightCm ? `${row.heightCm} cm` : "—"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[9px] font-medium uppercase tracking-wide opacity-75">
                  Local
                </dt>
                <dd className="truncate">{row.locationName}</dd>
              </div>
              <div className="min-w-0 col-span-2">
                <dt className="text-[9px] font-medium uppercase tracking-wide opacity-75">
                  Vaso
                </dt>
                <dd className="truncate">{row.potLabel || "—"}</dd>
              </div>
            </dl>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function PlantListTable({
  rows,
  className,
}: {
  rows: PlantDayToDayRow[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm",
        className,
      )}
    >
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
