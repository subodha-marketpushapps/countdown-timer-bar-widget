/**
 * InputMobileNumber Component Tests
 *
 * Basic test utilities and examples for the InputMobileNumber component
 * following Wix Design System testing conventions.
 *
 * Note: This is a template file. To run actual tests, install testing dependencies:
 * npm install --save-dev @testing-library/react @testing-library/user-event jest @types/jest
 */

import React from "react";
import InputMobileNumber from "../InputMobileNumber";
import { createInputMobileNumberDriver } from "../InputMobileNumber.uni.driver";
import type { InputMobileNumberProps } from "../InputMobileNumber.types";

// Mock functions for testing
const createMockFunctions = () => ({
  onValidNumber: (number: string) => console.log("Valid number:", number),
  onError: (hasError: boolean, message?: string) => console.log("Error:", hasError, message),
});

// Basic prop configurations for testing
export const testConfigurations: Record<string, Partial<InputMobileNumberProps>> = {
  default: {
    ...createMockFunctions(),
  },

  withInitialValue: {
    ...createMockFunctions(),
    phoneNumber: "+1234567890",
  },

  customLabels: {
    ...createMockFunctions(),
    countryLabel: "Select Country",
    phoneLabel: "Mobile Number",
  },

  disabled: {
    ...createMockFunctions(),
    disabled: true,
  },

  withLocationDetection: {
    ...createMockFunctions(),
    enableLocationDetection: true,
    defaultCountry: "GB",
  },

  debugMode: {
    ...createMockFunctions(),
    debug: true,
  },

  customValidator: {
    ...createMockFunctions(),
    customValidator: (phoneNumber: string) => ({
      isValid: phoneNumber.length >= 10,
      errorMessage: phoneNumber.length < 10 ? "Phone number too short" : undefined,
    }),
  },

  smallSize: {
    ...createMockFunctions(),
    size: "small" as const,
  },

  largeSize: {
    ...createMockFunctions(),
    size: "large" as const,
  },
};

// Example usage of the test driver
export const testDriverExample = () => {
  // This would typically be used in a proper test environment
  const container = document.createElement("div");
  const driver = createInputMobileNumberDriver(container);

  return {
    async testBasicFunctionality() {
      const exists = await driver.exists();
      console.log("Component exists:", exists);

      await driver.enterPhoneNumber("1234567890");
      const value = await driver.getPhoneNumberValue();
      console.log("Phone number value:", value);

      const placeholder = await driver.getPlaceholderText();
      console.log("Placeholder text:", placeholder);

      const disabled = await driver.isDisabled();
      console.log("Is disabled:", disabled);

      const hasError = await driver.hasError();
      console.log("Has error:", hasError);
    },
  };
};

// Test scenarios that can be manually verified
export const testScenarios = {
  "Basic rendering": () => <InputMobileNumber {...testConfigurations.default} />,

  "With initial phone number": () => <InputMobileNumber {...testConfigurations.withInitialValue} />,

  "Custom labels": () => <InputMobileNumber {...testConfigurations.customLabels} />,

  "Disabled state": () => <InputMobileNumber {...testConfigurations.disabled} />,

  "With location detection": () => (
    <InputMobileNumber {...testConfigurations.withLocationDetection} />
  ),

  "Debug mode enabled": () => <InputMobileNumber {...testConfigurations.debugMode} />,

  "Custom validation": () => <InputMobileNumber {...testConfigurations.customValidator} />,

  "Small size": () => <InputMobileNumber {...testConfigurations.smallSize} />,

  "Large size": () => <InputMobileNumber {...testConfigurations.largeSize} />,
};

// Manual testing checklist
export const manualTestingChecklist = [
  "Component renders without errors",
  "Country selector displays and is searchable",
  "Phone input accepts numbers and formats correctly",
  "Validation triggers on blur",
  "Error states display properly",
  "Location detection works (if enabled)",
  "Custom labels are displayed",
  "Disabled state works correctly",
  "Size variants render appropriately",
  "Debug logging works in development",
  "Custom validation functions are called",
  "Data attributes are present (data-testid, data-hook)",
  "Accessibility features work (keyboard navigation, ARIA labels)",
];

// Performance testing guidelines
export const performanceTestingGuidelines = [
  "Component should render within 100ms",
  "Country selector should open within 200ms",
  "Phone number validation should complete within 500ms",
  "Location detection should timeout gracefully after 10s",
  "Memory usage should remain stable during extended use",
];

export default testConfigurations;
