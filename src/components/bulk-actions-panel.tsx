"use client";

import { useMemo, useState, useTransition } from "react";
import { createBulkEvents } from "@/app/actions";
import { fertilizerTypeOptions } from "@/lib/event-metadata";
import { PotFields } from "@/components/pot-fields";
import { toDatetimeLocalInputValue } from "@/lib/utils";
import { CollapsibleCard } from "@/components/collapsible-card";
import { Button } from "@/components/ui/button";
import { Droplets, FlaskConical, Shovel } from "lucide-react";

type PlantRow = {
  id: string;
  code: string;
  nickname: string | null;
};

type BulkMode = "REGA" | "ADUBACAO" | "REPLANTIO";

const inputClass =
  "mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c45c4a]/15";

export function BulkActionsPanel({ plants }: { plants: PlantRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<BulkMode>("REGA");
  const [occurredAt, setOccurredAt] = useState(() =>
    toDatetimeLocalInputValue(new Date()),
  );
  const [notes, setNotes] = useState("");
  const [fertilizerType, setFertilizerType] = useState<string>(
    fertilizerTypeOptions[0],
  );
  const [fertilizerDose, setFertilizerDose] = useState("");
  const [customFertilizer, setCustomFertilizer] = useState("");
  const [repotSubstrate, setRepotSubstrate] = useState("");
  const [pending, startTransition] = useTransition();

  const allSelected = selected.size === plants.length && plants.length > 0;

  const selectedCodes = useMemo(
    () =>
      plants
        .filter((p) => selected.has(p.id))
        .map((p) => p.code)
        .join(", "),
    [plants, selected],
  );

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(plants.map((p) => p.id)));
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const ids = Array.from(selected);
    const fd = new FormData(e.currentTarget);
    const fertType =
      fertilizerType === "Outro"
        ? customFertilizer.trim() || "Outro"
        : fertilizerType;

    const potPreset = String(fd.get("potPreset") ?? "");
    const potDiameter = String(fd.get("potDiameterCm") ?? "").trim();
    const potVolume = String(fd.get("potVolumeLiters") ?? "").trim();
    const potLabel = String(fd.get("potLabel") ?? "").trim();

    startTransition(async () => {
      await createBulkEvents({
        plantIds: ids,
        type: mode,
        occurredAt,
        notes: notes.trim() || undefined,
        fertilizerType: mode === "ADUBACAO" ? fertType : undefined,
        fertilizerDose:
          mode === "ADUBACAO" ? fertilizerDose.trim() || undefined : undefined,
        potPreset: mode === "REPLANTIO" ? potPreset : undefined,
        potDiameterCm: potDiameter ? Number(potDiameter) : undefined,
        potVolumeLiters: potVolume ? Number(potVolume) : undefined,
        potLabel: potLabel || undefined,
        substrateNotes:
          mode === "REPLANTIO" ? repotSubstrate.trim() || undefined : undefined,
      });
      setNotes("");
      setFertilizerDose("");
    });
  }

  const submitLabel =
    mode === "REGA"
      ? `Registrar rega em ${selected.size} planta(s)`
      : mode === "ADUBACAO"
        ? `Registrar adubação em ${selected.size} planta(s)`
        : `Registrar replantio em ${selected.size} planta(s)`;

  return (
    <CollapsibleCard
      className="border-[#d4a088]/30"
      title="Ações em massa"
      description="Selecione as mudas, data/hora (padrão: agora) e registre de uma vez."
      defaultOpenDesktop={false}
      defaultOpenMobile={false}
    >
        <form className="space-y-4" onSubmit={submit}>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={mode === "REGA" ? "default" : "secondary"}
              onClick={() => setMode("REGA")}
            >
              <Droplets className="h-4 w-4" />
              Rega
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "ADUBACAO" ? "default" : "secondary"}
              onClick={() => setMode("ADUBACAO")}
            >
              <FlaskConical className="h-4 w-4" />
              Adubação
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "REPLANTIO" ? "default" : "secondary"}
              onClick={() => setMode("REPLANTIO")}
            >
              <Shovel className="h-4 w-4" />
              Replantio
            </Button>
          </div>

          <div className="max-h-48 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50/50 p-2">
            <label className="flex cursor-pointer items-center gap-2 border-b border-stone-200/80 px-2 py-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="rounded border-stone-300"
              />
              Selecionar todas ({plants.length})
            </label>
            <ul className="divide-y divide-stone-100">
              {plants.map((p) => (
                <li key={p.id}>
                  <label
                    className="flex cursor-pointer items-center gap-2 px-2 py-2 text-sm hover:bg-white/80"
                  >
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                      className="rounded border-stone-300"
                    />
                    <span className="font-mono font-semibold">{p.code}</span>
                    <span className="truncate text-stone-600">
                      {p.nickname ?? "—"}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <label className="block text-sm font-medium text-stone-700">
            Data e hora do registro
            <input
              type="datetime-local"
              className={inputClass}
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
            />
          </label>

          {mode === "ADUBACAO" && (
            <>
              <label className="block text-sm font-medium text-stone-700">
                Tipo de adubo
                <select
                  className={inputClass}
                  value={fertilizerType}
                  onChange={(e) => setFertilizerType(e.target.value)}
                >
                  {fertilizerTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
              {fertilizerType === "Outro" && (
                <label className="block text-sm font-medium text-stone-700">
                  Descreva o adubo
                  <input
                    className={inputClass}
                    value={customFertilizer}
                    onChange={(e) => setCustomFertilizer(e.target.value)}
                  />
                </label>
              )}
              <label className="block text-sm font-medium text-stone-700">
                Dose / como aplicou
                <input
                  className={inputClass}
                  value={fertilizerDose}
                  onChange={(e) => setFertilizerDose(e.target.value)}
                />
              </label>
            </>
          )}

          {mode === "REPLANTIO" && (
            <>
              <PotFields defaultPreset="P11" />
              <label className="block text-sm font-medium text-stone-700">
                Substrato novo (atualiza em todas selecionadas)
                <textarea
                  className={inputClass}
                  rows={2}
                  value={repotSubstrate}
                  onChange={(e) => setRepotSubstrate(e.target.value)}
                  placeholder="Ex.: casca de pinus + perlita 2:1"
                />
              </label>
            </>
          )}

          <label className="block text-sm font-medium text-stone-700">
            Observações (opcional)
            <textarea
              className={inputClass}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={pending || selected.size === 0}
          >
            {pending ? "Salvando…" : submitLabel}
          </Button>
          {selected.size > 0 && (
            <p className="break-words text-xs text-stone-500">
              Selecionadas: {selectedCodes}
            </p>
          )}
        </form>
    </CollapsibleCard>
  );
}
