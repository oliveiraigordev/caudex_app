import type { WeatherSnapshot } from "@/lib/weather";
import {
  buildWeatherVerdict,
  describeRainChance,
  describeRainMm,
  describeSunshine,
  describeTemperature,
  describeUv,
} from "@/lib/weather-copy";
import { CloudRain, Droplets, Sun, ThermometerSun } from "lucide-react";

export function WeatherPanel({
  weather,
  cityName,
  error,
}: {
  weather: WeatherSnapshot | null;
  cityName: string;
  error: string | null;
}) {
  const today = weather?.daily[0];

  if (error) {
    return <p className="text-sm text-stone-600">{error}</p>;
  }

  if (!today) return null;

  const rain = describeRainMm(today.precipitationSum);
  const uv = describeUv(today.uvIndexMax);
  const temp = describeTemperature(today.tempMin, today.tempMax);
  const rainChance = describeRainChance(today.precipitationProbabilityMax);
  const verdict = buildWeatherVerdict({
    precipitationMm: today.precipitationSum,
    rainChancePercent: today.precipitationProbabilityMax,
    uvMax: today.uvIndexMax,
    tempMin: today.tempMin,
    tempMax: today.tempMax,
  });

  const blocks = [
    {
      icon: CloudRain,
      title: rain.headline,
      lines: [rain.detail, rainChance],
      tip: null,
    },
    {
      icon: ThermometerSun,
      title: temp.summary,
      lines: [describeSunshine(today.sunshineDurationHours)],
      tip: temp.forRoses,
    },
    {
      icon: Sun,
      title: uv.label,
      lines: [uv.meaning],
      tip: uv.forRoses,
    },
  ];

  return (
    <div className="min-w-0 space-y-4">
      <div className="min-w-0 rounded-2xl border border-[#d4a088]/30 bg-gradient-to-br from-[#fff8f3] to-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#9b6b5c]">
          Hoje em {cityName}
        </p>
        <p className="mt-2 break-words font-display text-lg font-semibold leading-snug text-[#3d2c29]">
          {verdict}
        </p>
      </div>

      <ul className="space-y-3">
        {blocks.map((block) => (
          <li
            key={block.title}
            className="rounded-xl border border-stone-100 bg-white/70 p-3.5"
          >
            <div className="flex gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f3e8df] text-[#9b4d3a]"
                aria-hidden
              >
                <block.icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 space-y-1">
                <p className="break-words font-semibold text-stone-900">{block.title}</p>
                {block.lines.map((line) => (
                  <p key={line} className="break-words text-sm leading-relaxed text-stone-600">
                    {line}
                  </p>
                ))}
                {block.tip && (
                  <p className="break-words text-sm leading-relaxed text-[#7a5c4a]">
                    <span className="font-medium">Para suas mudas:</span>{" "}
                    {block.tip}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <details className="rounded-xl bg-stone-50/80 px-3 py-2 text-xs text-stone-500">
        <summary className="cursor-pointer font-medium text-stone-600">
          Números técnicos da previsão
        </summary>
        <ul className="mt-2 space-y-1 pl-1">
          <li className="flex items-center gap-1.5">
            <Droplets className="h-3 w-3" />
            Chuva acumulada: {today.precipitationSum.toFixed(1)} mm
          </li>
          <li>Chance de chuva: {today.precipitationProbabilityMax}%</li>
          <li>
            Temperatura: {today.tempMin.toFixed(0)}° – {today.tempMax.toFixed(0)}°C
          </li>
          <li>Sol direto: ~{today.sunshineDurationHours.toFixed(1)} horas</li>
          <li>Índice UV máximo: {today.uvIndexMax.toFixed(0)}</li>
        </ul>
        <p className="mt-2 leading-relaxed">
          <strong>mm de chuva</strong> é quanto água se acumula — 5 mm é como
          uma rega leve. <strong>UV</strong> mede a força do sol; acima de 7, o
          sol “queima” mais.
        </p>
      </details>
    </div>
  );
}
