/**
 * Storybook Content Configuration for InputMobileNumber
 *
 * This file defines the content structure and examples for the
 * InputMobileNumber component in Storybook documentation.
 */

export const content = {
  // Basic examples
  basic: {
    title: "Basic Usage",
    description: "Simple phone number input with location detection",
    code: `
<InputMobileNumber
  onValidNumber={(number) => console.log('Valid:', number)}
  onError={(hasError, message) => {
    if (hasError) console.error('Error:', message);
  }}
  enableLocationDetection={true}
  required={true}
/>
    `,
  },

  // Advanced configuration
  advanced: {
    title: "Advanced Configuration",
    description: "Full configuration with custom validation and styling",
    code: `
const customValidator = (phoneNumber, countryCode) => {
  if (countryCode === 'US' && !phoneNumber.startsWith('1')) {
    return {
      isValid: false,
      errorMessage: 'US numbers must start with 1'
    };
  }
  return { isValid: true };
};

<InputMobileNumber
  phoneNumber="+1234567890"
  onValidNumber={handleValidNumber}
  onError={handleError}
  
  // Customization
  countryLabel="Select Country"
  phoneLabel="Mobile Number"
  infoContent="We'll send SMS updates to this number"
  placeholder="Enter your mobile number"
  
  // Location Detection
  enableLocationDetection={true}
  defaultCountry="US"
  
  // Validation
  customValidator={customValidator}
  required={true}
  
  // UI
  size="medium"
  disabled={false}
  className="custom-phone-input"
  
  // Development
  debug={process.env.NODE_ENV === 'development'}
/>
    `,
  },

  // Hook usage
  hooks: {
    title: "Using Location Detection Hook",
    description: "Direct hook usage for custom implementations",
    code: `
import { useWixLocationDetection } from './hooks/useWixLocationDetection';

function CustomComponent() {
  const location = useWixLocationDetection({
    defaultCountry: 'US',
    enabled: true,
    debug: false
  });

  return (
    <div>
      <p>Detected Country: {location.country}</p>
      <p>Method: {location.method}</p>
      <p>Confidence: {location.confidence}</p>
      {location.isLoading && <p>Detecting...</p>}
    </div>
  );
}
    `,
  },

  // Performance optimization
  performance: {
    title: "Performance Optimization",
    description: "Best practices for optimal performance",
    code: `
// Memoize callbacks to prevent unnecessary re-renders
const handleValidNumber = useCallback((number) => {
  // Handle valid number
  setFormData(prev => ({ ...prev, phone: number }));
}, []);

const handleError = useCallback((hasError, message) => {
  // Handle validation errors
  setErrors(prev => ({ ...prev, phone: hasError ? message : '' }));
}, []);

<InputMobileNumber
  onValidNumber={handleValidNumber}
  onError={handleError}
  enableLocationDetection={true}
  // ... other props
/>
    `,
  },

  // Testing examples
  testing: {
    title: "Testing Examples",
    description: "How to test the component in your application",
    code: `
// Jest + React Testing Library
import { render, fireEvent, waitFor } from '@testing-library/react';
import InputMobileNumber from './InputMobileNumber';

test('validates phone number correctly', async () => {
  const onValidNumber = jest.fn();
  const onError = jest.fn();
  
  const { getByPlaceholderText, getByDisplayValue } = render(
    <InputMobileNumber
      onValidNumber={onValidNumber}
      onError={onError}
      defaultCountry="US"
    />
  );
  
  // Test country selection with priority matching
  const countryInput = getByDisplayValue('US');
  fireEvent.change(countryInput, { target: { value: 'LK' } }); // Sri Lanka
  fireEvent.blur(countryInput);
  
  // Priority-based matching ensures exact ID match
  await waitFor(() => {
    expect(countryInput.value).toBe('LK');
  });
  
  // Test phone input
  const phoneInput = getByPlaceholderText(/enter phone number/i);
  fireEvent.change(phoneInput, { target: { value: '771234567' } });
  fireEvent.blur(phoneInput);
  
  await waitFor(() => {
    expect(onValidNumber).toHaveBeenCalledWith('+94771234567');
  });
});

// Test country code exact matching
test('selects correct country with similar codes', async () => {
  const onValidNumber = jest.fn();
  const { getByDisplayValue } = render(
    <InputMobileNumber onValidNumber={onValidNumber} />
  );
  
  const countryInput = getByDisplayValue('US');
  
  // Test LK (Sri Lanka) vs FK (Falkland Islands)
  fireEvent.change(countryInput, { target: { value: 'LK' } });
  fireEvent.blur(countryInput);
  
  await waitFor(() => {
    expect(countryInput.value).toBe('LK');
  });
});

// Mock Wix APIs for testing
jest.mock('@wix/business-tools', () => ({
  siteProperties: {
    getSiteProperties: jest.fn().mockResolvedValue({
      properties: { address: { country: 'FR' } }
    })
  },
  locations: {
    queryLocations: jest.fn(() => ({
      eq: jest.fn(() => ({
        find: jest.fn().mockResolvedValue({ items: [] })
      }))
    }))
  }
}));
    `,
  },

  // Country selector matching
  countrySelection: {
    title: "Country Selection Priority Matching",
    description: "How the component handles country selection with intelligent matching",
    code: `
// The CountrySelector uses a priority-based matching system:

// Priority 1: Exact ID match (highest priority)
// - User types "LK" → Selects Sri Lanka (LK)
// - User types "US" → Selects United States (US)
// - Prevents conflicts like LK vs FK (Falkland Islands)

// Priority 2: Exact label match
// - User types "Sri Lanka LK +94" → Selects Sri Lanka

// Priority 3: Exact country name match  
// - User types "Sri Lanka" → Selects Sri Lanka (LK)
// - User types "United Kingdom" → Selects United Kingdom (GB)

// Priority 4: Single filtered result
// - User types "United King" → Only GB matches → Auto-select GB

// Priority 5: Starts-with match (for ≤3 results)
// - User types "Uni" → Multiple matches → Select first starting with "Uni"

// Priority 6: Revert to last valid selection
// - User types invalid text → Reverts to previous selection

// Example usage patterns:
<InputMobileNumber
  onValidNumber={(number) => console.log(number)}
  enableLocationDetection={true}
  debug={true} // Enable to see matching process in console
/>

// Debug output shows the matching priority:
// 🌍 [CountrySelector] Selected: {country: "LK", name: "Sri Lanka", phoneCode: "+94"}
    `,
  },

  // Accessibility examples
  accessibility: {
    title: "Accessibility Implementation",
    description: "Ensuring the component is accessible",
    code: `
<InputMobileNumber
  // Proper labeling
  countryLabel="Country (required)"
  phoneLabel="Mobile Phone Number (required)"
  infoContent="We will send SMS notifications to this number"
  
  // Required field indication
  required={true}
  
  // Error handling
  onError={(hasError, message) => {
    // Announce errors to screen readers
    if (hasError && message) {
      // Update aria-live region or focus management
      announceToScreenReader(message);
    }
  }}
  
  // Data attributes for testing
  dataTestId="phone-input"
/>

// CSS for high contrast support
.phone-input {
  &:focus-within {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
  
  &[aria-invalid="true"] {
    border-color: var(--error-color);
  }
}
    `,
  },
};

