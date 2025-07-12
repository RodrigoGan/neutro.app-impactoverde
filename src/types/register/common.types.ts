export interface BaseUserData {
  image: File | null;
  name: string;
  document: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  vehicleType?: string;
  otherVehicleDescription?: string;
  selectedNeighborhoods?: string[];
}

export interface AddressData {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface RepresentativeData {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  position: string;
  image?: File | null;
}

export type UserType = 'common' | 'collector' | 'cooperative' | 'company' | 'partner'; 