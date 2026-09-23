"use client";

import { useState, useTransition } from "react";
import type {
  CultivationLocation,
  Plant,
  PlantOrigin,
  PlantPhase,
  PlantStatus,
} from "@prisma/client";
import { updatePlantFromForm } from "@/app/actions";
import { originLabels, phaseLabels, statusLabels } from "@/lib/labels";
import { formatDate } from "@/lib/utils";
import { suggestedPhaseLabel } from "@/lib/plant-phase-auto";
import { formatPlantPot } from "@/lib/pot-sizes";
import { PotFields } from "@/components/pot-fields";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/collapsible-card";
import {
  plantDetailCardClass,
  PlantSectionTitle,
} from "@/lib/plant-detail-section-theme";
import { Pencil, X } from "lucide-react";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-stone-200 bg-white/90 px-3 py-2.5 text-sm outline-none transition focus:border-[#d4a088] focus:ring-2 focus:ring-[#c45c4a]/15";

type ParentOption = { id: string; code: string; nickname: string | null };

type PlantEditFormProps = {
  plant: Plant & {
    location: CultivationLocation | null;
    parentMale: ParentOption | null;
    parentFemale: ParentOption | null;
  };
  locations: CultivationLocation[];
  parentOptions: ParentOption[];
};

function toDateInputValue(date: Date) {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function enumSelectOptions<T extends string>(
  labels: Record<T, string>,
): { value: T; label: string }[] {
  return (Object.keys(labels) as T[]).map((value) => ({
    value,
    label: labels[value],
  }));
}

export function PlantEditForm({
  plant,
  locations,
  parentOptions,
}: PlantEditFormProps) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  const headerActions = !editing ? (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => setEditing(true)}
    >
      <Pencil className="h-4 w-4" />
      Editar
    </Button>
  ) : (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => setEditing(false)}
      disabled={pending}
    >
      <X className="h-4 w-4" />
      Fechar
    </Button>
  );

  return (
    <CollapsibleCard
      className={plantDetailCardClass("dados")}
      title={<PlantSectionTitle section="dados">Dados da planta</PlantSectionTitle>}
      description="Vaso, altura, fase, local e genealogia."
      defaultOpenDesktop
      defaultOpenMobile={false}
      headerActions={headerActions}
      contentClassName="pt-0"
    >
        {!editing ? (
          <dl className="space-y-0 text-sm">
            <DetailRow label="Código" value={plant.code} />
            <DetailRow label="Apelido" value={plant.nickname ?? "—"} />
            <DetailRow
              label="Altura"
              value={plant.heightCm ? `${plant.heightCm} cm` : "—"}
            />
            <DetailRow
              label="Vaso / pote"
              value={formatPlantPot(plant) ?? "—"}
            />
            <DetailRow label="Chegada" value={formatDate(plant.arrivedAt)} />
            <DetailRow label="Fase" value={phaseLabels[plant.phase]} />
            <DetailRow label="Estado" value={statusLabels[plant.status]} />
            <DetailRow label="Origem" value={originLabels[plant.origin]} />
            <DetailRow
              label="Sol"
              value={`~${plant.sunExposurePercent}%`}
            />
            <DetailRow label="Local" value={plant.location?.name ?? "—"} />
            <DetailRow
              label="Substrato"
              value={plant.substrateNotes ?? "—"}
            />
            <DetailRow
              label="Mãe (♀)"
              value={plant.parentFemale?.code ?? "—"}
            />
            <DetailRow
              label="Pai (♂)"
              value={plant.parentMale?.code ?? "—"}
            />
          </dl>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              startTransition(async () => {
                await updatePlantFromForm(plant.id, fd);
                setEditing(false);
              });
            }}
          >
            <Field label="Código">
              <input
                className={inputClass + " bg-stone-50 text-stone-500"}
                value={plant.code}
                readOnly
                disabled
              />
              <p className="mt-1 text-xs text-stone-500">
                O código não pode ser alterado aqui.
              </p>
            </Field>

            <Field label="Apelido">
              <input
                name="nickname"
                className={inputClass}
                defaultValue={plant.nickname ?? ""}
                placeholder="Ex.: Muda janela sul"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Altura (cm)">
                <input
                  name="heightCm"
                  type="number"
                  step="0.1"
                  min="0"
                  className={inputClass}
                  defaultValue={plant.heightCm ?? ""}
                />
              </Field>
              <Field label="Data de chegada">
                <input
                  name="arrivedAt"
                  type="date"
                  className={inputClass}
                  defaultValue={toDateInputValue(plant.arrivedAt)}
                  required
                />
              </Field>
            </div>

            <label className="flex items-start gap-2 rounded-xl border border-stone-200 bg-stone-50/80 px-3 py-2.5 text-sm">
              <input
                type="checkbox"
                name="autoPhase"
                defaultChecked
                className="mt-0.5 rounded border-stone-300"
              />
              <span>
                <span className="font-medium text-stone-800">
                  Fase automática pela altura
                </span>
                <span className="block text-xs text-stone-600">
                  Ao salvar, ajusta a fase conforme a altura (exceto recuperação
                  e dormência). Sugestão atual:{" "}
                  {suggestedPhaseLabel(plant.heightCm) ?? "informe a altura"}.
                </span>
              </span>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Fase (manual se desmarcar automático)">
                <select
                  name="phase"
                  className={inputClass}
                  defaultValue={plant.phase}
                >
                  {enumSelectOptions(phaseLabels).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Estado de saúde">
                <select
                  name="status"
                  className={inputClass}
                  defaultValue={plant.status}
                >
                  {enumSelectOptions(statusLabels).map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Origem">
              <select
                name="origin"
                className={inputClass}
                defaultValue={plant.origin}
              >
                {enumSelectOptions(originLabels).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Exposição ao sol (%)">
              <input
                name="sunExposurePercent"
                type="number"
                min="0"
                max="100"
                className={inputClass}
                defaultValue={plant.sunExposurePercent}
              />
            </Field>

            <Field label="Local de cultivo">
              <select
                name="locationId"
                className={inputClass}
                defaultValue={plant.locationId ?? ""}
              >
                <option value="">— Sem local —</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                    {loc.exposedToRain ? " (exposta à chuva)" : " (protegida)"}
                  </option>
                ))}
              </select>
            </Field>

            <PotFields
              defaultPreset={plant.potPreset ?? ""}
              defaultDiameter={plant.potDiameterCm ?? ""}
              defaultVolume={plant.potVolumeLiters ?? ""}
              defaultLabel={plant.potLabel ?? ""}
            />

            <Field label="Substrato / observações">
              <textarea
                name="substrateNotes"
                rows={3}
                className={inputClass}
                defaultValue={plant.substrateNotes ?? ""}
                placeholder="Mix, proporções, último replantio…"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mãe (planta ♀)">
                <select
                  name="parentFemaleId"
                  className={inputClass}
                  defaultValue={plant.parentFemaleId ?? ""}
                >
                  <option value="">Desconhecida / externa</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code}
                      {p.nickname ? ` — ${p.nickname}` : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Pai (planta ♂)">
                <select
                  name="parentMaleId"
                  className={inputClass}
                  defaultValue={plant.parentMaleId ?? ""}
                >
                  <option value="">Desconhecido / externo</option>
                  {parentOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code}
                      {p.nickname ? ` — ${p.nickname}` : ""}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? "Salvando…" : "Salvar alterações"}
            </Button>
          </form>
        )}
    </CollapsibleCard>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      {children}
    </label>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-stone-100 py-2.5 last:border-0">
      <dt className="text-stone-500">{label}</dt>
      <dd className="text-right font-medium text-stone-800">{value}</dd>
    </div>
  );
}
