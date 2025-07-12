import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AddressData } from '@/types/register/common.types';
import { Dispatch, SetStateAction } from 'react';

interface AddressFormProps {
  data: AddressData;
  onDataChange: Dispatch<SetStateAction<AddressData>>;
  errors: Record<string, string>;
}

const AddressForm: React.FC<AddressFormProps> = ({
  data,
  onDataChange,
  errors
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof AddressData, value: string) => {
    onDataChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchAddressByCep = async (cep: string) => {
    try {
      setIsLoading(true);
      const formattedCep = cep.replace(/\D/g, '');
      
      if (formattedCep.length !== 8) {
        return;
      }

      const response = await fetch(`https://viacep.com.br/ws/${formattedCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        onDataChange(prev => ({
          ...prev,
          cep: formattedCep,
          rua: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || ''
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCepChange = (value: string) => {
    const formattedCep = value.replace(/\D/g, '');
    handleChange('cep', formattedCep);

    if (formattedCep.length === 8) {
      fetchAddressByCep(formattedCep);
    }
  };

  const formatCep = (value: string) => {
    const cep = value.replace(/\D/g, '');
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-2 mt-6">
          <div>
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              value={formatCep(data.cep)}
              onChange={(e) => handleCepChange(e.target.value)}
              placeholder="Digite o CEP"
              maxLength={9}
              disabled={isLoading}
            />
            {errors.cep && <p className="text-sm text-red-500">{errors.cep}</p>}
          </div>
          <div>
            <Label htmlFor="rua">Rua</Label>
            <Input
              id="rua"
              value={data.rua}
              onChange={(e) => handleChange('rua', e.target.value)}
              placeholder="Digite a rua"
              disabled={isLoading}
            />
            {errors.rua && <p className="text-sm text-red-500">{errors.rua}</p>}
          </div>
          <div>
            <Label htmlFor="numero">Número</Label>
            <Input
              id="numero"
              value={data.numero}
              onChange={(e) => handleChange('numero', e.target.value)}
              placeholder="Digite o número"
              disabled={isLoading}
            />
            {errors.numero && <p className="text-sm text-red-500">{errors.numero}</p>}
          </div>
          <div>
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              value={data.complemento}
              onChange={(e) => handleChange('complemento', e.target.value)}
              placeholder="Digite o complemento"
              disabled={isLoading}
            />
            {errors.complemento && <p className="text-sm text-red-500">{errors.complemento}</p>}
          </div>
          <div>
            <Label htmlFor="bairro">Bairro</Label>
            <Input
              id="bairro"
              value={data.bairro}
              onChange={(e) => handleChange('bairro', e.target.value)}
              placeholder="Digite o bairro"
              disabled={isLoading}
            />
            {errors.bairro && <p className="text-sm text-red-500">{errors.bairro}</p>}
          </div>
          <div>
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              value={data.cidade}
              onChange={(e) => handleChange('cidade', e.target.value)}
              placeholder="Digite a cidade"
              disabled={isLoading}
            />
            {errors.cidade && <p className="text-sm text-red-500">{errors.cidade}</p>}
          </div>
          <div>
            <Label htmlFor="estado">Estado</Label>
            <Input
              id="estado"
              value={data.estado}
              onChange={(e) => handleChange('estado', e.target.value)}
              placeholder="Digite o estado"
              disabled={isLoading}
            />
            {errors.estado && <p className="text-sm text-red-500">{errors.estado}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressForm; 