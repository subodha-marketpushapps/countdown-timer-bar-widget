import { LoadingStep } from './types';

export const LOADING_STEPS: LoadingStep[] = [
  { id: 1, name: "Initializing", percentage: 10 },
  { id: 2, name: "Loading Wix Data", percentage: 30 },
  { id: 3, name: "Updating Instance", percentage: 20 },
  { id: 4, name: "Finalizing Setup", percentage: 40 },
];

export const ANIMATION_DURATIONS = {
  PRIMARY_SHINE: 3000, // 3s
  SECONDARY_SHINE: 2500, // 2.5s
  SPARKLE: 2000, // 2s
  PROGRESS_TRANSITION: 1200, // 1.2s
} as const;

export const PROGRESS_BAR_CONFIG = {
  WIDTH: 300,
  HEIGHT: 16,
  BORDER_WIDTH: 2,
  PADDING: 2,
  BORDER_RADIUS: 6,
} as const;
