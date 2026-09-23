import { notFound } from "next/navigation";
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
import { PlantDetailGallery } from "@/components/plant-detail-gallery";
import { PlantHeroBanner } from "@/components/plant-hero-banner";
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
      <div className="flex flex-col gap-3">
        <Link
          href="/plantas"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-[#c45c4a]"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar às plantas
        </Link>
        <div className="flex justify-center sm:justify-end">
          <PlantPager
            prev={neighbors.prev}
            next={neighbors.next}
            currentCode={plant.code}
          />
        </div>
      </div>

      <PlantHeroBanner
        plantId={plant.id}
        heroPhotoPath={heroPhoto ?? null}
        code={plant.code}
        nickname={plant.nickname}
        phaseLabel={phaseLabels[plant.phase]}
        statusLabel={statusLabels[plant.status]}
        originLabel={originLabels[plant.origin]}
      />

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] lg:items-start lg:gap-6">
        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-20 lg:self-start [&>*]:shrink-0">
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
