"use client";

import { useMemo, useState } from "react";
import type { CultivationLocation, PlantPhase } from "@prisma/client";
import { PotFields } from "@/components/pot-fields";
import { Button } from "@/components/ui/button";
import { originLabels, phaseLabels } from "@/lib/labels";
import { nextPlantCodes } from "@/lib/plant-code";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-stone-200 bg-white/90 px-3 py-2.5 text-sm outline-none transition focus:border-[#d4a088] focus:ring-2 focus:ring-[#c45c4a]/15";

type PlantOption = { id: string; code: string; nickname: string | null };

type PollinationOption = {
  id: string;
  occurredAt: string;
  title: string;
  motherId: string;
  motherCode: string;
  motherNickname: string | null;
  malePlantId: string | null;
  malePlantCode: string | null;
  maleExternal: string | null;
};

type CreationType = "SEMENTE" | "MUDA" | "COMPRA";

function todayDateInputValue() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const creationOptions: { value: CreationType; label: string; hint: string }[] = [
  {
    value: "SEMENTE",
    label: originLabels.SEMENTE,
    hint: "Data de plantio, polinização (pai e mãe) e pote",
  },
  {
    value: "MUDA",
    label: originLabels.MUDA,
    hint: "Data de plantio, planta doadora e pote",
  },
  {
    value: "COMPRA",
    label: originLabels.COMPRA,
    hint: "Data da compra, fase, altura e pote",
  },
];

const compraPhases: PlantPhase[] = [
  "MUDA_SEMENTE",
  "JOVEM",
  "ADULTA",
  "RECUPERACAO",
];

export function NewPlantForm({
  locations,
  plants,
  pollinations,
  existingCodes,
  createAction,
}: {
  locations: CultivationLocation[];
  plants: PlantOption[];
  pollinations: PollinationOption[];
  existingCodes: string[];
  createAction: (formData: FormData) => void | Promise<void>;
}) {
  const [creationType, setCreationType] = useState<CreationType>("SEMENTE");
  const [quantity, setQuantity] = useState(1);
  const [pollinationEventId, setPollinationEventId] = useState("");

  const codesPreview = useMemo(
    () => nextPlantCodes(existingCodes, Math.min(50, Math.max(1, quantity))),
    [existingCodes, quantity],
  );

  const selectedPollination = pollinations.find((p) => p.id === pollinationEventId);

  const maleLabel = selectedPollination
    ? selectedPollination.malePlantCode ??
      selectedPollination.maleExternal ??
      (selectedPollination.malePlantId ? "Pai cadastrado" : "—")
    : "—";

  return (
    <form action={createAction} className="space-y-6">
      <input type="hidden" name="creationType" value={creationType} />

      <div className="space-y-3">
        <p className="text-sm font-medium text-stone-700">Tipo de criação</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {creationOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCreationType(opt.value)}
              className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                creationType === opt.value
                  ? "border-[#c45c4a] bg-[#c45c4a]/8 ring-2 ring-[#c45c4a]/15"
                  : "border-stone-200 bg-white/80 hover:border-stone-300"
              }`}
            >
              <span className="font-medium text-stone-800">{opt.label}</span>
              <span className="mt-1 block text-xs text-stone-500">{opt.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-stone-700">
          Quantidade
          <input
            name="quantity"
            type="number"
            min={1}
            max={50}
            required
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value) || 1)}
            className={inputClass}
          />
        </label>
        <div className="text-sm">
          <p className="font-medium text-stone-700">Códigos gerados</p>
          <p className="mt-1.5 rounded-xl border border-dashed border-stone-200 bg-stone-50/80 px-3 py-2.5 font-mono text-xs text-stone-600">
            {codesPreview.join(", ")}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            Incrementa a partir do último código RD-### cadastrado.
          </p>
        </div>
      </div>

      <label className="block text-sm font-medium text-stone-700">
        Apelido (opcional)
        <input
          name="nickname"
          placeholder={quantity > 1 ? "Ex.: Híbrido sol — vira “… 1”, “… 2”" : ""}
          className={inputClass}
        />
      </label>

      <label className="block text-sm font-medium text-stone-700">
        Local
        <select name="locationId" className={inputClass} defaultValue={locations[0]?.id}>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>

      {creationType === "SEMENTE" && (
        <div className="space-y-4 rounded-xl border border-pink-200/60 bg-pink-50/30 p-4">
          <label className="block text-sm font-medium text-stone-700">
            Data de plantio
            <input
              name="arrivedAt"
              type="date"
              required
              defaultValue={todayDateInputValue()}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Polinização
            <select
              name="pollinationEventId"
              required
              className={inputClass}
              value={pollinationEventId}
              onChange={(e) => setPollinationEventId(e.target.value)}
            >
              <option value="">— Selecione —</option>
              {pollinations.map((p) => (
                <option key={p.id} value={p.id}>
                  {formatDate(p.occurredAt)} · mãe {p.motherCode}
                  {p.malePlantCode || p.maleExternal
                    ? ` · ♂ ${p.malePlantCode ?? p.maleExternal}`
                    : ""}
                </option>
              ))}
            </select>
          </label>
          {pollinations.length === 0 && (
            <p className="text-xs text-amber-800">
              Nenhuma polinização cadastrada. Registre uma na ficha da planta-mãe
              antes de criar por semente.
            </p>
          )}
          {selectedPollination && (
            <dl className="grid gap-2 rounded-lg bg-white/80 p-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-stone-500">Mãe (♀)</dt>
                <dd className="font-medium">
                  {selectedPollination.motherCode}
                  {selectedPollination.motherNickname
                    ? ` · ${selectedPollination.motherNickname}`
                    : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-stone-500">Pai (♂)</dt>
                <dd className="font-medium">{maleLabel}</dd>
              </div>
            </dl>
          )}
        </div>
      )}

      {creationType === "MUDA" && (
        <div className="space-y-4 rounded-xl border border-emerald-200/60 bg-emerald-50/30 p-4">
          <label className="block text-sm font-medium text-stone-700">
            Data de plantio
            <input
              name="arrivedAt"
              type="date"
              required
              defaultValue={todayDateInputValue()}
              className={inputClass}
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Planta doadora
            <select name="donorPlantId" required className={inputClass} defaultValue="">
              <option value="" disabled>— Selecione —</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code}
                  {p.nickname ? ` · ${p.nickname}` : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {creationType === "COMPRA" && (
        <div className="space-y-4 rounded-xl border border-amber-200/60 bg-amber-50/30 p-4">
          <label className="block text-sm font-medium text-stone-700">
            Data da compra
            <input
              name="arrivedAt"
              type="date"
              required
              defaultValue={todayDateInputValue()}
              className={inputClass}
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-stone-700">
              Fase
              <select name="phase" className={inputClass} defaultValue="JOVEM">
                {compraPhases.map((ph) => (
                  <option key={ph} value={ph}>
                    {phaseLabels[ph]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Altura (cm)
              <input
                name="heightCm"
                type="number"
                step="0.1"
                min="0"
                placeholder="Tamanho atual"
                className={inputClass}
              />
            </label>
          </div>
        </div>
      )}

      <PotFields />

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit">
          {quantity === 1 ? "Criar planta" : `Criar ${quantity} plantas`}
        </Button>
        <Button asChild variant="outline" type="button">
          <Link href="/plantas">Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
