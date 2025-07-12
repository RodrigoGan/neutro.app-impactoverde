import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { materialDisplayData } from "@/config/materialDisplayData"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMaterialIdentificador(nome: string) {
  if (typeof nome !== 'string' || !nome) {
    return 'outros';
  }
  for (const [identificador, material] of Object.entries(materialDisplayData)) {
    if (
      material.nome.toLowerCase() === nome.toLowerCase() ||
      identificador.toLowerCase() === nome.toLowerCase()
    ) {
      return identificador;
    }
  }
  return 'outros';
}
