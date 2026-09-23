import { getVapidPublicKey } from "@/lib/push";

export async function GET() {
  const key = getVapidPublicKey();
  if (!key) {
    return Response.json({ configured: false, publicKey: null }, { status: 503 });
  }
  return Response.json({ configured: true, publicKey: key });
}
