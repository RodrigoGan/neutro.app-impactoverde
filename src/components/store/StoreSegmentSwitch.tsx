import React from 'react';
import { Switch } from '@/components/ui/switch';

export const SEGMENTS = [
  { key: 'roupas', label: 'Roupas', icon: <span role="img" aria-label="Roupas">👕</span>, color: 'text-blue-700' },
  { key: 'calcados', label: 'Calçados', icon: <span role="img" aria-label="Calçados">👟</span>, color: 'text-yellow-700' },
  { key: 'acessorios', label: 'Acessórios', icon: <span role="img" aria-label="Acessórios">👜</span>, color: 'text-pink-700' },
  { key: 'eletronicos', label: 'Eletrônicos', icon: <span role="img" aria-label="Eletrônicos">📱</span>, color: 'text-purple-700' },
  { key: 'papelaria', label: 'Papelaria', icon: <span role="img" aria-label="Papelaria">📚</span>, color: 'text-green-700' },
  { key: 'mercado', label: 'Mercado', icon: <span role="img" aria-label="Mercado">🛒</span>, color: 'text-orange-700' },
  { key: 'cosmeticos', label: 'Cosméticos', icon: <span role="img" aria-label="Cosméticos">💄</span>, color: 'text-red-700' },
  { key: 'esportes', label: 'Esportes', icon: <span role="img" aria-label="Esportes">🏋️‍♂️</span>, color: 'text-lime-700' },
  { key: 'utilidades', label: 'Utilidades', icon: <span role="img" aria-label="Utilidades">🏠</span>, color: 'text-gray-700' },
  { key: 'materiais_seguranca', label: 'Materiais de Segurança', icon: <span role="img" aria-label="Materiais de Segurança">🦺</span>, color: 'text-amber-700' },
  { key: 'outros', label: 'Outros', icon: <span role="img" aria-label="Outros">✨</span>, color: 'text-indigo-700' },
] as const;

type SegmentKey = typeof SEGMENTS[number]['key'];

type Props = {
  value: SegmentKey[];
  onChange: (value: SegmentKey[]) => void;
  error?: string;
  otherDesc?: string;
  onOtherDescChange?: (desc: string) => void;
};

export const StoreSegmentSwitch: React.FC<Props> = ({ value, onChange, error, otherDesc, onOtherDescChange }) => {
  const handleToggle = (key: SegmentKey) => {
    if (value.includes(key)) {
      onChange(value.filter(v => v !== key));
    } else {
      onChange([...value, key]);
    }
  };
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 mb-2">
        {SEGMENTS.map(seg => (
          <div key={seg.key} className="flex items-center space-x-2">
            <Switch
              id={seg.key}
              checked={value.includes(seg.key)}
              onCheckedChange={() => handleToggle(seg.key)}
            />
            <label htmlFor={seg.key} className={`flex items-center gap-1 font-medium ${seg.color}`}>
              {seg.icon} {seg.label}
            </label>
          </div>
        ))}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {value.includes('outros') && (
        <input
          className="w-full border rounded p-2 mt-1"
          placeholder="Descreva o segmento"
          value={otherDesc || ''}
          onChange={e => onOtherDescChange?.(e.target.value)}
        />
      )}
    </div>
  );
}; 