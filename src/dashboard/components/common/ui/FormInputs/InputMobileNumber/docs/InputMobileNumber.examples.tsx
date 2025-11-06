/**
 * InputMobileNumber - Usage Examples and Testing Guide
 *
 * This file demonstrates various usage patterns and provides guidance
 * for testing the InputMobileNumber component.
 */

import React from "react";
import InputMobileNumber from "../InputMobileNumber";

/**
 * Example 1: Basic Usage
 * Simple implementation with minimal configuration
 */
export const BasicExample = () => {
  const handleValidNumber = (phoneNumber: string) => {
    console.log("Valid phone number:", phoneNumber);
  };

  const handleError = (hasError: boolean, message?: string) => {
    if (hasError) {
      console.error("Validation error:", message);
    } else {
      console.log("Phone number is valid");
    }
  };

  return (
    <InputMobileNumber onValidNumber={handleValidNumber} onError={handleError} required={true} />
  );
};

/**
 * Example 2: Advanced Configuration
 * Full-featured implementation with custom validation
 */
export const AdvancedExample = () => {
  const customValidator = (phoneNumber: string, countryCode: string) => {
    // Business-specific validation rules
    if (countryCode === "US" && phoneNumber.length < 10) {
      return {
        isValid: false,
        errorMessage: "US phone numbers must have at least 10 digits",
      };
    }

    if (countryCode === "FR" && !phoneNumber.startsWith("6") && !phoneNumber.startsWith("7")) {
      return {
        isValid: false,
        errorMessage: "French mobile numbers must start with 6 or 7",
      };
    }

    return { isValid: true };
  };

  return (
    <InputMobileNumber
      phoneNumber="+33612345678"
      onValidNumber={(number: string) => console.log("Validated:", number)}
      onError={(hasError: boolean, message?: string) => {
        if (hasError) console.error(message);
      }}
      countryLabel="Select Your Country"
      phoneLabel="Mobile Phone Number"
      infoContent="We'll send SMS verification to this number"
      customValidator={customValidator}
      enableLocationDetection={true}
      defaultCountry="FR"
      required={true}
      size="large"
      // Use a static boolean to avoid Node types in Wix CLI builds
      debug={false}
    />
  );
};

/**
 * Example 3: Form Integration
 * React Hook Form integration pattern
 */
export const FormIntegrationExample = () => {
  // Note: This example assumes react-hook-form is available
  // import { useForm, Controller } from 'react-hook-form';

  /*
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log('Form data:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="phoneNumber"
        control={control}
        rules={{ 
          required: 'Phone number is required',
          validate: (value) => value.includes('+') || 'Please enter a valid international number'
        }}
        render={({ field }) => (
          <InputMobileNumber
            phoneNumber={field.value || ''}
            onValidNumber={field.onChange}
            onError={(hasError) => {
              if (hasError) field.onChange('');
            }}
            required={true}
            countryLabel="Country"
            phoneLabel="Phone Number"
          />
        )}
      />
      {errors.phoneNumber && (
        <p style={{ color: 'red' }}>{errors.phoneNumber.message}</p>
      )}
      
      <button type="submit">Submit</button>
    </form>
  );
  */

  // Simplified version without react-hook-form dependency
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [isValid, setIsValid] = React.useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isValid) {
          console.log("Submitting:", phoneNumber);
        }
      }}
    >
      <InputMobileNumber
        phoneNumber={phoneNumber}
        onValidNumber={(number: string) => {
          setPhoneNumber(number);
          setIsValid(true);
        }}
        onError={(hasError: boolean) => {
          setIsValid(!hasError);
        }}
        required={true}
        countryLabel="Country"
        phoneLabel="Phone Number"
      />

      <button type="submit" disabled={!isValid}>
        Submit Form
      </button>
    </form>
  );
};

/**
 * Example 4: Controlled Component
 * Managing state externally
 */
export const ControlledExample = () => {
  const [currentPhone, setCurrentPhone] = React.useState("+1234567890");
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const handlePhoneChange = (number: string) => {
    setCurrentPhone(number);
    setValidationError(null);
  };

  const handleValidationError = (hasError: boolean, message?: string) => {
    setValidationError(hasError ? message || "Invalid phone number" : null);
  };

  const resetPhone = () => {
    setCurrentPhone("");
    setValidationError(null);
  };

  return (
    <div>
      <InputMobileNumber
        phoneNumber={currentPhone}
        onValidNumber={handlePhoneChange}
        onError={handleValidationError}
        enableLocationDetection={false}
        defaultCountry="US"
      />

      {validationError && <p style={{ color: "red", marginTop: "8px" }}>{validationError}</p>}

      <div style={{ marginTop: "16px" }}>
        <p>Current value: {currentPhone || "None"}</p>
        <button onClick={resetPhone}>Reset</button>
      </div>
    </div>
  );
};

/**
 * Example 5: Multiple Sizes
 * Demonstrating different component sizes
 */
export const SizeVariantsExample = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h3>Small Size</h3>
        <InputMobileNumber
          onValidNumber={(number: string) => console.log("Small:", number)}
          size="small"
          defaultCountry="US"
        />
      </div>

      <div>
        <h3>Medium Size (Default)</h3>
        <InputMobileNumber
          onValidNumber={(number: string) => console.log("Medium:", number)}
          size="medium"
          defaultCountry="US"
        />
      </div>

      <div>
        <h3>Large Size</h3>
        <InputMobileNumber
          onValidNumber={(number: string) => console.log("Large:", number)}
          size="large"
          defaultCountry="US"
        />
      </div>
    </div>
  );
};

/**
 * Example 6: Debug Mode
 * Enabling debug output for development
 */
