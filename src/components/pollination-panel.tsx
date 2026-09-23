"use client";

import { useState, useTransition } from "react";
import {
  createPollinationEvent,
  createPollinationResultEvent,
} from "@/app/actions";
import { pollinationResultLabels } from "@/lib/pollination-metadata";
import { toDatetimeLocalInputValue, formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CollapsibleCard } from "@/components/collapsible-card";
import {
  plantDetailCardClass,
  PlantSectionTitle,
} from "@/lib/plant-detail-section-theme";

const inputClass =
  "mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c45c4a]/15";

type ParentOption = { id: string; code: string; nickname: string | null };

type PollinationEventOption = {
  id: string;
  occurredAt: Date;
  title: string | null;
};

export function PollinationPanel({
  plantId,
  plantCode,
  parentOptions,
  pollinationEvents,
}: {
  plantId: string;
  plantCode: string;
  parentOptions: ParentOption[];
  pollinationEvents: PollinationEventOption[];
}) {
  const [tab, setTab] = useState<"pollination" | "result">("pollination");
  const [pending, startTransition] = useTransition();
  const now = toDatetimeLocalInputValue(new Date());

  return (
    <CollapsibleCard
      className={plantDetailCardClass("polinizacao")}
      title={
        <PlantSectionTitle section="polinizacao">Polinização</PlantSectionTitle>
      }
      description={
        <>
          Planta atual ({plantCode}) como <strong>mãe (♀)</strong>. Anexe foto da
          flor, vagem ou sementes.
        </>
      }
      defaultOpenDesktop={false}
      defaultOpenMobile={false}
    >
      <div className="flex gap-2 pb-3">
        <Button
          type="button"
          size="sm"
          variant={tab === "pollination" ? "default" : "secondary"}
          onClick={() => setTab("pollination")}
        >
          Registrar polinização
        </Button>
        <Button
          type="button"
          size="sm"
          variant={tab === "result" ? "default" : "secondary"}
          onClick={() => setTab("result")}
        >
          Resultado
        </Button>
      </div>
        {tab === "pollination" ? (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              startTransition(async () => {
                await createPollinationEvent(fd);
                e.currentTarget.reset();
              });
            }}
          >
            <input type="hidden" name="plantId" value={plantId} />
            <label className="block text-sm font-medium text-stone-700">
              Data e hora
              <input
                type="datetime-local"
                name="occurredAt"
                className={inputClass}
                defaultValue={now}
                required
              />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Pai (♂) — planta do cadastro
              <select name="malePlantId" className={inputClass} defaultValue="">
                <option value="">— Selecionar —</option>
                {parentOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code}
                    {p.nickname ? ` — ${p.nickname}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Ou pai externo (texto)
              <input
                name="maleExternal"
                className={inputClass}
                placeholder="Ex.: cultivar de outro viveiro"
              />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Como polinizou
              <input
                name="method"
                className={inputClass}
                placeholder="Ex.: pólen com pincel na flor da mãe"
              />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Foto (flor / pólen)
              <input
                name="file"
                type="file"
                accept="image/*"
                capture="environment"
                className="mt-1 block w-full text-sm"
              />
            </label>
            <input
              name="caption"
              className={inputClass}
              placeholder="Legenda da foto (opcional)"
            />
            <label className="block text-sm font-medium text-stone-700">
              Observações
              <textarea name="notes" rows={2} className={inputClass} />
            </label>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando…" : "Salvar polinização"}
            </Button>
          </form>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              startTransition(async () => {
                await createPollinationResultEvent(fd);
                e.currentTarget.reset();
              });
            }}
          >
            <input type="hidden" name="plantId" value={plantId} />
            <label className="block text-sm font-medium text-stone-700">
              Data e hora
              <input
                type="datetime-local"
                name="occurredAt"
                className={inputClass}
                defaultValue={now}
                required
              />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Polinização relacionada
              <select name="pollinationEventId" className={inputClass}>
                <option value="">— Não linkar —</option>
                {pollinationEvents.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {formatDateTime(ev.occurredAt)} —{" "}
                    {ev.title ?? "Polinização"}
                  </option>
                ))}
              </select>
            </label>
            {pollinationEvents.length === 0 && (
              <p className="text-xs text-stone-500">
                Nenhuma polinização registrada ainda nesta planta.
              </p>
            )}
            <label className="block text-sm font-medium text-stone-700">
              Resultado
              <select name="outcome" className={inputClass} required defaultValue="POD_FORMADO">
                {Object.entries(pollinationResultLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Quantidade de sementes (se houver)
              <input
                name="seedCount"
                type="number"
                min="0"
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Foto (vagem / sementes)
              <input
                name="file"
                type="file"
                accept="image/*"
                capture="environment"
                className="mt-1 block w-full text-sm"
              />
            </label>
            <input
              name="caption"
              className={inputClass}
              placeholder="Legenda da foto (opcional)"
            />
            <label className="block text-sm font-medium text-stone-700">
              Observações
              <textarea name="notes" rows={2} className={inputClass} />
            </label>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando…" : "Salvar resultado"}
            </Button>
          </form>
        )}
    </CollapsibleCard>
  );
}
