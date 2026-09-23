import { getAlertsBundle } from "@/lib/alerts-data";
import { buildPushPayload } from "@/lib/notification-summary";
import { isPushConfigured, isQuietHours, sendPushToUser } from "@/lib/push";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function authorizeCron(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorizeCron(req)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isPushConfigured()) {
    return Response.json({ ok: true, skipped: "vapid_not_configured" });
  }

  if (isQuietHours()) {
    return Response.json({ ok: true, skipped: "quiet_hours" });
  }

  const users = await prisma.user.findMany({
    where: {
      settings: { notificationsEnabled: true },
      pushSubscriptions: { some: {} },
    },
    select: { id: true, settings: { select: { lastPushNotifiedAt: true } } },
  });

  let notified = 0;

  for (const user of users) {
    const last = user.settings?.lastPushNotifiedAt;
    if (last) {
      const hoursSince = (Date.now() - last.getTime()) / (1000 * 60 * 60);
      if (hoursSince < 3) continue;
    }

    const bundle = await getAlertsBundle(user.id);
    const payload = buildPushPayload(bundle.activeAlerts);
    if (!payload) continue;

    const result = await sendPushToUser(user.id, {
      title: payload.title,
      body: payload.body,
      url: payload.url,
      tag: payload.tag,
    });

    if (result.sent > 0) {
      await prisma.userSettings.update({
        where: { userId: user.id },
        data: { lastPushNotifiedAt: new Date() },
      });
      notified++;
    }
  }

  return Response.json({ ok: true, usersChecked: users.length, notified });
}
