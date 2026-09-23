"use client";

import { useState, useTransition } from "react";
import type { PlantEvent, PlantPhoto } from "@prisma/client";
import { eventTypeLabels } from "@/lib/labels";
import { formatDateTime, toDatetimeLocalInputValue } from "@/lib/utils";
import { deleteEvent, updateEventOccurredAt } from "@/app/actions";
import { formatFertilizerMeta } from "@/lib/event-metadata";
import { formatRepotMeta } from "@/lib/repot-metadata";
import {
  formatPollinationMeta,
  formatPollinationResultMeta,
} from "@/lib/pollination-metadata";
import Image from "next/image";
import { CalendarClock, Check, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type EventWithPhotos = PlantEvent & { photos: PlantPhoto[] };

const eventAccent: Partial<Record<PlantEvent["type"], string>> = {
  REGA: "bg-sky-500",
  ADUBACAO: "bg-emerald-500",
  FLORACAO: "bg-pink-500",
  FOTO: "bg-violet-500",
  DOENCA: "bg-red-500",
  REPLANTIO: "bg-amber-600",
  POLINIZACAO: "bg-pink-500",
  RESULTADO_POLINIZACAO: "bg-fuchsia-600",
};

export function EventTimeline({
  events,
  plantId,
}: {
  events: EventWithPhotos[];
  plantId: string;
}) {
  if (events.length === 0) {
    return (
      <p className="rounded-2xl bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
        Nenhum registro ainda. Use os botões acima para começar o histórico.
      </p>
    );
  }

  return (
    <ol className="relative space-y-0 border-l-2 border-[#e8d5c4] pl-6">
      {events.map((event) => (
        <EventTimelineItem key={event.id} event={event} plantId={plantId} />
      ))}
    </ol>
  );
}

function EventTimelineItem({
  event,
  plantId,
}: {
  event: EventWithPhotos;
  plantId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [datetime, setDatetime] = useState(
    toDatetimeLocalInputValue(event.occurredAt),
  );
  const [pending, startTransition] = useTransition();

  const dot = eventAccent[event.type] ?? "bg-[#c45c4a]";

  function saveDate() {
    startTransition(async () => {
      await updateEventOccurredAt({
        eventId: event.id,
        plantId,
        occurredAt: datetime,
      });
      setEditing(false);
    });
  }

  function remove() {
    const ok = window.confirm(
      "Excluir este registro? Essa ação não pode ser desfeita.",
    );
    if (!ok) return;
    startTransition(async () => {
      await deleteEvent(event.id, plantId);
    });
  }

  const fertilizerLine = formatFertilizerMeta(event.metadata);
  const repotLine = formatRepotMeta(event.metadata);
  const pollinationLine = formatPollinationMeta(event.metadata);
  const pollinationResultLine = formatPollinationResultMeta(event.metadata);

  return (
    <li className="relative pb-8 last:pb-0">
      <span
        className={`absolute -left-[1.6rem] top-1.5 h-3 w-3 rounded-full ring-4 ring-[var(--card)] ${dot}`}
      />
      <div className="rounded-xl border border-stone-100 bg-stone-50/50 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <span className="font-semibold text-stone-900">
            {eventTypeLabels[event.type]}
          </span>
          {!editing ? (
            <div className="flex items-center gap-1">
              <time className="text-xs text-stone-500">
                {formatDateTime(event.occurredAt)}
              </time>
              <button
                type="button"
                onClick={() => {
                  setDatetime(toDatetimeLocalInputValue(event.occurredAt));
                  setEditing(true);
                }}
                className="rounded-md p-1 text-stone-400 transition hover:bg-white hover:text-[#c45c4a]"
                aria-label="Alterar data do registro"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={remove}
                disabled={pending}
                className="rounded-md p-1 text-stone-400 transition hover:bg-white hover:text-red-600"
                aria-label="Excluir registro"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">
              <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                <CalendarClock className="h-3.5 w-3.5" />
                Data e hora
              </label>
              <input
                type="datetime-local"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-sm"
                disabled={pending}
              />
              <div className="flex gap-1">
                <Button
                  type="button"
                  size="sm"
                  disabled={pending}
                  onClick={saveDate}
                >
                  <Check className="h-3.5 w-3.5" />
                  Salvar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={pending}
                  onClick={() => setEditing(false)}
                >
                  <X className="h-3.5 w-3.5" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
        {event.title && (
          <p className="mt-1 text-sm text-stone-700">{event.title}</p>
        )}
        {fertilizerLine && (
          <p className="mt-1 text-sm font-medium text-emerald-800">
            {fertilizerLine}
          </p>
        )}
        {repotLine && (
          <p className="mt-1 text-sm font-medium text-amber-900">{repotLine}</p>
        )}
        {pollinationLine && (
          <p className="mt-1 text-sm font-medium text-pink-900">
            {pollinationLine}
          </p>
        )}
        {pollinationResultLine && (
          <p className="mt-1 text-sm font-medium text-fuchsia-900">
            {pollinationResultLine}
          </p>
        )}
        {event.notes && (
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-stone-600">
            {event.notes}
          </p>
        )}
        {event.photos.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {event.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative h-16 w-16 overflow-hidden rounded-lg ring-1 ring-stone-200"
              >
                <Image
                  src={photo.path}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}
