import { buildAlerts } from "@/lib/alerts";
import {
  filterActiveAlerts,
  getDismissedAlertIds,
} from "@/lib/alert-dismissals";
import { getPlantsWithEvents, getSettings } from "@/lib/queries";
import { fetchBananalWeather } from "@/lib/weather";

export async function getAlertsBundle(userId: string) {
  const [plants, settings] = await Promise.all([
    getPlantsWithEvents(userId),
    getSettings(userId),
  ]);

  let weather = null;
  let weatherError: string | null = null;
  try {
    weather = await fetchBananalWeather(
      settings.locationLat,
      settings.locationLon,
    );
  } catch {
    weatherError = "Não foi possível carregar o clima agora.";
  }

  const allAlerts = weather ? buildAlerts(plants, settings, weather) : [];
  const dismissedIds = await getDismissedAlertIds(userId, allAlerts);
  const activeAlerts = filterActiveAlerts(allAlerts, dismissedIds);
  const dismissedCount = allAlerts.length - activeAlerts.length;

  return {
    plants,
    settings,
    weather,
    weatherError,
    allAlerts,
    activeAlerts,
    dismissedCount,
    dismissedIds,
  };
}
