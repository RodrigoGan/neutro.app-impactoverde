export const TRANSPORT_TYPES = [
  { value: 'foot', label: 'A pé', icon: 'user' },
  { value: 'bicycle', label: 'Bicicleta', icon: 'bicycle' },
  { value: 'motorcycle', label: 'Moto', icon: 'motorcycle' },
  { value: 'car', label: 'Carro', icon: 'car' },
  { value: 'truck', label: 'Caminhão', icon: 'truck' },
  { value: 'cart', label: 'Carrinho de mão', icon: 'cart' },
  { value: 'other', label: 'Outro', icon: 'truck' }
] as const;

export type TransportType = typeof TRANSPORT_TYPES[number]['value']; 