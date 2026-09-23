import type { Plant, PlantEvent, UserSettings } from "@prisma/client";
import { daysSince } from "@/lib/utils";
import type { WeatherSnapshot } from "@/lib/weather";

export type AlertLevel = "info" | "warning" | "urgent";

export type AppAlert = {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  /** Alerta de uma planta só */
  plantCode?: string;
  /** Alerta para todas as plantas deste local (mesmo `locationId` no cadastro) */
  locationId?: string | null;
  ruleId: string;
};

type PlantWithRelations = Plant & {
  events: PlantEvent[];
  location: { id: string; name: string; exposedToRain: boolean } | null;
};

function lastEventOfType(events: PlantEvent[], type: PlantEvent["type"]) {
  return events
    .filter((e) => e.type === type)
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())[0];
}

function waterIntervalDays(plant: Plant, settings: UserSettings) {
  if (plant.phase === "MUDA_SEMENTE" || plant.phase === "JOVEM") {
    return settings.waterDaysSeedling;
  }
  return settings.waterDaysAdult;
}

function fertIntervalDays(plant: Plant, settings: UserSettings) {
  if (plant.phase === "MUDA_SEMENTE" || plant.phase === "JOVEM") {
    return settings.fertDaysSeedling;
  }
  return settings.fertDaysAdult;
}

function isRainySeason(month: number) {
  return month >= 9 || month <= 3; // out–mar (hemisfério sul)
}

function locationBucketKey(plant: PlantWithRelations) {
  return plant.locationId ?? "__sem_local__";
}

function locationDisplayName(plants: PlantWithRelations[]) {
  return plants[0]?.location?.name ?? "Sem local definido";
}

function codesSnippet(plants: PlantWithRelations[], max = 4) {
  const codes = plants.map((p) => p.code);
  if (codes.length <= max) return codes.join(", ");
  return `${codes.slice(0, max).join(", ")} +${codes.length - max}`;
}

/** Lembretes globais ou por local aparecem na ficha se a planta estiver no mesmo local. */
export function alertAppliesToPlant(
  alert: AppAlert,
  plant: { code: string; locationId: string | null },
): boolean {
  if (alert.plantCode) {
    return alert.plantCode === plant.code;
  }
  if (alert.locationId !== undefined) {
    return (alert.locationId ?? null) === (plant.locationId ?? null);
  }
  return true;
}

