import { prisma } from "@/lib/db";
import { requireUserId } from "@/lib/session";

type Body = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function POST(req: Request) {
  const userId = await requireUserId();
  const body = (await req.json()) as Body;

  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return Response.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint: body.endpoint },
    create: {
      userId,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    },
    update: {
      userId,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    },
  });

  await prisma.userSettings.upsert({
    where: { userId },
    create: { userId, notificationsEnabled: true },
    update: { notificationsEnabled: true },
  });

  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const userId = await requireUserId();
  const body = (await req.json()) as { endpoint?: string };

  if (body.endpoint) {
    await prisma.pushSubscription.deleteMany({
      where: { userId, endpoint: body.endpoint },
    });
  } else {
    await prisma.pushSubscription.deleteMany({ where: { userId } });
  }

  return Response.json({ ok: true });
}
