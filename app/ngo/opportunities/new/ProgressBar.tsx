'use client';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: { name: string; completed: boolean }[];
  onStepClick?: (stepIndex: number) => void;
}

export default function ProgressBar({ currentStep, totalSteps, steps, onStepClick }: ProgressBarProps) {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-base font-medium text-[#556B2F]">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-gray-500">
          {Math.round((currentStep / totalSteps) * 100)}% Complete
        </span>
      </div>
      
      <div className="overflow-hidden rounded-full bg-gray-200">
        <div 
          className="h-2 rounded-full bg-gradient-to-r from-[#556B2F] to-[#6B8E23] transition-all duration-300 ease-in-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
      
      <div className="mt-4 grid grid-cols-7 gap-2">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`flex flex-col items-center ${onStepClick ? 'cursor-pointer transform hover:scale-105 transition-transform duration-150' : ''}`}
            onClick={() => onStepClick && onStepClick(index)}
          >
            <div 
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                index + 1 === currentStep
                  ? 'bg-gradient-to-r from-[#556B2F] to-[#6B8E23] text-white shadow-md' 
                  : step.completed
                    ? 'bg-[#6B8E23] text-white'
                    : 'bg-gray-200 text-gray-500'
              } transition-all duration-200`}
            >
              {step.completed ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className={`mt-2 text-xs ${
              index + 1 === currentStep ? 'font-medium text-[#556B2F]' : 'text-gray-500'
            }`}>
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
} 