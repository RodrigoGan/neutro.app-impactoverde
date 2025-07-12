import { Archive, Package, GlassWater, Recycle, Leaf, CircleDashed, Battery, Lightbulb, TrashIcon, Cpu, Droplets } from 'lucide-react';

export const materialDisplayData = {
  papel: { nome: 'Papel/Papelão', icone: Archive, cor: 'text-yellow-700' },
  plastico: { nome: 'Plástico', icone: Package, cor: 'text-blue-600' },
  vidro: { nome: 'Vidro', icone: GlassWater, cor: 'text-green-700' },
  metal: { nome: 'Metal', icone: Recycle, cor: 'text-gray-500' },
  aluminio: { nome: 'Alumínio', icone: Recycle, cor: 'text-gray-500' },
  latinha: { nome: 'Latinha', icone: Recycle, cor: 'text-yellow-500' },
  cobre: { nome: 'Cobre', icone: CircleDashed, cor: 'text-orange-700' },
  oleo: { nome: 'Óleo', icone: Droplets, cor: 'text-amber-700' },
  eletronico: { nome: 'Eletrônico', icone: Cpu, cor: 'text-purple-700' },
  pilhas: { nome: 'Pilhas e Baterias', icone: Battery, cor: 'text-red-700' },
  lampadas: { nome: 'Lâmpadas', icone: Lightbulb, cor: 'text-blue-700' },
  organico: { nome: 'Orgânico', icone: Leaf, cor: 'text-green-500' },
  outros: { nome: 'Outros', icone: TrashIcon, cor: 'text-neutral-500' },
}; 