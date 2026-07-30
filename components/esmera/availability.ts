import type { AvailabilityStatus } from "./data.ts";

export interface AvailabilityMeta {
  label: string;
  compactLabel: string;
  enquiryLabel: string;
}

export const availabilityMeta: Record<AvailabilityStatus, AvailabilityMeta> = {
  unique: {
    label: "Disponível",
    compactLabel: "PEÇA ÚNICA",
    enquiryLabel: "Peça única · consulta",
  },
  available: {
    label: "Disponível",
    compactLabel: "DISPONÍVEL PARA AQUISIÇÃO",
    enquiryLabel: "Disponível para aquisição",
  },
  made_to_order: {
    label: "Sob encomenda",
    compactLabel: "SOB ENCOMENDA",
    enquiryLabel: "Sob encomenda · consulta",
  },
  limited: {
    label: "Disponível",
    compactLabel: "EDIÇÃO LIMITADA",
    enquiryLabel: "Edição limitada · consulta",
  },
  archive: {
    label: "Indisponível",
    compactLabel: "ACERVO",
    enquiryLabel: "Acervo / indisponível",
  },
};

export function getAvailabilityMeta(status: AvailabilityStatus) {
  return availabilityMeta[status];
}
