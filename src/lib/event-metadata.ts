export type FertilizerMeta = {
  fertilizerType?: string;
  dose?: string;
};

export function parseFertilizerMeta(metadata: string | null): FertilizerMeta | null {
  if (!metadata) return null;
  try {
    return JSON.parse(metadata) as FertilizerMeta;
  } catch {
    return null;
  }
}

export function formatFertilizerMeta(metadata: string | null): string | null {
  const m = parseFertilizerMeta(metadata);
  if (!m) return null;
  const parts = [m.fertilizerType, m.dose].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

export const fertilizerTypeOptions = [
  "NPK 10-10-10 (diluído)",
  "NPK alto em K (floração)",
  "Foliar",
  "Orgânico (humus / bokashi)",
  "Outro",
] as const;
