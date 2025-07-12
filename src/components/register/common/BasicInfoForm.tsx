import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BaseUserData } from '@/types/register/common.types';
import { Dispatch, SetStateAction } from 'react';

interface BasicInfoFormProps {
  data: BaseUserData;
  onDataChange: Dispatch<SetStateAction<BaseUserData>>;
  errors: Record<string, string>;
  userType?: 'common' | 'collector' | 'cooperative' | 'company' | 'partner';
  partnerType?: 'restaurant' | 'store' | 'educational' | null;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  data,
  onDataChange,
  errors,
  userType,
  partnerType
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof BaseUserData, value: string) => {
    onDataChange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      onDataChange(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Funções de máscara e validação
  function maskCPF(value: string) {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }

  function maskCNPJ(value: string) {
    const cleaned = value.replace(/\D/g, '').slice(0, 14);
    return cleaned
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }

  function isValidCPF(value: string) {
    return value.replace(/\D/g, '').length === 11;
  }

  function isValidCNPJ(value: string) {
    return value.replace(/\D/g, '').length === 14;
  }

  // Função de máscara e validação de telefone
  function maskPhone(value: string) {
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{0,4})/, (m, a, b, c) => c ? `(${a}) ${b}-${c}` : b ? `(${a}) ${b}` : a ? `(${a}` : '');
    }
    return cleaned.replace(/(\d{2})(\d{5})(\d{0,4})/, (m, a, b, c) => c ? `(${a}) ${b}-${c}` : b ? `(${a}) ${b}` : a ? `(${a}` : '');
  }

  function isValidPhone(value: string) {
    const len = value.replace(/\D/g, '').length;
    return len === 10 || len === 11;
  }

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
            {data.image ? (
              <img
                src={URL.createObjectURL(data.image)}
                alt="Foto de perfil"
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
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <label htmlFor="photo" className="text-sm text-blue-600 cursor-pointer hover:underline block text-center">
            {(userType === 'cooperative' || userType === 'company' || userType === 'partner') ? 'Selecionar Logotipo ou uma foto' : 'Selecionar foto'}
          </label>
          {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
        </div>
        <div className="space-y-2">
          <div>
            <Label htmlFor="name">
              {userType === 'cooperative' ? 'Nome da Cooperativa'
                : userType === 'company' ? 'Nome da Empresa Coletora'
                : userType === 'partner' && partnerType === 'restaurant' ? 'Nome do Restaurante'
                : userType === 'partner' && partnerType === 'store' ? 'Nome da Loja'
                : userType === 'partner' && partnerType === 'educational' ? 'Nome da Instituição'
                : userType === 'partner' ? 'Nome da Empresa'
                : 'Nome completo'}
            </Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Digite o nome"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="document">
              {userType === 'cooperative' || userType === 'company' || userType === 'partner' ? 'Documento CNPJ' : 'Documento CPF'}
            </Label>
            <Input
              id="document"
              value={userType === 'cooperative' || userType === 'company' || userType === 'partner' ? maskCNPJ(data.document) : maskCPF(data.document)}
              onChange={e => {
                let val = e.target.value.replace(/\D/g, '');
                if (userType === 'cooperative' || userType === 'company' || userType === 'partner') {
                  if (val.length > 14) val = val.slice(0, 14);
                } else {
                  if (val.length > 11) val = val.slice(0, 11);
                }
                handleChange('document', val);
              }}
              placeholder={userType === 'cooperative' || userType === 'company' || userType === 'partner' ? '00.000.000/0001-00' : '000.000.000-00'}
              inputMode="numeric"
              maxLength={userType === 'cooperative' || userType === 'company' || userType === 'partner' ? 18 : 14}
            />
            {errors.document && <p className="text-sm text-red-500">{errors.document}</p>}
            {data.document && userType !== 'cooperative' && userType !== 'company' && userType !== 'partner' && !isValidCPF(data.document) && (
              <p className="text-xs text-red-500">CPF deve ter 11 dígitos</p>
            )}
            {data.document && (userType === 'cooperative' || userType === 'company' || userType === 'partner') && !isValidCNPJ(data.document) && (
              <p className="text-xs text-red-500">CNPJ deve ter 14 dígitos</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Digite o e-mail"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={maskPhone(data.phone)}
              onChange={e => {
                let val = e.target.value.replace(/\D/g, '');
                if (val.length > 11) val = val.slice(0, 11);
                handleChange('phone', val);
              }}
              placeholder="(00) 00000-0000"
              inputMode="numeric"
              maxLength={15}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
            {data.phone && !isValidPhone(data.phone) && (
              <p className="text-xs text-red-500">Telefone deve ter 10 ou 11 dígitos</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="Digite a senha"
            />
            <p className="text-xs text-muted-foreground">A senha deve ter pelo menos 6 caracteres.</p>
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={data.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="Confirme a senha"
            />
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicInfoForm; 