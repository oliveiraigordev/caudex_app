import { formatPlantPot, getPotPreset } from "@/lib/pot-sizes";

export type RepotMeta = {
  potPreset?: string;
  potDiameterCm?: number;
  potVolumeLiters?: number;
  potLabel?: string;
  substrateNotes?: string;
};

export function parseRepotMeta(metadata: string | null): RepotMeta | null {
  if (!metadata) return null;
  try {
    return JSON.parse(metadata) as RepotMeta;
  } catch {
    return null;
  }
}

export function formatRepotMeta(metadata: string | null): string | null {
  const m = parseRepotMeta(metadata);
  if (!m) return null;
  const pot = formatPlantPot(m);
  const parts = [pot, m.substrateNotes].filter(Boolean);
  return parts.length > 0 ? parts.join(" — ") : null;
}

export function repotEventTitle(metadata: string | null): string {
  const m = parseRepotMeta(metadata);
  const preset = getPotPreset(m?.potPreset ?? null);
  if (preset && preset.id !== "OUTRO") return `Replantio → ${preset.label}`;
  if (m?.potLabel) return `Replantio → ${m.potLabel}`;
  return "Replantio";
}
