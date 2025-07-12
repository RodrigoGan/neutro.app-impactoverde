import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const EDUCATION_LEVELS = [
  { key: 'infantil', label: 'Infantil', icon: <span role="img" aria-label="Infantil">👶</span>, color: 'text-pink-600' },
  { key: 'fundamental', label: 'Fundamental', icon: <span role="img" aria-label="Fundamental">📚</span>, color: 'text-blue-700' },
  { key: 'medio', label: 'Médio', icon: <span role="img" aria-label="Médio">🏫</span>, color: 'text-green-700' },
  { key: 'superior', label: 'Superior', icon: <span role="img" aria-label="Superior">🎓</span>, color: 'text-purple-700' },
  { key: 'tecnico', label: 'Técnico', icon: <span role="img" aria-label="Técnico">🛠️</span>, color: 'text-orange-700' },
  { key: 'cursos', label: 'Cursos', icon: <span role="img" aria-label="Cursos">📖</span>, color: 'text-yellow-700' },
  { key: 'outros', label: 'Outros', icon: <span role="img" aria-label="Outros">✨</span>, color: 'text-gray-700' },
];

interface EducationLevelSwitchProps {
  value: string[];
  onChange: (levels: string[]) => void;
  otherEducationLevelDesc: string;
  onOtherEducationLevelDescChange: (desc: string) => void;
  error?: string;
}

const EducationLevelSwitch: React.FC<EducationLevelSwitchProps> = ({ value = [], onChange, otherEducationLevelDesc, onOtherEducationLevelDescChange, error }) => {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {EDUCATION_LEVELS.map(level => (
          <button
            key={level.key}
            type="button"
            className={`flex items-center gap-1 px-3 py-1 rounded-full border transition-colors text-sm font-medium focus:outline-none ${value.includes(level.key) ? `bg-green-100 border-green-500 ${level.color}` : 'bg-white border-gray-300 text-gray-700'}`}
            onClick={() => {
              if (value.includes(level.key)) {
                const newLevels = value.filter(l => l !== level.key);
                onChange(newLevels);
                if (level.key === 'outros') onOtherEducationLevelDescChange('');
              } else {
                onChange([...value, level.key]);
              }
            }}
          >
            {level.icon} {level.label}
          </button>
        ))}
      </div>
      {value.includes('outros') && (
        <div>
          <Label htmlFor="education-level-other-desc">Descreva o(s) outro(s) nível(is)</Label>
          <Input
            id="education-level-other-desc"
            placeholder="Ex: Pós-graduação, EJA, etc."
            value={otherEducationLevelDesc}
            onChange={e => onOtherEducationLevelDescChange(e.target.value)}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default EducationLevelSwitch; 