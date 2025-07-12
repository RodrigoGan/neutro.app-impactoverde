import { useState } from 'react';

export interface Collector {
  id: string;
  name: string;
  rating: number;
  materials: string[];
  region: string;
  image: string;
  photo?: string;
  totalCollections?: number;
  coletasComUsuario?: number;
  ultimaColetaComUsuario?: string;
}

const COLLECTORS_MOCK: Collector[] = [
  {
    id: '1',
    name: 'João Silva',
    rating: 4.8,
    materials: ['Papel', 'Plástico', 'Metal', 'Vidro'],
    region: 'Zona Sul',
    image: '/collectors/collector1.jpg',
    photo: 'https://github.com/shadcn.png',
    totalCollections: 156,
    coletasComUsuario: 5,
    ultimaColetaComUsuario: '2024-03-15'
  },
  {
    id: '2',
    name: 'Maria Santos',
    rating: 4.9,
    materials: ['Papel', 'Plástico', 'Metal'],
    region: 'Zona Norte',
    image: '/collectors/collector2.jpg',
    photo: 'https://github.com/shadcn.png',
    totalCollections: 234,
    coletasComUsuario: 3,
    ultimaColetaComUsuario: '2024-03-10'
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    rating: 4.7,
    materials: ['Papel', 'Plástico', 'Metal', 'Vidro'],
    region: 'Zona Sul',
    image: '/collectors/collector3.jpg',
    photo: 'https://github.com/shadcn.png',
    totalCollections: 189,
    coletasComUsuario: 0,
    ultimaColetaComUsuario: '2024-03-01'
  }
];

export const useCollectors = () => {
  const [collectors, setCollectors] = useState<Collector[]>(COLLECTORS_MOCK);
  const [loading, setLoading] = useState(false);

  const getCompatibleCollectors = (region: string, materials: string[]) => {
    return collectors.filter(collector => 
      collector.region === region && 
      materials.every(material => collector.materials.includes(material))
    );
  };

  return {
    collectors,
    loading,
    getCompatibleCollectors
  };
}; 