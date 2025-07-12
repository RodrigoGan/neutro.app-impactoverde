import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface Address {
  id: string;
  tipo: 'principal' | 'secundario';
  logradouro: string;
  numero: string;
  complemento?: string;
  referencia?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  regiao: string;
}

export const ENDERECOS_MOCK: Address[] = [
  {
    id: '1',
    tipo: 'principal',
    logradouro: 'Rua das Flores',
    numero: '123',
    complemento: 'Apto 45',
    bairro: 'Jardim das Flores',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    regiao: 'Zona Sul'
  }
];

// ATENÇÃO: O fallback para ENDERECOS_MOCK deve ser removido quando o sistema estiver 100% rodando!
export const useAddress = (userId: string) => {
  const [enderecos, setEnderecos] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>(undefined);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    logradouro: '',
    numero: '',
    complemento: '',
    referencia: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    regiao: ENDERECOS_MOCK[0].regiao,
  });
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAddresses() {
      setLoading(true);
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId);
      if (error || !data || data.length === 0) {
        // Fallback para mocks (remover em produção)
        setEnderecos(ENDERECOS_MOCK);
        setSelectedAddress(ENDERECOS_MOCK[0]);
      } else {
        setEnderecos(data);
        setSelectedAddress(data[0]);
      }
      setLoading(false);
    }
    if (userId) fetchAddresses();
  }, [userId]);

  useEffect(() => {
    const cep = newAddress.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      setIsLoadingCep(true);
      fetch(`https://viacep.com.br/ws/${cep}/json/`)
        .then(res => res.json())
        .then(data => {
          if (!data.erro) {
            setNewAddress(prev => ({
              ...prev,
              logradouro: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              estado: data.uf
            }));
          }
        })
        .finally(() => setIsLoadingCep(false));
    }
  }, [newAddress.cep]);

  const handleAddAddress = () => {
    if (!newAddress.logradouro || !newAddress.numero || !newAddress.cidade || !newAddress.estado || !newAddress.cep || !newAddress.regiao) {
      return false;
    }
    const address: Address = {
      id: Date.now().toString(),
      tipo: 'secundario',
      ...newAddress,
    };
    setEnderecos([...enderecos, address]);
    setShowAddressForm(false);
    setNewAddress({ 
      logradouro: '', 
      numero: '', 
      complemento: '', 
      referencia: '', 
      bairro: '',
      cidade: '', 
      estado: '', 
      cep: '', 
      regiao: ENDERECOS_MOCK[0].regiao 
    });
    return true;
  };

  const handleRemoveEndereco = (id: string) => {
    setEnderecos(enderecos.filter(endereco => endereco.id !== id));
    if (selectedAddress?.id === id) {
      const newPrincipal = enderecos.find(e => e.id !== id && e.tipo === 'principal') || (enderecos.length > 1 ? enderecos.filter(e => e.id !== id)[0] : undefined);
      setSelectedAddress(newPrincipal);
    }
  };

  const handleSetMainAddress = (id: string) => {
    setEnderecos(prevEnderecos =>
      prevEnderecos.map(addr => ({
        ...addr,
        tipo: addr.id === id ? 'principal' : 'secundario',
      }))
    );
    const newMain = enderecos.find(addr => addr.id === id);
    if (newMain) {
      setSelectedAddress(newMain);
    }
  };

  return {
    enderecos,
    setEnderecos,
    selectedAddress,
    setSelectedAddress,
    showAddressForm,
    setShowAddressForm,
    newAddress,
    setNewAddress,
    isLoadingCep,
    handleAddAddress,
    handleRemoveEndereco,
    handleSetMainAddress,
    loading
  };
}; 