import type { PlantPhase } from "@prisma/client";
import { phaseLabels } from "@/lib/labels";

/** Sugestão de fase só pela altura (cm, substraço → ápice). */
export function suggestedPhaseFromHeight(
  heightCm: number | null | undefined,
): PlantPhase | null {
  if (heightCm == null || heightCm <= 0) return null;
  if (heightCm < 15) return "MUDA_SEMENTE";
  if (heightCm < 30) return "JOVEM";
  return "ADULTA";
}

export function suggestedPhaseLabel(heightCm: number | null | undefined) {
  const phase = suggestedPhaseFromHeight(heightCm);
  return phase ? phaseLabels[phase] : null;
}

/** Não sobrescreve fases manuais de recuperação/dormência. */
export function applyAutoPhase(
  current: PlantPhase,
  heightCm: number | null | undefined,
): PlantPhase {
  if (current === "RECUPERACAO" || current === "DORMENCIA") {
    return current;
  }
  return suggestedPhaseFromHeight(heightCm) ?? current;
}
