import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createPlant } from "@/app/actions";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const inputClass =
  "mt-1.5 w-full rounded-xl border border-stone-200 bg-white/90 px-3 py-2.5 text-sm outline-none transition focus:border-[#d4a088] focus:ring-2 focus:ring-[#c45c4a]/15";

export default async function NovaPlantaPage() {
  const locations = await prisma.cultivationLocation.findMany({
    orderBy: { name: "asc" },
  });

  async function handleCreate(formData: FormData) {
    "use server";
    const code = String(formData.get("code") ?? "").trim();
    if (!code) return;
    const id = await createPlant({
      code,
      nickname: String(formData.get("nickname") ?? "").trim() || undefined,
      heightCm: Number(formData.get("heightCm")) || undefined,
      locationId: String(formData.get("locationId") ?? "") || undefined,
    });
    redirect(`/plantas/${id}`);
  }

  return (
    <PageShell narrow className="space-y-6">
      <Link
        href="/plantas"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-[#c45c4a]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Nova planta</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleCreate} className="space-y-4">
            <label className="block text-sm font-medium text-stone-700">
              Código
              <input
                name="code"
                required
                placeholder="RD-010"
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Apelido
              <input name="nickname" className={inputClass} />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Altura (cm)
              <input
                name="heightCm"
                type="number"
                step="0.1"
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Local
              <select name="locationId" className={inputClass}>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2 pt-2">
              <Button type="submit">Salvar</Button>
              <Button asChild variant="outline">
                <Link href="/plantas">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  );
}
