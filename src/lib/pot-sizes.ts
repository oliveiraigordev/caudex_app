/** Referência comum no viveiro BR (bandejas P e vasos por volume). */

export type PotPresetId =
  | "BANDEJA_ALVEOLADA"
  | "BANDEJA_200"
  | "BANDEJA_128"
  | "BANDEJA_72"
  | "BANDEJA_40"
  | "P6"
  | "P9"
  | "P11"
  | "P14"
  | "P20"
  | "V0_5L"
  | "V1L"
  | "V2L"
  | "V3L"
  | "V5L"
  | "V7L"
  | "V10L"
  | "OUTRO";

export type PotPreset = {
  id: PotPresetId;
  label: string;
  /** Diâmetro útil aproximado (cm), quando fizer sentido */
  diameterCm?: number;
  /** Volume útil aproximado (litros) */
  volumeLiters?: number;
  hint?: string;
};

export const potPresets: PotPreset[] = [
  {
    id: "BANDEJA_ALVEOLADA",
    label: "Bandeja alveolada (multi-buraquinhos)",
    diameterCm: 3,
    volumeLiters: 0.04,
    hint: "Germinação de sementes",
  },
  {
    id: "BANDEJA_200",
    label: "Bandeja alveolada ~200 células",
    diameterCm: 2.5,
    volumeLiters: 0.03,
    hint: "Buracos bem pequenos",
  },
  {
    id: "BANDEJA_128",
    label: "Bandeja alveolada ~128 células",
    diameterCm: 3,
    volumeLiters: 0.04,
    hint: "Comum para sementes",
  },
  {
    id: "BANDEJA_72",
    label: "Bandeja alveolada ~72 células",
    diameterCm: 4,
    volumeLiters: 0.06,
    hint: "Células um pouco maiores",
  },
  {
    id: "BANDEJA_40",
    label: "Bandeja alveolada ~40 células",
    diameterCm: 5,
    volumeLiters: 0.1,
    hint: "Mudinhas com primeiras folhas",
  },
  {
    id: "P6",
    label: "P-06 / P6 (bandeja ~6 cm)",
    diameterCm: 6,
    volumeLiters: 0.15,
    hint: "Mudas recém-transplantadas",
  },
  {
    id: "P9",
    label: "P9 (bandeja ~9 cm)",
    diameterCm: 9,
    volumeLiters: 0.35,
    hint: "Mudas bem pequenas",
  },
  {
    id: "P11",
    label: "P11 (~11 cm)",
    diameterCm: 11,
    volumeLiters: 0.6,
    hint: "Mudas jovens",
  },
  {
    id: "P14",
    label: "P14 (~14 cm)",
    diameterCm: 14,
    volumeLiters: 1.2,
    hint: "Transição / caudex formando",
  },
  {
    id: "P20",
    label: "P20 (~20 cm)",
    diameterCm: 20,
    volumeLiters: 3,
    hint: "Planta em desenvolvimento",
  },
  { id: "V0_5L", label: "Vaso 0,5 L", volumeLiters: 0.5 },
  { id: "V1L", label: "Vaso 1 L", volumeLiters: 1 },
  { id: "V2L", label: "Vaso 2 L", volumeLiters: 2 },
  { id: "V3L", label: "Vaso 3 L", volumeLiters: 3 },
  { id: "V5L", label: "Vaso 5 L", volumeLiters: 5 },
  { id: "V7L", label: "Vaso 7 L", volumeLiters: 7 },
  { id: "V10L", label: "Vaso 10 L", volumeLiters: 10 },
  { id: "OUTRO", label: "Outro (medidas manuais)" },
];

export function isBandejaAlveoladaPreset(id: string | null | undefined): boolean {
  return Boolean(id?.startsWith("BANDEJA"));
}

export function getPotPreset(id: string | null | undefined): PotPreset | null {
  if (!id) return null;
  return potPresets.find((p) => p.id === id) ?? null;
}

export function formatPlantPot(plant: {
  potPreset?: string | null;
  potDiameterCm?: number | null;
  potVolumeLiters?: number | null;
  potLabel?: string | null;
}): string | null {
  const preset = getPotPreset(plant.potPreset);
  if (preset && preset.id !== "OUTRO") {
    const parts = [preset.label];
    if (plant.potDiameterCm && plant.potDiameterCm !== preset.diameterCm) {
      parts.push(`Ø ${plant.potDiameterCm} cm`);
    }
    if (plant.potVolumeLiters && plant.potVolumeLiters !== preset.volumeLiters) {
      parts.push(`${plant.potVolumeLiters} L`);
    }
    return parts.join(" · ");
  }
  if (plant.potLabel) return plant.potLabel;
  const manual: string[] = [];
  if (plant.potDiameterCm) manual.push(`Ø ${plant.potDiameterCm} cm`);
  if (plant.potVolumeLiters) manual.push(`${plant.potVolumeLiters} L`);
  return manual.length > 0 ? manual.join(" · ") : null;
}

export function resolvePotFromPreset(
  presetId: string,
  diameterOverride?: number | null,
  volumeOverride?: number | null,
  customLabel?: string | null,
) {
  const preset = getPotPreset(presetId);
  if (!preset) {
    return {
      potPreset: presetId || null,
      potDiameterCm: diameterOverride ?? null,
      potVolumeLiters: volumeOverride ?? null,
      potLabel: customLabel ?? null,
    };
  }
  if (preset.id === "OUTRO") {
    return {
      potPreset: "OUTRO",
      potDiameterCm: diameterOverride ?? null,
      potVolumeLiters: volumeOverride ?? null,
      potLabel: customLabel?.trim() || null,
    };
  }
  return {
    potPreset: preset.id,
    potDiameterCm: diameterOverride ?? preset.diameterCm ?? null,
    potVolumeLiters: volumeOverride ?? preset.volumeLiters ?? null,
    potLabel: null,
  };
}
