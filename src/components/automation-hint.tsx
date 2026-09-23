import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export function AutomationHint() {
  return (
    <Card className="border-teal-200/50 bg-teal-50/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-teal-700" />
          O que é automático hoje
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-stone-700">
        <p>
          <strong>Lembretes</strong> (rega, adubo, chuva, frio, UV) — calculados
          com clima + últimos registros + fase/local da planta.
        </p>
        <p>
          <strong>Fase</strong> — você escolhe manualmente; opcionalmente, ao
          salvar os dados da planta, marque &quot;Fase automática pela
          altura&quot; (&lt;15 cm muda · 15–30 jovem · &gt;30 adulta). Recuperação
          e dormência não mudam sozinhas.
        </p>
        <p className="text-stone-600">
          Rega e adubação <strong>não</strong> são aplicadas sozinhas — use os
          botões rápidos ou ações em massa na lista de plantas.
        </p>
      </CardContent>
    </Card>
  );
}
