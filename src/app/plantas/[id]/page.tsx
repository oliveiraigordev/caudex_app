import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  getPlantById,
  getPlantFormOptions,
  getPlantNeighbors,
} from "@/lib/queries";
import { getAlertsBundle } from "@/lib/alerts-data";
import { alertAppliesToPlant } from "@/lib/alerts";
import { sortAlerts } from "@/lib/alert-labels";
import { PageShell } from "@/components/page-shell";
import { PollinationPanel } from "@/components/pollination-panel";
import { PlantDetailAlerts } from "@/components/plant-detail-alerts";
import { PlantDetailRegistrar } from "@/components/plant-detail-registrar";
import { PlantDetailTimeline } from "@/components/plant-detail-timeline";
import { originLabels, phaseLabels, statusLabels } from "@/lib/labels";
import { PlantEditForm } from "@/components/plant-edit-form";
import { ArrowLeft } from "lucide-react";
import { PlantPager } from "@/components/plant-pager";
import { PlantPagerKeyboard } from "@/components/plant-pager-keyboard";
import { Badge } from "@/components/ui/badge";
import { PlantDetailGallery } from "@/components/plant-detail-gallery";
import { requireUserId } from "@/lib/session";

export default async function PlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = await requireUserId();
  const plant = await getPlantById(userId, id);
  if (!plant) notFound();

  const [neighbors, formOptions] = await Promise.all([
    getPlantNeighbors(userId, id),
    getPlantFormOptions(userId, id),
  ]);

  const { activeAlerts, allAlerts, dismissedCount } =
    await getAlertsBundle(userId);
  const plantAlerts = activeAlerts.filter((a) =>
    alertAppliesToPlant(a, plant),
  );
  const activeIds = new Set(activeAlerts.map((a) => a.id));
  const plantCompletedAlerts = sortAlerts(
    allAlerts.filter(
      (a) => alertAppliesToPlant(a, plant) && !activeIds.has(a.id),
    ),
  );

  const heroPhoto = plant.photos[0]?.path;

  return (
    <PageShell className="space-y-6">
      <PlantPagerKeyboard
        prevId={neighbors.prev?.id ?? null}
        nextId={neighbors.next?.id ?? null}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/plantas"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-[#c45c4a]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar às plantas
        </Link>
        <PlantPager
          prev={neighbors.prev}
          next={neighbors.next}
          currentCode={plant.code}
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-stone-200/70 bg-[var(--card)] shadow-md shadow-stone-300/20">
        <div className="relative aspect-[21/9] min-h-[140px] bg-gradient-to-br from-[#f0ddd4] to-[#e8d5c4] sm:aspect-[3/1]">
          {heroPhoto ? (
            <Image
              src={heroPhoto}
              alt=""
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#3d2c29]/75 via-[#3d2c29]/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
              {plant.code}
            </p>
            <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              {plant.nickname ?? plant.code}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="bg-white/20 text-white backdrop-blur-sm">
                {phaseLabels[plant.phase]}
              </Badge>
              <Badge className="bg-white/15 text-white/95 backdrop-blur-sm" variant="muted">
                {statusLabels[plant.status]}
              </Badge>
              <Badge className="bg-white/15 text-white/95 backdrop-blur-sm" variant="muted">
                {originLabels[plant.origin]}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] lg:items-start lg:gap-6">
        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <PlantEditForm
            plant={plant}
            locations={formOptions.locations}
            parentOptions={formOptions.plants}
          />
          <PlantDetailRegistrar
            plantId={plant.id}
            potPreset={plant.potPreset}
          />
          <PollinationPanel
            plantId={plant.id}
            plantCode={plant.code}
            parentOptions={formOptions.plants}
            pollinationEvents={plant.events
              .filter((e) => e.type === "POLINIZACAO")
              .map((e) => ({
                id: e.id,
                occurredAt: e.occurredAt,
                title: e.title,
              }))}
          />
        </aside>

        <div className="flex min-w-0 flex-col gap-4">
          <PlantDetailAlerts
            alerts={plantAlerts}
            dismissedCount={dismissedCount}
            completedAlerts={plantCompletedAlerts}
          />
          <PlantDetailGallery photos={plant.photos} plantCode={plant.code} />
          <PlantDetailTimeline events={plant.events} plantId={plant.id} />
        </div>
      </div>
    </PageShell>
  );
}
