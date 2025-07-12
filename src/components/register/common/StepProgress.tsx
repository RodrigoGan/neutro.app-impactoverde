import React from 'react';

interface StepProgressProps {
  steps: { label: string }[];
  currentStep: number;
}

const StepProgress: React.FC<StepProgressProps> = ({ steps, currentStep }) => {
  if (steps.length <= 4) {
    // Layout padrão para até 4 etapas
    return (
      <div className="flex items-center justify-center mb-6 flex-wrap">
        {steps.map((step, idx) => (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center">
              <span
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-lg font-bold mb-1
                  ${idx < currentStep ? 'bg-green-500 border-green-500 text-white' : idx === currentStep ? 'bg-white border-green-500 text-green-600' : 'bg-white border-gray-300 text-gray-400'}`}
              >
                {idx + 1}
              </span>
              <span className={`text-xs ${idx <= currentStep ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded ${idx < currentStep ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // Para 5 ou mais etapas: dividir em duas linhas
  const topSteps = steps.slice(0, 3);
  const bottomSteps = steps.slice(3);

  return (
    <div className="mb-6 w-full">
      <div className="flex items-center justify-center flex-wrap">
        {topSteps.map((step, idx) => {
          const globalIdx = idx;
          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center">
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-lg font-bold mb-1
                    ${globalIdx < currentStep ? 'bg-green-500 border-green-500 text-white' : globalIdx === currentStep ? 'bg-white border-green-500 text-green-600' : 'bg-white border-gray-300 text-gray-400'}`}
                >
                  {globalIdx + 1}
                </span>
                <span className={`text-xs ${globalIdx <= currentStep ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>{step.label}</span>
              </div>
              {idx < topSteps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${globalIdx < currentStep ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="flex items-center justify-center flex-wrap mt-2">
        {bottomSteps.map((step, idx) => {
          const globalIdx = idx + 3;
          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center">
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-lg font-bold mb-1
                    ${globalIdx < currentStep ? 'bg-green-500 border-green-500 text-white' : globalIdx === currentStep ? 'bg-white border-green-500 text-green-600' : 'bg-white border-gray-300 text-gray-400'}`}
                >
                  {globalIdx + 1}
                </span>
                <span className={`text-xs ${globalIdx <= currentStep ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>{step.label}</span>
              </div>
              {idx < bottomSteps.length - 1 && (
                <div className={`flex-1 h-1 mx-2 rounded ${globalIdx < currentStep ? 'bg-green-500' : 'bg-gray-200'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepProgress; 