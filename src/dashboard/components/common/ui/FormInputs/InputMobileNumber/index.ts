/**
 * InputMobileNumber Component Export
 *
 * A production-ready mobile number input component with intelligent
 * Wix-native country detection, validation, and Design System integration.
 *
 * Features:
 * - Direct @wix/business-tools integration for instant location detection
 * - Self-contained implementation with zero external dependencies
 * - High performance using cached Wix site data
 * - Full TypeScript support with comprehensive error handling
 */

export { default as InputMobileNumber } from "./InputMobileNumber";

// Component types
export type {
  InputMobileNumberProps,
  CountryOption,
  PhoneValidationResult,
  CountrySelectorProps,
  AutoCompleteCountryOption,
  LocationDetectionResult,
  InputMobileNumberSize,
  UsePhoneValidationReturn,
  CustomPhoneValidator,
} from "./InputMobileNumber.types";

// Hook exports (for advanced usage)
export { useWixLocationDetection } from "./hooks/useWixLocationDetection";
export { usePhoneValidation } from "./hooks/usePhoneValidation";

// Type exports for hooks
export type { WixLocationResult } from "./hooks/useWixLocationDetection";
