import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RepresentativeData } from '@/types/register/common.types';
import { Dispatch, SetStateAction } from 'react';

interface RepresentativeFormProps {
  data: RepresentativeData;
  onDataChange: Dispatch<SetStateAction<RepresentativeData>>;
  errors: Record<string, string>;
}

// Funções de máscara para CPF e telefone
function maskCPF(value: string) {
  const cleaned = value.replace(/\D/g, '').slice(0, 11);
  return cleaned
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskPhone(value: string) {
  const cleaned = value.replace(/\D/g, '').slice(0, 11);
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  }
  return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
}

const RepresentativeForm: React.FC<RepresentativeFormProps> = ({
  data,
  onDataChange,
  errors
}) => {
  const handleChange = (field: keyof RepresentativeData, value: string) => {
    onDataChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onDataChange(prev => ({ ...prev, image: file }));
  };

  const { image } = data;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-2 mt-6">
          <div
            className="flex justify-center mb-2 cursor-pointer"
            onClick={() => document.getElementById('photo')?.click()}
            role="button"
            tabIndex={0}
            onKeyPress={e => { if (e.key === 'Enter') document.getElementById('photo')?.click(); }}
          >
            {image ? (
              <img
                src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                alt="Foto do representante"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-3xl">
                <span>+</span>
              </div>
            )}
          </div>
          <Input
            id="photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
          <label htmlFor="photo" className="text-sm text-blue-600 cursor-pointer hover:underline block text-center">Selecionar foto</label>
          {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
        </div>
        <div className="space-y-2">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" value={data.name} onChange={e => handleChange('name', e.target.value)} placeholder="Digite o nome do representante" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              type="text"
              value={maskCPF(data.cpf || '')}
              onChange={e => {
                const onlyNums = e.target.value.replace(/\D/g, '');
                onDataChange({ ...data, cpf: onlyNums });
              }}
              maxLength={14}
              inputMode="numeric"
              pattern="\d*"
              placeholder="000.000.000-00"
            />
            {errors.cpf && <p className="text-xs text-red-500 mt-1">{errors.cpf}</p>}
          </div>
          <div>
            <Label htmlFor="email">E-mail *</Label>
            <Input id="email" type="email" value={data.email} onChange={e => handleChange('email', e.target.value)} placeholder="Digite o e-mail" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              type="text"
              value={maskPhone(data.phone || '')}
              onChange={e => {
                const onlyNums = e.target.value.replace(/\D/g, '');
                onDataChange({ ...data, phone: onlyNums });
              }}
              maxLength={15}
              inputMode="numeric"
              pattern="\d*"
              placeholder="(00) 00000-0000"
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>
          <div>
            <Label htmlFor="position">Cargo *</Label>
            <Input id="position" value={data.position} onChange={e => handleChange('position', e.target.value)} placeholder="Digite o cargo" />
            {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RepresentativeForm; 