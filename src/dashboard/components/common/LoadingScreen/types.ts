export interface LoadingScreenProps {
  isOpen: boolean;
  onRequestClose?: () => void;
  showCloseButton?: boolean;
  currentStep?: number;
  totalSteps?: number;
}

export interface LoadingStep {
  id: number;
  name: string;
  percentage: number;
}

export interface ProgressBarProps {
  progressPercentage: number;
}
