import Link from "next/link";
import { getPlantsWithEvents } from "@/lib/queries";
import { requireUserId } from "@/lib/session";
import { PageShell } from "@/components/page-shell";
import { PlantsCollection } from "@/components/plants-collection";
import { plantDayToDaySummary } from "@/lib/plant-day-to-day";
import { BulkActionsPanel } from "@/components/bulk-actions-panel";
import { AutomationHint } from "@/components/automation-hint";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function PlantasPage() {
  const userId = await requireUserId();
  const plants = await getPlantsWithEvents(userId);

  return (
    <PageShell className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-semibold text-[#3d2c29]">
            Plantas
          </h1>
          <p className="text-sm text-stone-600">
            {plants.length} cadastradas · genealogia, eventos e fotos
          </p>
        </div>
        <Button asChild>
          <Link href="/plantas/nova">
            <Plus className="h-4 w-4" />
            Nova planta
          </Link>
        </Button>
      </div>

      <AutomationHint />
      <BulkActionsPanel
        plants={plants.map((p) => ({
          id: p.id,
          code: p.code,
          nickname: p.nickname,
        }))}
      />

      <PlantsCollection
        plants={plants}
        rows={plants.map((p) => plantDayToDaySummary(p))}
      />
    </PageShell>
  );
}
