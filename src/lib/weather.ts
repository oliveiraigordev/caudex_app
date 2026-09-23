export type WeatherSnapshot = {
  fetchedAt: string;
  latitude: number;
  longitude: number;
  daily: {
    date: string;
    tempMin: number;
    tempMax: number;
    precipitationSum: number;
    precipitationProbabilityMax: number;
    uvIndexMax: number;
    sunshineDurationHours: number;
  }[];
  hourlyNext12h: {
    time: string;
    precipitation: number;
    cloudCover: number;
  }[];
};

export async function fetchBananalWeather(
  lat = -22.68,
  lon = -44.32,
): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    timezone: "America/Sao_Paulo",
    forecast_days: "3",
    daily:
      "temperature_2m_min,temperature_2m_max,precipitation_sum,precipitation_probability_max,uv_index_max,sunshine_duration",
    hourly: "precipitation,cloud_cover",
  });

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    { next: { revalidate: 3600 } },
  );

  if (!res.ok) {
    throw new Error("Falha ao buscar previsão do tempo");
  }

  const data = await res.json();
  const now = new Date();
  const in12h = now.getTime() + 12 * 60 * 60 * 1000;

  const hourly = (data.hourly?.time ?? [])
    .map((time: string, i: number) => ({
      time,
      precipitation: data.hourly.precipitation[i] ?? 0,
      cloudCover: data.hourly.cloud_cover[i] ?? 0,
    }))
    .filter((h: { time: string }) => {
      const t = new Date(h.time).getTime();
      return t >= now.getTime() && t <= in12h;
    });

  const daily = (data.daily?.time ?? []).map((date: string, i: number) => ({
    date,
    tempMin: data.daily.temperature_2m_min[i],
    tempMax: data.daily.temperature_2m_max[i],
    precipitationSum: data.daily.precipitation_sum[i],
    precipitationProbabilityMax: data.daily.precipitation_probability_max[i],
    uvIndexMax: data.daily.uv_index_max[i],
    sunshineDurationHours: (data.daily.sunshine_duration[i] ?? 0) / 3600,
  }));

  return {
    fetchedAt: new Date().toISOString(),
    latitude: lat,
    longitude: lon,
    daily,
    hourlyNext12h: hourly,
  };
}
