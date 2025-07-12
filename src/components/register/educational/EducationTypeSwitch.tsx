import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const EDUCATION_TYPES = [
  { key: 'escola', label: 'Escola', icon: <span role="img" aria-label="Escola">🏫</span>, color: 'text-blue-700' },
  { key: 'faculdade', label: 'Faculdade', icon: <span role="img" aria-label="Faculdade">🎓</span>, color: 'text-purple-700' },
  { key: 'centro', label: 'Centro de Educação', icon: <span role="img" aria-label="Centro de Educação">🏢</span>, color: 'text-green-700' },
  { key: 'tecnico', label: 'Curso Técnico', icon: <span role="img" aria-label="Curso Técnico">🛠️</span>, color: 'text-orange-700' },
  { key: 'ong', label: 'ONG', icon: <span role="img" aria-label="ONG">🤝</span>, color: 'text-pink-700' },
  { key: 'outros', label: 'Outros', icon: <span role="img" aria-label="Outros">✨</span>, color: 'text-indigo-700' },
] as const;

type EducationTypeKey = typeof EDUCATION_TYPES[number]['key'];

type Props = {
  value: EducationTypeKey | null;
  onChange: (value: EducationTypeKey) => void;
  error?: string;
  otherInstitutionTypeDesc?: string;
  onOtherInstitutionTypeDescChange?: (desc: string) => void;
};

export const EducationTypeSwitch: React.FC<Props> = ({ value, onChange, error, otherInstitutionTypeDesc, onOtherInstitutionTypeDescChange }) => {
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 mb-2">
        {EDUCATION_TYPES.map(type => (
          <div key={type.key} className="flex items-center space-x-2">
            <Switch
              id={type.key}
              checked={value === type.key}
              onCheckedChange={() => onChange(type.key)}
            />
            <label htmlFor={type.key} className={`flex items-center gap-1 font-medium cursor-pointer ${type.color}`}>
              {type.icon} {type.label}
            </label>
          </div>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {value === 'outros' && (
        <div className="mt-2">
          <Label htmlFor="other-education-type" className="text-sm text-gray-600">
            Descreva o tipo de instituição
          </Label>
          <Input
            id="other-education-type"
            className="mt-1"
            placeholder="Ex: Instituto, Fundação, etc."
            value={otherInstitutionTypeDesc || ''}
            onChange={e => onOtherInstitutionTypeDescChange?.(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default EducationTypeSwitch; 