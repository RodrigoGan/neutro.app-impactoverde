import { 
  Archive, 
  Package, 
  Recycle, 
  GlassWater, 
  Leaf, 
  CircleDashed, 
  Cpu, 
  Droplets, 
  TrashIcon,
  Battery,
  Lightbulb,
  LucideIcon 
} from 'lucide-react';

// Tipos
export type MaterialId = 
  | 'papel'
  | 'plastico'
  | 'vidro'
  | 'metal'
  | 'aluminio'
  | 'cobre'
  | 'oleo'
  | 'eletronico'
  | 'pilhas'
  | 'lampadas'
  | 'organico'
  | 'outros';

export type UnidadeId = 'kg' | 'un' | 'sacos' | 'L';

// Interface para Material
export interface Material {
  id: MaterialId;
  nome: string;
  unidadeDefault: UnidadeId;
  conversao: {
    kg: number;      // 1 kg = 1 kg
    un: number;      // 1 unidade = X kg
    sacos: number;   // 1 saco = X kg
    L: number;       // 1 litro = X kg
  };
  icone: LucideIcon;
  cor: string;
}

// Materiais disponíveis
export const MATERIAIS: Record<MaterialId, Material> = {
  papel: {
    id: 'papel',
    nome: 'Papel/Papelão',
    unidadeDefault: 'kg',
    conversao: {
      kg: 1,
      un: 0.2,    // 1 unidade = 0.2 kg
      sacos: 2,   // 1 saco = 2 kg
      L: 0.5      // 1 litro = 0.5 kg
    },
    icone: Archive,
    cor: 'text-yellow-700'
  },
  plastico: {
    id: 'plastico',
    nome: 'Plástico',
    unidadeDefault: 'kg',
    conversao: {
      kg: 1,
      un: 0.1,    // 1 unidade = 0.1 kg
      sacos: 1,   // 1 saco = 1 kg
      L: 0.3      // 1 litro = 0.3 kg
    },
    icone: Package,
    cor: 'text-blue-600'
  },
  vidro: {
    id: 'vidro',
    nome: 'Vidro',
    unidadeDefault: 'kg',
    conversao: {
      kg: 1,
      un: 0.5,    // 1 unidade = 0.5 kg
      sacos: 5,   // 1 saco = 5 kg
      L: 1.2      // 1 litro = 1.2 kg
    },
    icone: GlassWater,
    cor: 'text-green-700'
  },
  metal: {
    id: 'metal',
    nome: 'Metal (geral)',
    unidadeDefault: 'kg',
    conversao: {
      kg: 1,
      un: 0.3,    // 1 unidade = 0.3 kg
      sacos: 3,   // 1 saco = 3 kg
      L: 0.8      // 1 litro = 0.8 kg
    },
    icone: Recycle,
    cor: 'text-gray-500'
  },
  aluminio: {
    id: 'aluminio',
    nome: 'Alumínio (lata, etc)',
    unidadeDefault: 'kg',
    conversao: {
      kg: 1,
      un: 0.02,   // 1 unidade = 0.02 kg
      sacos: 1.5, // 1 saco = 1.5 kg
      L: 0.4      // 1 litro = 0.4 kg
    },
    icone: Recycle,
    cor: 'text-gray-500'
  },
  cobre: {
    id: 'cobre',
    nome: 'Cobre',
    unidadeDefault: 'kg',
    conversao: {
      kg: 1,
      un: 0.2,    // 1 unidade = 0.2 kg
      sacos: 2,   // 1 saco = 2 kg
      L: 0.6      // 1 litro = 0.6 kg
    },
    icone: CircleDashed,
    cor: 'text-orange-700'
  },
  oleo: {
    id: 'oleo',
    nome: 'Óleo de Cozinha Usado',
    unidadeDefault: 'L',
    conversao: {
      kg: 0.92,   // 1 kg = 0.92 L
      un: 0.9,    // 1 unidade = 0.9 L
      sacos: 1,   // 1 saco = 1 L
      L: 1        // 1 litro = 1 L
    },
    icone: Droplets,
    cor: 'text-amber-700'
  },
  eletronico: {
    id: 'eletronico',
    nome: 'Eletrônicos Pequenos',
    unidadeDefault: 'un',
    conversao: {
      kg: 0.5,    // 1 kg = 0.5 un
      un: 1,      // 1 unidade = 1 un
      sacos: 2,   // 1 saco = 2 un
      L: 0.3      // 1 litro = 0.3 un
    },
    icone: Cpu,
    cor: 'text-purple-700'
  },
  pilhas: {
    id: 'pilhas',
    nome: 'Pilhas e Baterias',
    unidadeDefault: 'un',
    conversao: {
      kg: 0.03,   // 1 kg = 0.03 un
      un: 1,      // 1 unidade = 1 un
      sacos: 0.2, // 1 saco = 0.2 un
      L: 0.1      // 1 litro = 0.1 un
    },
    icone: Battery,
    cor: 'text-red-700'
  },
  lampadas: {
    id: 'lampadas',
    nome: 'Lâmpadas Fluorescentes',
    unidadeDefault: 'un',
    conversao: {
      kg: 0.15,   // 1 kg = 0.15 un
      un: 1,      // 1 unidade = 1 un
      sacos: 0.3, // 1 saco = 0.3 un
      L: 0.2      // 1 litro = 0.2 un
    },
    icone: Lightbulb,
    cor: 'text-blue-700'
  },
  organico: {
    id: 'organico',
    nome: 'Orgânico Compostável',
    unidadeDefault: 'kg',
    conversao: {
      kg: 1,
      un: 0.3,    // 1 unidade = 0.3 kg
      sacos: 2,   // 1 saco = 2 kg
      L: 0.4      // 1 litro = 0.4 kg
    },
    icone: Leaf,
    cor: 'text-green-500'
  },
  outros: {
    id: 'outros',
    nome: 'Outros (especificar)',
    unidadeDefault: 'kg',
    conversao: {
      kg: 1,
      un: 0.2,    // 1 unidade = 0.2 kg
      sacos: 2,   // 1 saco = 2 kg
      L: 0.5      // 1 litro = 0.5 kg
    },
    icone: TrashIcon,
    cor: 'text-neutral-500'
  }
};

// Unidades disponíveis
export const UNIDADES: UnidadeId[] = ['kg', 'un', 'sacos', 'L'];

// Função utilitária para converter entre unidades
export function converterUnidade(
  materialId: MaterialId,
  quantidade: number,
  unidadeOrigem: UnidadeId,
  unidadeDestino: UnidadeId
): number {
  const material = MATERIAIS[materialId];
  if (!material) return quantidade;

  // Primeiro converte para kg
  const emKg = quantidade * material.conversao[unidadeOrigem];
  // Depois converte de kg para a unidade destino
  return emKg / material.conversao[unidadeDestino];
}

// Função para obter a lista de materiais em formato de array
export function getMateriaisList(): Material[] {
  return Object.values(MATERIAIS);
}

// Função para obter um material específico
export function getMaterial(id: MaterialId): Material | undefined {
  return MATERIAIS[id];
} 