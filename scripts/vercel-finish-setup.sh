#!/usr/bin/env bash
# Conclui Postgres + redeploy no time hci8/caudexia (rode após aceitar termos Neon).
set -euo pipefail
cd "$(dirname "$0")/.."
SCOPE="hci8"

echo "→ Instalando integração Neon (aceite os termos se o CLI pedir)…"
npx vercel@latest integration add neon --scope "$SCOPE"

echo "→ Criando/recursos Neon e ligando ao projeto caudexia…"
# Após install, o dashboard ou `vercel integration-resource` guia a criação do DB.
# Se DATABASE_URL já existir no projeto, só redeploy:
npx vercel@latest deploy --prod --scope "$SCOPE"

echo "→ Produção: https://caudexia.vercel.app"
