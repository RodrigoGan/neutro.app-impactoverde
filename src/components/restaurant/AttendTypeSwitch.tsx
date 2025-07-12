import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';

export type AttendType = {
  delivery: boolean;
  presencial: boolean;
  buffet: boolean;
  marmitex: boolean;
  other: boolean;
  otherDesc?: string;
};

const attendTypesData = [
  { key: 'delivery', label: 'Delivery', icon: <span role="img" aria-label="Delivery">🛵</span> },
  { key: 'presencial', label: 'Presencial', icon: <span role="img" aria-label="Presencial">🍽️</span> },
  { key: 'buffet', label: 'Buffet', icon: <span role="img" aria-label="Buffet">🥗</span> },
  { key: 'marmitex', label: 'Marmitex', icon: <span role="img" aria-label="Marmitex">🍱</span> },
  { key: 'other', label: 'Outros', icon: <span role="img" aria-label="Outros">✨</span> },
] as const;

type Props = {
  value: AttendType;
  onChange: (value: AttendType) => void;
  showOtherDesc?: boolean;
  otherDescPlaceholder?: string;
  error?: string;
  otherDescError?: string;
};

export const AttendTypeSwitch: React.FC<Props> = ({ value, onChange, showOtherDesc = true, otherDescPlaceholder, error, otherDescError }) => {
  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-2">
        {attendTypesData.map(type => (
          <div key={type.key} className="flex items-center space-x-2">
            <Switch
              id={type.key}
              checked={value[type.key]}
              onCheckedChange={checked => onChange({ ...value, [type.key]: checked })}
            />
            <label htmlFor={type.key} className="flex items-center gap-1">
              {type.icon} {type.label}
            </label>
          </div>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {showOtherDesc && value.other && (
        <>
          <Input
            className="mt-1"
            placeholder={otherDescPlaceholder || 'Descreva outros tipos de atendimento'}
            value={value.otherDesc || ''}
            onChange={e => onChange({ ...value, otherDesc: e.target.value })}
          />
          {otherDescError && <p className="text-red-500 text-xs mt-1">{otherDescError}</p>}
        </>
      )}
    </div>
  );
}; 