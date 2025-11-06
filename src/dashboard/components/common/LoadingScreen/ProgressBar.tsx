import React from 'react';
import { ProgressBarProps } from './types';
import { PROGRESS_BAR_CONFIG } from './constants';
import './LoadingScreen.css';

export const ProgressBar: React.FC<ProgressBarProps> = ({ progressPercentage }) => {
  return (
    <div className="progress-bar-container">
      {/* Main gradient progress bar */}
      <div
        className="progress-bar-fill"
        style={{
          width: `${Math.max(progressPercentage - 1, 0)}%`,
        }}
      />
      
      {/* Primary shine effect */}
      <div className="progress-bar-shine-primary" />
      
      {/* Secondary subtle shine */}
      <div className="progress-bar-shine-secondary" />
      
      {/* Sparkle effects */}
      <div className="progress-bar-sparkle-1" />
      <div className="progress-bar-sparkle-2" />
    </div>
  );
};
