---
name: caudexia-cultivo
description: Especialista em cultivo de rosa-do-deserto (Adenium obesum) e no produto Caudexia — registro, genealogia, fotos, alertas e automações para Bananal/SP, Brasil. Use SEMPRE que o pedido envolver rega, adubação, substrato, sol, chuva, floração, doenças, pragas, cruzamento, mudas de semente, caudex, estação do ano, clima local, notificações, lembretes, regras automáticas, integração meteorológica, ou decisões de manejo no app rosa-deserto/Caudexia.
---

# Caudexia — cultivo e automações (Adenium obesum)

## Local padrão

- **Município:** Bananal, SP, Brasil (~22°40′S, 44°19′W, ~453 m).
- **Clima:** tropical úmido; ~1.900 mm/ano; verão chuvoso (dez–mar); inverno mais seco (jun–ago).
- **Risco local #1:** encharcamento + alta umidade → podridão de raiz/caudex.
- **Risco local #2:** noites frias pontuais (jun–jul, mín. histórica ~13 °C) → proteger se &lt; 10 °C ou geada (serra próxima).

Microclimas (varanda, estufa, telhado) **sempre** prevalecem sobre a previsão genérica do município — o app deve permitir **local de cultivo** com override manual.

## Princípios de manejo (evidência + prática BR)

1. **Rega:** só quando o substrato estiver **seco em profundidade** (teste com palito/dedo); rega completa até escorrer, nunca “pingadinho diário”. Reduzir fortemente em frio/chuva.
2. **Substrato:** muito drenante, leve, aerado (ex.: casca de pinus semi-compostada + areia grossa + perlita/fibra de coco; em Bananal, **bias para drenagem**).
3. **Sol:** preferir **≥ 6 h sol direto** e boa ventilação; sombra excessiva reduz floração.
4. **Mudas jovens (~8 cm, pós-semente):** mais sensíveis a chuva direta, encharcamento e predadores; substrato ainda mais drenante; adubo **diluído e espaçado** só em crescimento ativo.
5. **Podridão:** mais frequente no frio/úmido; evitar irrigação automática cega.
6. **Floração:** favorecida em período mais seco; calor excessivo (&gt; 38 °C) pode reduzir floração temporariamente.

## Fases da planta (para regras no app)

| Fase | Critério sugerido | Rega (regra base) | Adubação (regra base) |
|------|-------------------|-------------------|------------------------|
| `MUDA_SEMENTE` | &lt; 15 cm ou &lt; 6 meses | Mais frequente que adulta, mas **só se seco** | 1/4 dose, quinzenal **só se crescendo** |
| `JOVEM` | 15–30 cm | Intervalo médio; atenção chuva | 1/2 dose, quinzenal em estação ativa |
| `ADULTA` | &gt; 30 cm, caudex formando | Intervalo longo; estação seca vs chuvas | Mensal NPK equilibrado ou K↑ na floração |
| `RECUPERACAO` | pós-doença/repique | Seco por mais tempo | **Suspender** até retomar crescimento |
| `DORMENCIA` | queda folhas/inverno | Mínima ou nenhuma | **Suspender** |

Ajustar sempre com eventos reais registrados (última rega, chuva, status).

## Calendário sazonal Bananal (simplificado para automações)

| Meses | Modo | Ações automáticas sugeridas |
|-------|------|-----------------------------|
| Out–Mar | `CHUVOSO` | Alerta “não regar” se chuva &gt; 5 mm prevista; alerta “abrigo” para mudas em chuva forte; checar drenagem |
| Abr–Mai | `TRANSICAO` | Lembrete de revisar substrato/drenagem antes do inverno |
| Jun–Ago | `SECO_FRIO` | Menos rega; alerta geada/frio (&lt; 12 °C); adubação reduzida |
| Set–Out | `ATIVO` | Início de adubação regular; monitorar floração |

## Eventos do app (domínio)

