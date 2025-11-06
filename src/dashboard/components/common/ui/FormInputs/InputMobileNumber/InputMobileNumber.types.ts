/**
 * InputMobileNumber - Type definitions
 *
 * This file contains all the TypeScript type definitions for the InputMobileNumber component,
 * following Wix Design System conventions and best practices.
 */

import { DropdownLayoutOption } from "@wix/design-system";

/** Country option for dropdown selection */
export interface CountryOption {
  /** Country code (e.g., "LK", "US") */
  id: string;
  /** Display title (e.g., "LK (+94)") */
  title?: string;
  /** Country name (e.g., "Sri Lanka") */
  subtitle?: string;
  /** Full searchable text (e.g., "Sri Lanka LK +94") */
  label: string;
  /** Phone code (e.g., "+94") */
  phoneCode?: string;
}

/** AutoComplete compatible country option */
export type AutoCompleteCountryOption = CountryOption & DropdownLayoutOption;

/** Result of phone number validation */
export interface PhoneValidationResult {
  /** Whether the phone number is valid */
  isValid: boolean;
  /** Error message if invalid */
  errorMessage?: string;
  /** Formatted international number */
  formattedNumber?: string;
  /** National number without country code */
  nationalNumber?: string;
  /** Country code */
  countryCode?: string;
  /** International format with country code */
  internationalNumber?: string;
}

/** Location detection result */
export interface LocationDetectionResult {
  /** Detected country code */
  country?: string;
  /** Detection method used */
  method?: "site-properties" | "business-location" | "locale-fallback" | "default";
  /** Whether detection is in progress */
  isLoading: boolean;
}

/** Size variants for the component */
export type InputMobileNumberSize = "small" | "medium" | "large";

/** Props for InputMobileNumber component */
export interface InputMobileNumberProps {
  /** Callback when a valid phone number is entered */
  onValidNumber?: (number: string) => void;

  /** Optional initial phone number value */
  phoneNumber?: string;

  /** Callback for error state changes */
  onError?: (hasError: boolean, errorMessage?: string) => void;

  /** Custom placeholder text */
  placeholder?: string;

  /** Whether the field is required */
  required?: boolean;

  /** Whether to show validation errors (useful for form submission) */
  showValidationErrors?: boolean;

  /** Custom label for the country field */
  countryLabel?: string;

  /** Custom label for the phone number field */
  phoneLabel?: string;

  /** Info content for the phone number field */
  infoContent?: string;

  /** Whether to enable location detection */
  enableLocationDetection?: boolean;

  /** Default country if location detection fails */
  defaultCountry?: string;

  /** Custom validation function */
  customValidator?: (phoneNumber: string, countryCode: string) => PhoneValidationResult;

  /** Whether to show debug information in development */
  debug?: boolean;

  /** Custom styling class */
  className?: string;

  /** Whether the input is disabled */
  disabled?: boolean;

  /** Size variant */
  size?: InputMobileNumberSize;

  /** Data test id for testing */
  dataTestId?: string;

  /** Data hook for testkit (Wix convention) */
  dataHook?: string;
}

/** Props for CountrySelector component */
export interface CountrySelectorProps {
  /** Callback when country is selected */
  onSelect: (option: CountryOption | null) => void;
  /** Selected country code */
  value?: string;
  /** Whether to enable location detection */
  enableLocationDetection?: boolean;
  /** Default country */
  defaultCountry?: string;
  /** Whether disabled */
  disabled?: boolean;
  /** Size variant */
  size?: InputMobileNumberSize;
  /** Debug mode */
  debug?: boolean;
  /** Data test id */
  dataTestId?: string;
  /** Data hook for testkit (Wix convention) */
  dataHook?: string;
}

/** Validation hook return type */
export interface UsePhoneValidationReturn {
  /** Validate a phone number */
  validatePhone: (phoneNumber: string, country: CountryOption) => PhoneValidationResult;
  /** Get placeholder text for a country */
  getPhonePlaceholder: (country: CountryOption | null) => string;
}

/** Custom validator function type */
export type CustomPhoneValidator = (
  phoneNumber: string,
  countryCode: string,
) => PhoneValidationResult;
