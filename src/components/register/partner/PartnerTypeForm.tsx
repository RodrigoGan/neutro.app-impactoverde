import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { EducationTypeSwitch } from '@/components/register/educational/EducationTypeSwitch';
import EducationLevelSwitch from '@/components/register/educational/EducationLevelSwitch';

interface PartnerTypeFormProps {
  type: 'restaurant' | 'store' | 'educational';
  data: any;
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

const PartnerTypeForm: React.FC<PartnerTypeFormProps> = ({ 
  type,
  data, 
  onChange, 
  errors 
}) => {
  const renderRestaurantFields = () => (
    <>
      <div className="space-y-2">
        <Label>Tipos de Atendimento *</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="delivery"
              checked={data.attendDelivery}
              onCheckedChange={(checked) => onChange({ attendDelivery: checked })}
            />
            <Label htmlFor="delivery">Delivery</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="presencial"
              checked={data.attendPresencial}
              onCheckedChange={(checked) => onChange({ attendPresencial: checked })}
            />
            <Label htmlFor="presencial">Presencial</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="buffet"
              checked={data.attendBuffet}
              onCheckedChange={(checked) => onChange({ attendBuffet: checked })}
            />
            <Label htmlFor="buffet">Buffet</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="marmitex"
              checked={data.attendMarmitex}
              onCheckedChange={(checked) => onChange({ attendMarmitex: checked })}
            />
            <Label htmlFor="marmitex">Marmitex</Label>
          </div>
        </div>
        {errors.attendTypes && (
          <p className="text-red-500 text-xs mt-1">{errors.attendTypes}</p>
        )}
      </div>

      <div>
        <Label htmlFor="cuisineType">Tipo de Cozinha *</Label>
        <Select
          value={data.cuisineType}
          onValueChange={(value) => onChange({ cuisineType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de cozinha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="brasileira">Brasileira</SelectItem>
            <SelectItem value="italiana">Italiana</SelectItem>
            <SelectItem value="japonesa">Japonesa</SelectItem>
            <SelectItem value="chinesa">Chinesa</SelectItem>
            <SelectItem value="mexicana">Mexicana</SelectItem>
            <SelectItem value="outros">Outros</SelectItem>
          </SelectContent>
        </Select>
        {errors.cuisineType && (
          <p className="text-red-500 text-xs mt-1">{errors.cuisineType}</p>
        )}
      </div>

      <div>
        <Label htmlFor="capacity">Capacidade *</Label>
        <Input
          id="capacity"
          type="number"
          value={data.capacity}
          onChange={(e) => onChange({ capacity: e.target.value })}
          required
        />
        {errors.capacity && (
          <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>
        )}
      </div>

      <div>
        <Label htmlFor="openingHours">Horário de Funcionamento *</Label>
        <Input
          id="openingHours"
          value={data.openingHours}
          onChange={(e) => onChange({ openingHours: e.target.value })}
          placeholder="Ex: Seg-Sex: 11h-22h, Sáb-Dom: 12h-23h"
          required
        />
        {errors.openingHours && (
          <p className="text-red-500 text-xs mt-1">{errors.openingHours}</p>
        )}
      </div>

      <div>
        <Label htmlFor="priceRange">Faixa de Preço *</Label>
        <Select
          value={data.priceRange}
          onValueChange={(value) => onChange({ priceRange: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a faixa de preço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="economico">Econômico</SelectItem>
            <SelectItem value="medio">Médio</SelectItem>
            <SelectItem value="alto">Alto</SelectItem>
          </SelectContent>
        </Select>
        {errors.priceRange && (
          <p className="text-red-500 text-xs mt-1">{errors.priceRange}</p>
        )}
      </div>
    </>
  );

  const renderStoreFields = () => (
    <>
      <div>
        <Label htmlFor="businessType">Tipo de Negócio *</Label>
        <Select
          value={data.businessType}
          onValueChange={(value) => onChange({ businessType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de negócio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alimentos">Alimentos</SelectItem>
            <SelectItem value="vestuario">Vestuário</SelectItem>
            <SelectItem value="eletronicos">Eletrônicos</SelectItem>
            <SelectItem value="outros">Outros</SelectItem>
          </SelectContent>
        </Select>
        {errors.businessType && (
          <p className="text-red-500 text-xs mt-1">{errors.businessType}</p>
        )}
      </div>

      <div>
        <Label htmlFor="size">Tamanho do Estabelecimento *</Label>
        <Input
          id="size"
          value={data.size}
          onChange={(e) => onChange({ size: e.target.value })}
          placeholder="Ex: 100m²"
          required
        />
        {errors.size && (
          <p className="text-red-500 text-xs mt-1">{errors.size}</p>
        )}
      </div>

      <div>
        <Label htmlFor="openingHours">Horário de Funcionamento *</Label>
        <Input
          id="openingHours"
          value={data.openingHours}
          onChange={(e) => onChange({ openingHours: e.target.value })}
          placeholder="Ex: Seg-Sab: 9h-18h, Dom: 14h-20h"
          required
        />
        {errors.openingHours && (
          <p className="text-red-500 text-xs mt-1">{errors.openingHours}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Categorias de Produtos *</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="alimentos"
              checked={data.categories?.includes('alimentos')}
              onCheckedChange={(checked) => {
                const categories = data.categories || [];
                onChange({
                  categories: checked
                    ? [...categories, 'alimentos']
                    : categories.filter((c: string) => c !== 'alimentos')
                });
              }}
            />
            <Label htmlFor="alimentos">Alimentos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="vestuario"
              checked={data.categories?.includes('vestuario')}
              onCheckedChange={(checked) => {
                const categories = data.categories || [];
                onChange({
                  categories: checked
                    ? [...categories, 'vestuario']
                    : categories.filter((c: string) => c !== 'vestuario')
                });
              }}
            />
            <Label htmlFor="vestuario">Vestuário</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="eletronicos"
              checked={data.categories?.includes('eletronicos')}
              onCheckedChange={(checked) => {
                const categories = data.categories || [];
                onChange({
                  categories: checked
                    ? [...categories, 'eletronicos']
                    : categories.filter((c: string) => c !== 'eletronicos')
                });
              }}
            />
            <Label htmlFor="eletronicos">Eletrônicos</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="outros"
              checked={data.categories?.includes('outros')}
              onCheckedChange={(checked) => {
                const categories = data.categories || [];
                onChange({
                  categories: checked
                    ? [...categories, 'outros']
                    : categories.filter((c: string) => c !== 'outros')
                });
              }}
            />
            <Label htmlFor="outros">Outros</Label>
          </div>
        </div>
        {errors.categories && (
          <p className="text-red-500 text-xs mt-1">{errors.categories}</p>
        )}
      </div>
    </>
  );

  const renderEducationalFields = () => (
    <>
      <div>
        <Label htmlFor="institutionType">Tipo de Instituição *</Label>
        <EducationTypeSwitch
          value={data.institutionType}
          onChange={(value) => onChange({ institutionType: value })}
          otherInstitutionTypeDesc={data.institutionTypeOtherDesc}
          onOtherInstitutionTypeDescChange={(desc) => onChange({ institutionTypeOtherDesc: desc })}
          error={errors.institutionType}
        />
      </div>
      <div>
        <Label htmlFor="educationLevels">Níveis de Ensino *</Label>
        <EducationLevelSwitch
          value={data.educationLevels || []}
          onChange={(levels) => onChange({ educationLevels: levels })}
          otherEducationLevelDesc={data.educationLevelsOtherDesc || ''}
          onOtherEducationLevelDescChange={(desc) => onChange({ educationLevelsOtherDesc: desc })}
          error={errors.educationLevels}
        />
      </div>
      <div>
        <Label htmlFor="activePrograms">Programas Ambientais Ativos *</Label>
        <Input
          id="activePrograms"
          placeholder="Ex: Educação Ambiental, Projetos de Sustentabilidade..."
          value={data.activePrograms || ''}
          onChange={e => onChange({ activePrograms: e.target.value })}
        />
        {errors.activePrograms && <p className="text-red-500 text-xs mt-1">{errors.activePrograms}</p>}
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      {type === 'restaurant' && renderRestaurantFields()}
      {type === 'store' && renderStoreFields()}
      {type === 'educational' && renderEducationalFields()}
    </div>
  );
};

export default PartnerTypeForm; 