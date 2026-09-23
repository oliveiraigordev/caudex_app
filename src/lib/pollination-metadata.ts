export type PollinationMeta = {
  role: "MAE";
  malePlantId?: string | null;
  malePlantCode?: string | null;
  maleExternal?: string | null;
  method?: string;
};

export type PollinationResultOutcome =
  | "POD_FORMADO"
  | "SEMENTES_COLHIDAS"
  | "VAZIA"
  | "PARCIAL"
  | "PERDIDA";

export const pollinationResultLabels: Record<PollinationResultOutcome, string> =
  {
    POD_FORMADO: "Vagem / cabaço formado",
    SEMENTES_COLHIDAS: "Sementes colhidas",
    VAZIA: "Vagem vazia",
    PARCIAL: "Poucas sementes",
    PERDIDA: "Perdeu (caiu / apodreceu)",
  };

export type PollinationResultMeta = {
  pollinationEventId?: string | null;
  outcome: PollinationResultOutcome;
  seedCount?: number | null;
};

export function parsePollinationMeta(
  metadata: string | null,
): PollinationMeta | null {
  if (!metadata) return null;
  try {
    return JSON.parse(metadata) as PollinationMeta;
  } catch {
    return null;
  }
}

export function parsePollinationResultMeta(
  metadata: string | null,
): PollinationResultMeta | null {
  if (!metadata) return null;
  try {
    return JSON.parse(metadata) as PollinationResultMeta;
  } catch {
    return null;
  }
}

export function formatPollinationMeta(metadata: string | null): string | null {
  const m = parsePollinationMeta(metadata);
  if (!m) return null;
  const male =
    m.malePlantCode ??
    m.maleExternal ??
    (m.malePlantId ? "Pai cadastrado" : "Pai não informado");
  const parts = [`♂ ${male} → ♀ mãe`];
  if (m.method) parts.push(m.method);
  return parts.join(" · ");
}

export function formatPollinationResultMeta(
  metadata: string | null,
): string | null {
  const m = parsePollinationResultMeta(metadata);
  if (!m) return null;
  const label = pollinationResultLabels[m.outcome];
  if (m.seedCount != null && m.seedCount > 0) {
    return `${label} · ${m.seedCount} semente(s)`;
  }
  return label;
}