export function buildAlerts(
  plants: PlantWithRelations[],
  settings: UserSettings,
  weather: WeatherSnapshot,
): AppAlert[] {
  const alerts: AppAlert[] = [];
  const today = weather.daily[0];
  const rainNext12 =
    weather.hourlyNext12h.reduce((s, h) => s + h.precipitation, 0) > 3;
  const rainToday = (today?.precipitationSum ?? 0) > 5;
  const coldTonight = (today?.tempMin ?? 20) < 12;
  const highUv = (today?.uvIndexMax ?? 0) > 8;
  const month = new Date().getMonth() + 1;

  if (rainNext12 || rainToday) {
    const exposed = plants.filter((p) => p.location?.exposedToRain !== false);
    if (exposed.length > 0) {
      alerts.push({
        id: "weather-rain-global",
        level: "warning",
        title: "Chuva prevista",
        message: `Previsão indica chuva (${exposed.length} planta(s) exposta(s)). Considere abrigar mudas e evitar rega.`,
        ruleId: "RAIN_SHELTER",
      });
    }
  }

  if (coldTonight) {
    alerts.push({
      id: "weather-cold",
      level: "warning",
      title: "Noite fria",
      message: `Mínima prevista ~${today?.tempMin?.toFixed(0)}°C. Proteja se houver risco abaixo de 10°C no seu microclima.`,
      ruleId: "COLD_PROTECT",
    });
  }

  if (highUv) {
    alerts.push({
      id: "weather-uv",
      level: "info",
      title: "UV alto",
      message: `Índice UV até ${today?.uvIndexMax?.toFixed(0)}. Observe mudas recém-aclimatadas.`,
      ruleId: "HIGH_UV",
    });
  }

  const skipWaterByLoc = new Map<string, PlantWithRelations[]>();
  const rainSeedlingByLoc = new Map<string, PlantWithRelations[]>();
  const waterDueByLoc = new Map<string, PlantWithRelations[]>();
  const fertDueByLoc = new Map<string, PlantWithRelations[]>();

  for (const plant of plants) {
    const lastWater = lastEventOfType(plant.events, "REGA");
    const lastFert = lastEventOfType(plant.events, "ADUBACAO");
    const waterDays = daysSince(lastWater?.occurredAt);
    const fertDays = daysSince(lastFert?.occurredAt);
    const waterLimit = waterIntervalDays(plant, settings);
    const fertLimit = fertIntervalDays(plant, settings);
    const locKey = locationBucketKey(plant);

    if (
      (rainToday || rainNext12) &&
      plant.location?.exposedToRain !== false &&
      plant.phase === "MUDA_SEMENTE"
    ) {
      const list = rainSeedlingByLoc.get(locKey) ?? [];
      list.push(plant);
      rainSeedlingByLoc.set(locKey, list);
    }

    if ((rainToday || rainNext12) && waterDays !== null) {
      const list = skipWaterByLoc.get(locKey) ?? [];
      list.push(plant);
      skipWaterByLoc.set(locKey, list);
    } else if (
      waterDays === null ||
      (waterDays >= waterLimit && !isRainySeason(month))
    ) {
      const list = waterDueByLoc.get(locKey) ?? [];
      list.push(plant);
      waterDueByLoc.set(locKey, list);
    }

    if (
      plant.status !== "RECUPERACAO" &&
      plant.status !== "DOENTE" &&
      plant.phase !== "DORMENCIA" &&
      (fertDays === null || fertDays >= fertLimit) &&
      month >= 8 &&
      month <= 4
    ) {
      const list = fertDueByLoc.get(locKey) ?? [];
      list.push(plant);
      fertDueByLoc.set(locKey, list);
    }
  }

  for (const [locKey, group] of rainSeedlingByLoc) {
    const name = locationDisplayName(group);
    const locId = group[0].locationId;
    const n = group.length;
    alerts.push({
      id: `rain-seedling@${locKey}`,
      level: "urgent",
      locationId: locId,
      title:
        n === 1
          ? `${group[0].code}: abrigar da chuva`
          : `Abrigar da chuva (${name})`,
      message:
        n === 1
          ? "Muda de semente exposta — prioridade de abrigo."
          : `${n} mudas de semente expostas em ${name} (${codesSnippet(group)}). Prioridade de abrigo.`,
      ruleId: "RAIN_SHELTER",
    });
  }

  for (const [locKey, group] of skipWaterByLoc) {
    const name = locationDisplayName(group);
    const locId = group[0].locationId;
    const n = group.length;
    alerts.push({
      id: `skip-water@${locKey}`,
      level: "info",
      locationId: locId,
      title: n === 1 ? `${group[0].code}: não regar hoje` : `Não regar hoje (${name})`,
      message:
        n === 1
          ? "Chuva prevista ou recente — só regar se o substrato estiver seco em profundidade."
          : `Chuva prevista — ${n} mudas em ${name}. Só regar se o substrato estiver seco em profundidade.`,
      ruleId: "SKIP_WATER",
    });
  }

  for (const [locKey, group] of waterDueByLoc) {
    const name = locationDisplayName(group);
    const locId = group[0].locationId;
    const n = group.length;

    if (n === 1) {
      const plant = group[0];
      const lastWater = lastEventOfType(plant.events, "REGA");
      const waterDays = daysSince(lastWater?.occurredAt);
      const waterLimit = waterIntervalDays(plant, settings);
      alerts.push({
        id: `water-${plant.id}`,
        level: "info",
        plantCode: plant.code,
        title: `${plant.code}: verificar rega`,
        message:
          waterDays === null
            ? "Nenhuma rega registrada ainda."
            : `Última rega há ${waterDays} dia(s) (limite ~${waterLimit}d). Confirme se o substrato está seco.`,
        ruleId: "WATER_DUE",
      });
      continue;
    }

    const anyNeverWatered = group.some(
      (p) => daysSince(lastEventOfType(p.events, "REGA")?.occurredAt) === null,
    );
    alerts.push({
      id: `water@${locKey}`,
      level: "info",
      locationId: locId,
      title: `Verificar rega (${name})`,
      message: anyNeverWatered
        ? `${n} mudas em ${name} — algumas sem rega registrada. Confira o substrato de cada uma.`
        : `${n} mudas em ${name} podem precisar de rega. Confira o substrato (${codesSnippet(group)}).`,
      ruleId: "WATER_DUE",
    });
  }

  for (const [locKey, group] of fertDueByLoc) {
    const name = locationDisplayName(group);
    const locId = group[0].locationId;
    const n = group.length;

    if (n === 1) {
      const plant = group[0];
      const lastFert = lastEventOfType(plant.events, "ADUBACAO");
      const fertDays = daysSince(lastFert?.occurredAt);
      alerts.push({
        id: `fert-${plant.id}`,
        level: "info",
        plantCode: plant.code,
        title: `${plant.code}: janela de adubação`,
        message:
          fertDays === null
            ? "Nenhuma adubação registrada — use dose fraca em muda."
            : `Última adubação há ${fertDays} dia(s). Preferir NPK diluído em crescimento ativo.`,
        ruleId: "FERT_DUE",
      });
      continue;
    }

    alerts.push({
      id: `fert@${locKey}`,
      level: "info",
      locationId: locId,
      title: `Janela de adubação (${name})`,
      message: `${n} mudas em ${name} na janela de adubo — use NPK diluído e dose fraca em mudas (${codesSnippet(group)}).`,
      ruleId: "FERT_DUE",
    });
  }

  return alerts;
}