export const DebugExample = () => {
  return (
    <div>
      <p>Check the browser console for debug output:</p>
      <p style={{ fontSize: "14px", color: "#666" }}>
        Debug mode shows country selection priority matching and validation steps
      </p>
      <InputMobileNumber
        onValidNumber={(number: string) => console.log("Valid:", number)}
        onError={(hasError: boolean, message?: string) => console.log("Error:", hasError, message)}
        debug={true}
        enableLocationDetection={true}
      />
      <div style={{ marginTop: "16px", fontSize: "13px", color: "#555" }}>
        <strong>Try these to see priority matching:</strong>
        <ul>
          <li>Type "LK" → See exact ID match (Priority 1)</li>
          <li>Type "Sri Lanka" → See exact name match (Priority 3)</li>
          <li>Type "United King" → See single result match (Priority 4)</li>
          <li>Clear and blur → See revert to last valid</li>
        </ul>
      </div>
    </div>
  );
};

/**
 * Example 7: Country Selection Testing
 * Testing priority-based country matching
 */
export const CountrySelectionExample = () => {
  const [selectedCountry, setSelectedCountry] = React.useState<string>("");
  const [phoneNumber, setPhoneNumber] = React.useState<string>("");

  const handleValidNumber = (validNumber: string) => {
    setPhoneNumber(validNumber);
    // Extract country code from valid number
    const match = validNumber.match(/^\+(\d+)/);
    if (match) setSelectedCountry(match[1]);
  };

  return (
    <div>
      <h3>Country Selection Priority Matching</h3>
      <p style={{ fontSize: "14px", marginBottom: "16px" }}>
        The component uses intelligent priority-based matching for country selection
      </p>

      <InputMobileNumber
        onValidNumber={handleValidNumber}
        onError={(hasError, message) => {
          if (hasError) {
            setPhoneNumber("");
            setSelectedCountry("");
          }
        }}
        debug={true}
        enableLocationDetection={false}
      />

      <div style={{ marginTop: "16px", fontSize: "13px" }}>
        <strong>Test Cases:</strong>
        <ul>
          <li>
            <strong>LK vs FK:</strong> Type "LK" → Should select Sri Lanka (+94), not Falkland
            Islands
          </li>
          <li>
            <strong>Full Name:</strong> Type "Sri Lanka" → Should select LK
          </li>
          <li>
            <strong>Partial:</strong> Type "United King" → Should auto-select GB (single result)
          </li>
          <li>
            <strong>Invalid:</strong> Select a country, type "XYZ", blur → Reverts to last valid
          </li>
        </ul>

        {phoneNumber && (
          <p style={{ marginTop: "12px", color: "#0070f3" }}>
            <strong>Selected:</strong> {phoneNumber}
            {selectedCountry && ` (Country code: +${selectedCountry})`}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Testing Guide
 * =============
 *
 * To test the InputMobileNumber component effectively:
 *
 * 1. Mock Wix APIs:
 * ```typescript
 * jest.mock('@wix/business-tools', () => ({
 *   siteProperties: {
 *     getSiteProperties: jest.fn().mockResolvedValue({
 *       properties: {
 *         address: { country: 'US' },
 *         locale: { country: 'US' }
 *       }
 *     })
 *   },
 *   locations: {
 *     queryLocations: jest.fn(() => ({
 *       eq: jest.fn(() => ({
 *         find: jest.fn().mockResolvedValue({ items: [] })
 *       }))
 *     }))
 *   }
 * }));
 * ```
 *
 * 2. Test Data Hooks:
 * Use the following data-testid attributes for reliable testing:
 * - `input-mobile-number` - Main component container
 * - `input-mobile-number-country` - Country selector
 * - `input-mobile-number-phone-input` - Phone number input
 *
 * 3. Mock libphonenumber-js:
 * ```typescript
 * jest.mock('libphonenumber-js', () => ({
 *   parsePhoneNumber: jest.fn((number, country) => ({
 *     isValid: () => number && number.length >= 10,
 *     format: () => `+1${number}`,
 *     number: `+1${number}`
 *   }))
 * }));
 * ```
 *
 * 4. Test Key Scenarios:
 * - Basic rendering with default props
 * - Location detection with/without Wix data
 * - Phone validation with valid/invalid numbers
 * - Custom validation rules
 * - Required field validation
 * - Error state handling
 * - Accessibility features
 * - Form integration patterns
 *
 * 5. Accessibility Testing:
 * - Screen reader announcements
 * - Keyboard navigation (Tab, Enter, Escape)
 * - Focus management
 * - ARIA labels and descriptions
 * - High contrast mode compatibility
 *
 * 6. Performance Testing:
 * - Location detection speed (should be <10ms)
 * - Component render time
 * - Memory usage during validation
 * - Bundle size impact
 */

/**
 * Common Test Patterns
 */
export const TestHelpers = {
  // Mock Wix environment
  mockWixEnvironment: (country = "US") => {
    // Implementation would depend on your testing framework
    console.log(`Mock Wix environment set to country: ${country}`);
  },

  // Test phone number validation
  testValidation: (phoneNumber: string, country: string, expectedValid: boolean) => {
    console.log(`Testing ${phoneNumber} (${country}) - Expected valid: ${expectedValid}`);
  },

  // Accessibility test helper
  testAccessibility: (component: React.ReactElement) => {
    console.log("Testing accessibility features for:", component.type);
  },
};

export default {
  BasicExample,
  AdvancedExample,
  FormIntegrationExample,
  ControlledExample,
  SizeVariantsExample,
  DebugExample,
  CountrySelectionExample,
  TestHelpers,
};
