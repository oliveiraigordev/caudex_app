"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PushState = "unsupported" | "loading" | "off" | "on" | "blocked" | "no_server";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64Safe);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function PushNotificationsSetup({ className }: { className?: string }) {
  const [state, setState] = useState<PushState>("loading");
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("blocked");
      return;
    }

    const keyRes = await fetch("/api/push/vapid-public-key");
    const keyJson = (await keyRes.json()) as {
      configured?: boolean;
      publicKey?: string;
    };
    if (!keyJson.configured || !keyJson.publicKey) {
      setState("no_server");
      return;
    }

    const reg = await navigator.serviceWorker.getRegistration("/sw.js");
    const sub = await reg?.pushManager.getSubscription();
    setState(sub ? "on" : Notification.permission === "granted" ? "off" : "off");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function enable() {
    setMessage(null);
    try {
      const perm = await Notification.requestPermission();
      if (perm === "denied") {
        setState("blocked");
        setMessage(
          "Permissão negada. No celular, abra Configurações do site e permita notificações.",
        );
        return;
      }
      if (perm !== "granted") {
        setState("off");
        return;
      }

      const keyRes = await fetch("/api/push/vapid-public-key");
      const { publicKey } = (await keyRes.json()) as { publicKey: string };

      const reg =
        (await navigator.serviceWorker.getRegistration("/sw.js")) ??
        (await navigator.serviceWorker.register("/sw.js", { scope: "/" }));

      await navigator.serviceWorker.ready;

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      const json = sub.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });

      setState("on");
      setMessage(
        "Ativo! No iPhone, adicione o site à tela inicial (PWA) para receber push.",
      );
    } catch (e) {
      setState("off");
      setMessage(
        e instanceof Error ? e.message : "Não foi possível ativar agora.",
      );
    }
  }

  async function disable() {
    setMessage(null);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint }),
        });
      }
      setState("off");
    } catch {
      setMessage("Erro ao desativar.");
    }
  }

  if (state === "unsupported") {
    return null;
  }

  return (
    <div
      className={cn(
        "flex min-w-0 max-w-full flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)]/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c45c4a]/15 text-[#c45c4a]"
        >
          <Smartphone className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-medium text-[var(--foreground)]">
            Notificações no celular
          </p>
          <p className="text-xs text-[var(--muted)]">
            Alertas de rega, chuva e adubo no navegador — sem Instagram ou app
            extra.
          </p>
          {message ? (
            <p className="mt-1 text-xs text-[var(--muted)]">{message}</p>
          ) : null}
          {state === "blocked" ? (
            <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
              Bloqueado pelo navegador. Libere nas configurações do site.
            </p>
          ) : null}
          {state === "no_server" ? (
            <p className="mt-1 text-xs text-[var(--muted)]">
              Servidor ainda sem chaves push (VAPID). Ative em produção.
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        {state === "on" ? (
          <Button type="button" variant="outline" size="sm" onClick={() => void disable()}>
            <BellOff className="h-3.5 w-3.5" />
            Desativar
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            disabled={state === "blocked" || state === "no_server" || state === "loading"}
            onClick={() => void enable()}
          >
            <Bell className="h-3.5 w-3.5" />
            Ativar notificações
          </Button>
        )}
      </div>
    </div>
  );
}
