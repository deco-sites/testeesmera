import type { AvailabilityStatus } from "./data.ts";

export interface AvailabilityMeta {
  label: string;
  compactLabel: string;
  enquiryLabel: string;
}

export const availabilityMeta: Record<AvailabilityStatus, AvailabilityMeta> = {
  unique: {
    label: "Peça única",
    compactLabel: "PEÇA ÚNICA",
    enquiryLabel: "Peça única · consulta",
  },
  available: {
    label: "Disponível para aquisição",
    compactLabel: "DISPONÍVEL PARA AQUISIÇÃO",
    enquiryLabel: "Disponível para aquisição",
  },
  made_to_order: {
    label: "Sob encomenda · consulta",
    compactLabel: "SOB ENCOMENDA · CONSULTA",
    enquiryLabel: "Sob encomenda · consulta",
  },
  limited: {
    label: "Edição limitada",
    compactLabel: "EDIÇÃO LIMITADA",
    enquiryLabel: "Edição limitada · consulta",
  },
  archive: {
    label: "Acervo / indisponível",
    compactLabel: "ACERVO / INDISPONÍVEL",
    enquiryLabel: "Acervo / indisponível",
  },
};

export function getAvailabilityMeta(status: AvailabilityStatus) {
  return availabilityMeta[status];
}
