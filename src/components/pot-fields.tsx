"use client";

import { useState } from "react";
import { potPresets } from "@/lib/pot-sizes";

const inputClass =
  "mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c45c4a]/15";

export function PotFields({
  defaultPreset = "",
  defaultDiameter = "",
  defaultVolume = "",
  defaultLabel = "",
  namePrefix = "",
}: {
  defaultPreset?: string;
  defaultDiameter?: string | number;
  defaultVolume?: string | number;
  defaultLabel?: string;
  /** ex.: "" para form planta; não usado se names fixos */
  namePrefix?: string;
}) {
  const [preset, setPreset] = useState(defaultPreset || "");
  const p = namePrefix;
  const selected = potPresets.find((x) => x.id === preset);

  return (
    <div className="space-y-3 rounded-xl border border-stone-200/80 bg-stone-50/50 p-3">
      <p className="text-xs font-medium text-stone-600">
        Vaso / pote — padrões comuns: bandejas P6–P20 e vasos em litros (valores
        aproximados; ajuste se o seu for diferente).
      </p>
      <label className="block text-sm font-medium text-stone-700">
        Tamanho
        <select
          name={`${p}potPreset`}
          className={inputClass}
          value={preset}
          onChange={(e) => setPreset(e.target.value)}
        >
          <option value="">— Não informado —</option>
          {potPresets.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
              {opt.hint ? ` (${opt.hint})` : ""}
            </option>
          ))}
        </select>
      </label>
      {selected && selected.id !== "OUTRO" && (
        <p className="text-xs text-stone-500">
          Referência:{" "}
          {selected.diameterCm ? `Ø ~${selected.diameterCm} cm` : ""}
          {selected.diameterCm && selected.volumeLiters ? " · " : ""}
          {selected.volumeLiters ? `~${selected.volumeLiters} L` : ""}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-medium text-stone-700">
          Diâmetro real (cm)
          <input
            name={`${p}potDiameterCm`}
            type="number"
            step="0.1"
            min="0"
            className={inputClass}
            defaultValue={defaultDiameter}
            placeholder={selected?.diameterCm?.toString() ?? "opcional"}
          />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Volume real (L)
          <input
            name={`${p}potVolumeLiters`}
            type="number"
            step="0.1"
            min="0"
            className={inputClass}
            defaultValue={defaultVolume}
            placeholder={selected?.volumeLiters?.toString() ?? "opcional"}
          />
        </label>
      </div>
      {(preset === "OUTRO" || preset === "") && (
        <label className="block text-sm font-medium text-stone-700">
          Descrição do vaso
          <input
            name={`${p}potLabel`}
            className={inputClass}
            defaultValue={defaultLabel}
            placeholder="Ex.: cerâmica 12×12 cm"
          />
        </label>
      )}
    </div>
  );
}