Tipos mínimos: `CHEGADA`, `REGA`, `ADUBACAO`, `REPLANTIO`, `PODA`, `MUDANCA_SOL`, `FLORACAO`, `DOENCA`, `PRAGA`, `TRATAMENTO`, `FOTO`, `CRUZAMENTO`, `SEMENTES`, `NOTA`.

Campos úteis em eventos: quantidade (ml água), produto/NPK, % sombra/sol, sintomas, severidade, fotos, clima no momento (opcional, via API).

## Genealogia

- Planta pode ter `parent_male_id`, `parent_female_id` (nullable), `origin` (`SEMENTE` | `MUDA` | `ENXERTO` | `COMPRA` | `CRUZAMENTO_PROPRIO`).
- Cruzamento: evento `CRUZAMENTO` → depois `SEMENTES` → novas plantas filhas linkadas.

## API meteorológica (gratuita)

**Open-Meteo** (sem chave): `https://api.open-meteo.com/v1/forecast`

Coordenadas padrão Bananal: `latitude=-22.68&longitude=-44.32`

Variáveis úteis: `precipitation`, `precipitation_probability`, `cloud_cover`, `sunshine_duration`, `uv_index_max`, `temperature_2m_min/max`, `relative_humidity_2m`.

**Limitações:** previsão por ponto, não “sol na minha varanda”; usar **probabilidade + regra conservadora** e permitir confirmação do usuário.

## Motor de regras (automações)

Implementar como **regras declarativas** avaliadas por cron (ex.: 1×/dia 6h) e ao abrir o app:

| ID | Condição | Alerta |
|----|----------|--------|
| `RAIN_SHELTER` | precipitação prevista &gt; 3 mm nas próximas 12 h AND planta em `MUDA_SEMENTE` OR local `EXPOSTO_CHUVA` | “Colocar à sombra / abrigo” |
| `SKIP_WATER` | chuva nas últimas 24 h &gt; 10 mm OR precip prevista &gt; 5 mm hoje | “Não regar hoje” |
| `WATER_DUE` | dias desde última `REGA` &gt; limite(fase, estação) AND substrato seco (manual ou “confirmo seco”) AND NOT `SKIP_WATER` | “Hora de verificar rega” |
| `FERT_DUE` | dias desde `ADUBACAO` &gt; limite(fase) AND estação `ATIVO` AND status ≠ `RECUPERACAO` | “Janela de adubação” |
| `COLD_PROTECT` | temp mín prevista &lt; 12 °C | “Proteger do frio” |
| `HIGH_UV` | uv_index_max &gt; 8 AND mudas sem aclimatação | “Sol forte — observar queima” |

Limites de dias (defaults editáveis pelo usuário):

- `MUDA_SEMENTE` rega: 3–5 dias (seco, fora chuva)
- `ADULTA` rega: 7–14 dias (chuvas: pausar)
- Adubação muda: 14 dias; adulta: 30 dias (só estação ativa)

## Notificações (produto)

Ordem de preferência para uso pessoal:

1. **Telegram Bot** (grátis, push imediato no celular) — recomendado para alertas de chuva.
2. **Web Push (PWA)** — sem app store; exige permissão no navegador.
3. **E-mail** (Resend/etc.) — backup diário “resumo do dia”.

Nunca notificar spam: agrupar (“3 plantas: verificar rega”) e silenciar à noite.

## Fotos de acompanhamento

- Série temporal por planta: mesma ângulo quando possível (frente + caudex).
- Exibir “dias desde última foto” e sugerir foto mensal ou pós-evento (repique, floração).

## Ao implementar código neste repositório

- Manter nomes de domínio em português na UI; enums em inglês no código é aceitável.
- Toda sugestão automática deve mostrar **por que** (regra + dados: “chuva 8 mm prevista”).
- Usuário único; auth simples.

## Referências

- UFMG — manejo Adenium (substrato, drenagem, irrigação).
- UEL — substratos e níveis de irrigação (% CRA).
- BRJ — melhoramento e condições de cultivo (sol, temperatura).
