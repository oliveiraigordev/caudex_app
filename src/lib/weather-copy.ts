/** Textos em linguagem simples para cultivadores (não meteorologistas). */

export function describeRainMm(mm: number): {
  headline: string;
  detail: string;
  forRoses: string;
} {
  if (mm <= 0.2) {
    return {
      headline: "Sem chuva relevante",
      detail: "A previsão indica dia seco ou só garoa mínima.",
      forRoses:
        "Pode regar normalmente se o substrato estiver seco — a chuva não deve molhar as mudas por você.",
    };
  }
  if (mm <= 3) {
    return {
      headline: "Garoa ou chuva fraca",
      detail: `Cerca de ${formatMm(mm)} de água ao longo do dia (equivalente a um chuvisco).`,
      forRoses:
        "Observe se o vaso ficou úmido; muitas vezes não precisa regar manualmente.",
    };
  }
  if (mm <= 10) {
    return {
      headline: "Chuva moderada",
      detail: `Previsão de ${formatMm(mm)} — como uma rega forte vinda do céu.`,
      forRoses:
        "Evite regar hoje. Mudas expostas podem precisar de abrigo se ficarem encharcadas.",
    };
  }
  return {
    headline: "Chuva forte",
    detail: `Previsão de ${formatMm(mm)} — dia bem molhado.`,
    forRoses:
      "Priorize drenagem e abrigo das mudas. Não regue até o substrato secar de verdade.",
  };
}

export function describeRainChance(percent: number): string {
  if (percent < 25) return "Pouca chance de chuva";
  if (percent < 55) return "Pode chover em alguns momentos";
  if (percent < 80) return "Chuva provável";
  return "Chuva muito provável";
}

export function describeUv(uv: number): {
  label: string;
  meaning: string;
  forRoses: string;
} {
  if (uv <= 2) {
    return {
      label: "Sol fraco",
      meaning: "Índice UV baixo — sol suave o dia todo.",
      forRoses: "Crescimento mais lento; mudas toleram bem.",
    };
  }
  if (uv <= 5) {
    return {
      label: "Sol moderado",
      meaning: "UV na faixa confortável para ficar ao ar livre.",
      forRoses: "Bom para rosas do deserto com boa aclimatação.",
    };
  }
  if (uv <= 7) {
    return {
      label: "Sol forte",
      meaning: "UV alto — sol “pesado” no meio do dia.",
      forRoses: "Mudas novas: observe folhas; sombra leve no pico pode ajudar.",
    };
  }
  return {
    label: "Sol muito forte",
    meaning: "UV extremo — risco de queimadura em pele e folhas delicadas.",
    forRoses:
      "Proteja mudas de ~8 cm no horário mais quente se ainda estiverem frágeis.",
  };
}

export function describeTemperature(min: number, max: number): {
  summary: string;
  forRoses: string;
} {
  if (min < 12) {
    return {
      summary: `Frio à noite (${min.toFixed(0)}° a ${max.toFixed(0)}°C)`,
      forRoses: "Se a temperatura real cair perto de 10°C, proteja as plantas.",
    };
  }
  if (max >= 32) {
    return {
      summary: `Dia quente (${min.toFixed(0)}° a ${max.toFixed(0)}°C)`,
      forRoses: "Calor favorece crescimento; regue só com substrato seco.",
    };
  }
  return {
    summary: `Temperatura amena (${min.toFixed(0)}° a ${max.toFixed(0)}°C)`,
    forRoses: "Condição confortável para Adenium em Bananal.",
  };
}

export function describeSunshine(hours: number): string {
  if (hours >= 7) return "Dia ensolarado — ótimo para quem gosta de sol pleno.";
  if (hours >= 4) return "Sol e nuvens alternando durante o dia.";
  return "Dia mais fechado — menos horas de sol direto.";
}

function formatMm(mm: number) {
  if (mm < 1) return "menos de 1 mm";
  return `${mm.toFixed(0)} mm`;
}

export function buildWeatherVerdict(input: {
  precipitationMm: number;
  rainChancePercent: number;
  uvMax: number;
  tempMin: number;
  tempMax: number;
}): string {
  const rain = describeRainMm(input.precipitationMm);
  if (input.precipitationMm > 3 || input.rainChancePercent >= 60) {
    return `${rain.headline}. Foque em abrigo e em não regar à toa.`;
  }
  if (input.uvMax >= 8) {
    return "Sol muito forte no pico — olho nas mudas pequenas.";
  }
  if (input.precipitationMm <= 0.2 && input.rainChancePercent < 30) {
    return "Dia favorável para checar substrato e regar só se estiver seco.";
  }
  return rain.forRoses;
}
