import type { EventType, PlantPhase, PlantStatus, PlantOrigin } from "@prisma/client";

export const eventTypeLabels: Record<EventType, string> = {
  CHEGADA: "Chegada",
  REGA: "Rega",
  ADUBACAO: "Adubação",
  REPLANTIO: "Replantio",
  PODA: "Poda",
  MUDANCA_SOL: "Mudança de sol",
  FLORACAO: "Floração",
  DOENCA: "Doença",
  PRAGA: "Praga",
  TRATAMENTO: "Tratamento",
  FOTO: "Foto",
  CRUZAMENTO: "Cruzamento",
  SEMENTES: "Sementes",
  POLINIZACAO: "Polinização",
  RESULTADO_POLINIZACAO: "Resultado da polinização",
  NOTA: "Nota",
};

export const phaseLabels: Record<PlantPhase, string> = {
  MUDA_SEMENTE: "Muda (semente)",
  JOVEM: "Jovem",
  ADULTA: "Adulta",
  RECUPERACAO: "Recuperação",
  DORMENCIA: "Dormência",
};

export const statusLabels: Record<PlantStatus, string> = {
  SAUDAVEL: "Saudável",
  STRESS: "Estresse",
  DOENTE: "Doente",
  RECUPERACAO: "Recuperação",
  DORMENCIA: "Dormência",
};

export const originLabels: Record<PlantOrigin, string> = {
  SEMENTE: "Semente",
  MUDA: "Muda",
  ENXERTO: "Enxerto",
  COMPRA: "Compra",
  CRUZAMENTO_PROPRIO: "Cruzamento próprio",
};

export const quickEventTypes: EventType[] = [
  "REGA",
  "ADUBACAO",
  "REPLANTIO",
  "FOTO",
  "NOTA",
  "FLORACAO",
  "DOENCA",
];
