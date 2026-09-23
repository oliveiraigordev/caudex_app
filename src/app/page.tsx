import { getDashboardData } from "@/lib/queries";
import { PageShell } from "@/components/page-shell";
import { PlantCard } from "@/components/plant-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertsSection } from "@/components/alerts-section";
import { WeatherPanel } from "@/components/weather-panel";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";
import { PushNotificationsSetup } from "@/components/push-notifications-setup";

export default async function HomePage() {
  const {
    plants,
    settings,
    weather,
    weatherError,
    alerts,
    dismissedCount,
    completedAlerts,
  } = await getDashboardData();

  return (
    <PageShell className="space-y-10">
      <section className="space-y-3">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#3d2c29] sm:text-4xl">
          Bom dia no viveiro
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-stone-600">
          {plants.length} mudas em acompanhamento em{" "}
          <span className="font-medium text-stone-800">{settings.cityName}</span>
          .
        </p>
      </section>

      <PushNotificationsSetup />

      <section className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Como está o dia</CardTitle>
          </CardHeader>
          <CardContent>
            <WeatherPanel
              weather={weather}
              cityName={settings.cityName}
              error={weatherError}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-[#c45c4a]" />
                Lembretes
              </CardTitle>
              <p className="mt-1 text-sm text-stone-500">
                Marque com ✓ o que já fez — separado por hoje e rotina
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <AlertsSection
              alerts={alerts}
              dismissedCount={dismissedCount}
              completedAlerts={completedAlerts}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#3d2c29]">
              Suas mudas
            </h2>
            <p className="text-sm text-stone-500">Toque para abrir a ficha</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/plantas">Ver todas</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/plantas/nova">
                <Plus className="h-4 w-4" />
                Nova
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plants.map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
