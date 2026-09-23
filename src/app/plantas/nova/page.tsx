import Link from "next/link";
import { redirect } from "next/navigation";
import { createPlantsFromForm } from "@/app/actions";
import { NewPlantForm } from "@/components/new-plant-form";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ensureDefaultLocation, getNewPlantPageData } from "@/lib/queries";
import { requireUserId } from "@/lib/session";
import { ArrowLeft } from "lucide-react";

export default async function NovaPlantaPage() {
  const userId = await requireUserId();
  await ensureDefaultLocation(userId);
  const data = await getNewPlantPageData(userId);

  async function handleCreate(formData: FormData) {
    "use server";
    const ids = await createPlantsFromForm(formData);
    if (ids.length === 1) redirect(`/plantas/${ids[0]}`);
    redirect("/plantas");
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
          <p className="text-sm text-stone-600">
            Escolha o tipo, a quantidade e os dados iniciais. Os códigos são
            gerados automaticamente.
          </p>
        </CardHeader>
        <CardContent>
          <NewPlantForm
            locations={data.locations}
            plants={data.plants}
            pollinations={data.pollinations}
            existingCodes={data.existingCodes}
            createAction={handleCreate}
          />
        </CardContent>
      </Card>
    </PageShell>
  );
}
