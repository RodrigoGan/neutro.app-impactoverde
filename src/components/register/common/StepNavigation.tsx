import React from 'react';
import { Button } from '@/components/ui/button';

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  isNextDisabled?: boolean;
  nextLabel?: string;
  backLabel?: string;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  isNextDisabled = false,
  nextLabel = 'Próximo',
  backLabel = 'Voltar'
}) => {
  const handleNextClick = () => {
    console.log('Botão próximo/finalizar clicado!'); // Debug
    console.log('currentStep:', currentStep, 'totalSteps:', totalSteps); // Debug
    onNext();
  };

  return (
    <div className="flex justify-between items-center mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={currentStep === 0}
      >
        {backLabel}
      </Button>

      <div className="text-sm text-muted-foreground">
        Etapa {currentStep + 1} de {totalSteps}
      </div>

      <Button
        type="button"
        onClick={handleNextClick}
        disabled={isNextDisabled}
      >
        {nextLabel}
      </Button>
    </div>
  );
};

export default StepNavigation; 