export const examples = {
  // Real-world usage scenarios
  scenarios: [
    {
      title: "E-commerce Checkout",
      description: "Phone number collection during checkout process",
      props: {
        required: true,
        countryLabel: "Country",
        phoneLabel: "Mobile Number",
        infoContent: "Required for delivery notifications",
        enableLocationDetection: true,
      },
    },
    {
      title: "User Registration",
      description: "Account creation with phone verification",
      props: {
        required: true,
        countryLabel: "Country/Region",
        phoneLabel: "Phone Number",
        infoContent: "We'll send a verification code to this number",
        placeholder: "Enter your phone number",
      },
    },
    {
      title: "Contact Form",
      description: "Optional phone number in contact forms",
      props: {
        required: false,
        countryLabel: "Country",
        phoneLabel: "Phone (optional)",
        infoContent: "For urgent matters, we may call you",
        size: "large",
      },
    },
    {
      title: "Business Profile",
      description: "Business phone number configuration",
      props: {
        required: true,
        countryLabel: "Business Country",
        phoneLabel: "Business Phone",
        infoContent: "This will be displayed to customers",
        enableLocationDetection: true,
        debug: true,
      },
    },
  ],

  // Integration patterns
  integrations: [
    {
      title: "With Form Libraries",
      description: "Integration with Formik, React Hook Form, etc.",
      framework: "React Hook Form",
      code: `
import { useForm, Controller } from 'react-hook-form';

function FormExample() {
  const { control, handleSubmit } = useForm();
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="phone"
        control={control}
        rules={{ required: 'Phone number is required' }}
        render={({ field, fieldState: { error } }) => (
          <InputMobileNumber
            phoneNumber={field.value}
            onValidNumber={field.onChange}
            onError={(hasError, message) => {
              // Handle validation with form library
              if (hasError && message) {
                field.onChange(''); // Clear invalid value
              }
            }}
            required
            countryLabel="Country"
            phoneLabel="Phone Number"
          />
        )}
      />
    </form>
  );
}
      `,
    },
    {
      title: "With State Management",
      description: "Integration with Redux, Zustand, etc.",
      framework: "Redux Toolkit",
      code: `
import { useDispatch, useSelector } from 'react-redux';
import { setPhoneNumber, setPhoneError } from './phoneSlice';

function ConnectedPhoneInput() {
  const dispatch = useDispatch();
  const { phoneNumber, error } = useSelector(state => state.phone);
  
  return (
    <InputMobileNumber
      phoneNumber={phoneNumber}
      onValidNumber={(number) => {
        dispatch(setPhoneNumber(number));
        dispatch(setPhoneError(null));
      }}
      onError={(hasError, message) => {
        dispatch(setPhoneError(hasError ? message : null));
      }}
      enableLocationDetection
      required
    />
  );
}
      `,
    },
  ],
};

export default {
  content,
  examples,
};
