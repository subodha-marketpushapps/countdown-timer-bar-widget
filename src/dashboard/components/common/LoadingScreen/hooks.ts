import { LoadingStep } from './types';
import { LOADING_STEPS } from './constants';

export const useLoadingSteps = () => {
  const getCurrentStepInfo = (currentStep: number): LoadingStep => {
    const step = LOADING_STEPS[currentStep - 1];
    return step || { id: 0, name: "Loading", percentage: 0 };
  };

  const calculateProgressPercentage = (currentStep: number, totalSteps: number): number => {
    return Math.min((currentStep / totalSteps) * 100, 100);
  };

  return {
    loadingSteps: LOADING_STEPS,
    getCurrentStepInfo,
    calculateProgressPercentage,
  };
};
