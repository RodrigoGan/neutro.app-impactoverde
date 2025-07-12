import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { EducationTypeSwitch, EDUCATION_TYPES } from '@/components/register/educational/EducationTypeSwitch';
import EducationLevelSwitch from '@/components/register/educational/EducationLevelSwitch';

interface PerfilEducacionalFormProps {
  data: {
    institutionType: typeof EDUCATION_TYPES[number]['key'] | null;
    educationLevels: string[];
    activePrograms: string;
    otherInstitutionTypeDesc?: string;
    otherEducationLevelDesc?: string;
  };
  onChange: (data: any) => void;
  errors: Record<string, string>;
}

const PerfilEducacionalForm: React.FC<PerfilEducacionalFormProps> = ({ data, onChange, errors }) => {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <Label className="block mb-1">Tipo de Instituição *</Label>
        <EducationTypeSwitch
          value={data.institutionType}
          onChange={(value) => onChange({ institutionType: value })}
          otherInstitutionTypeDesc={data.otherInstitutionTypeDesc}
          onOtherInstitutionTypeDescChange={(desc) => onChange({ otherInstitutionTypeDesc: desc })}
          error={errors.institutionType}
        />
      </div>
      <div>
        <Label className="block mb-1">Níveis de Ensino *</Label>
        <EducationLevelSwitch
          value={data.educationLevels || []}
          onChange={(levels) => onChange({ educationLevels: levels })}
          otherEducationLevelDesc={data.otherEducationLevelDesc || ''}
          onOtherEducationLevelDescChange={(desc) => onChange({ otherEducationLevelDesc: desc })}
          error={errors.educationLevels}
        />
      </div>
      <div>
        <Label className="block mb-1">Programas Ambientais Ativos *</Label>
        <Textarea
          value={data.activePrograms}
          onChange={(e) => onChange({ activePrograms: e.target.value })}
          required
        />
        {errors.activePrograms && <p className="text-red-500 text-xs mt-1">{errors.activePrograms}</p>}
      </div>
    </div>
  );
};

export default PerfilEducacionalForm; 