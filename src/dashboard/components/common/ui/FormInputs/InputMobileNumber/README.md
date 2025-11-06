# InputMobileNumber Component

A comprehensive, enterprise-grade mobile number input component built specifically for the Wix ecosystem with intelligent location detection and robust validation.

## 🚀 Features

- **🌍 Wix-Native Location Detection**: Automatically detects user's country using Wix business tools APIs directly for optimal performance
- **📱 Complete Phone Validation**: Real-time validation using libphonenumber-js with proper error feedback
- **🔍 Intelligent Country Search**: Priority-based exact matching with comprehensive search capabilities
  - **Exact ID Match** (Priority 1): Type "LK" → Selects Sri Lanka (not Falkland Islands)
  - **Exact Name Match** (Priority 3): Type "Sri Lanka" → Selects LK
  - **Smart Auto-Complete**: Single result auto-select, starts-with matching, graceful fallback
- **📞 Initial Number Country Inference**: If you provide an initial E.164 phoneNumber (e.g., +14155550101), the component infers the country, preselects it, and normalizes the field to the national number while showing the calling code as a prefix
- **♿ Accessibility Ready**: Full ARIA support and keyboard navigation
- **🎨 Wix Design System**: Native integration with @wix/design-system components
- **🐛 Debug Support**: Built-in debug logging for development and troubleshooting
- **📝 TypeScript First**: Fully typed with comprehensive interfaces
- **🔧 Highly Customizable**: Extensive props for customization
- **⚡ High Performance**: Uses cached Wix site data, no external API calls needed

## 📦 Installation

```bash
# Already included in the project
# Import from the ui/FormInputs directory
```

## 🎯 Basic Usage

```tsx
import { InputMobileNumber } from "@/dashboard/components/ui/FormInputs";

function MyComponent() {
  return (
    <InputMobileNumber
      onValidNumber={(number) => console.log("Valid number:", number)}
      onError={(hasError, message) => {
        if (hasError) {
          console.error("Phone error:", message);
        }
      }}
      enableLocationDetection={true}
      required={true}
    />
  );
}
```

## 🔧 Advanced Configuration

```tsx
import { InputMobileNumber } from "@/dashboard/components/ui/FormInputs";

function AdvancedExample() {
  const customValidator = (phoneNumber: string, countryCode: string) => {
    // Custom validation logic
    if (countryCode === "US" && !phoneNumber.startsWith("1")) {
      return {
        isValid: false,
        errorMessage: "US numbers must start with 1",
      };
    }

    return { isValid: true };
  };

  return (
    <InputMobileNumber
      phoneNumber="+14155550101" // Initial value (E.164). Country will be inferred (US), selector preselected, input shows national number with +1 as prefix
      onValidNumber={(number) => handleValidNumber(number)}
      onError={(hasError, message) => handleError(hasError, message)}
      // Customization
      countryLabel="Select Country"
      phoneLabel="Mobile Number"
      infoContent="We'll send SMS updates to this number"
      placeholder="Enter your mobile number"
      // Location Detection
      enableLocationDetection={true} // Runs only when no initial phoneNumber is provided
      defaultCountry="US"
      // Validation
      customValidator={customValidator}
      required={true}
      // UI
      size="medium"
      disabled={false}
      className="custom-phone-input"
      // Development
      debug={process.env.NODE_ENV === "development"}
    />
  );
}
```

## 📋 Props Reference

| Prop                      | Type                                            | Default                                                       | Description                         |
| ------------------------- | ----------------------------------------------- | ------------------------------------------------------------- | ----------------------------------- |
| `onValidNumber`           | `(number: string) => void`                      | -                                                             | Callback when valid number entered  |
| `phoneNumber`             | `string`                                        | `""`                                                          | Initial phone number value          |
| `onError`                 | `(hasError: boolean, message?: string) => void` | -                                                             | Error state callback                |
| `placeholder`             | `string`                                        | `"Enter phone number"`                                        | Input placeholder text              |
| `required`                | `boolean`                                       | `false`                                                       | Whether field is required           |
| `countryLabel`            | `string`                                        | `"Country"`                                                   | Label for country selector          |
| `phoneLabel`              | `string`                                        | `"Whatsapp number"`                                           | Label for phone input               |
| `phoneLabel`              | `string`                                        | `"Phone Number"`                                              | Label for phone input               |
| `infoContent`             | `string`                                        | `"Enter the phone number to which the message will be sent."` | Info tooltip text                   |
| `enableLocationDetection` | `boolean`                                       | `true`                                                        | Enable automatic location detection |
| `defaultCountry`          | `string`                                        | `"US"`                                                        | Fallback country code               |
| `customValidator`         | `function`                                      | -                                                             | Custom validation function          |
| `debug`                   | `boolean`                                       | `false`                                                       | Enable debug logging                |
| `className`               | `string`                                        | -                                                             | Custom CSS class                    |
| `disabled`                | `boolean`                                       | `false`                                                       | Disable the input                   |
| `size`                    | `'small' \| 'medium' \| 'large'`                | `'medium'`                                                    | Component size                      |

## 🏗️ Architecture

### Component Structure

```
InputMobileNumber/
├── hooks/
│   ├── useWixLocationDetection.ts  # Direct Wix API integration
│   ├── usePhoneValidation.ts       # Phone validation logic
│   └── index.ts                    # Hook exports
├── components/
│   └── CountrySelector/            # Country selection with location detection
├── utils/                          # Helper functions
├── constants/                      # Configuration and constants
├── types.ts                        # TypeScript definitions
├── InputMobileNumber.tsx           # Main component
├── README.md                       # This documentation
└── LOCATION_DETECTION.md          # Location detection details
```

### Data Flow

1. **Wix Location Detection**: Uses `useWixLocationDetection` hook with direct `@wix/business-tools` integration
2. **Country Selection**: User can search and select country with intelligent auto-complete
3. **Phone Input**: Real-time validation as user types
4. **Validation**: Uses libphonenumber-js for comprehensive phone validation
5. **Feedback**: Provides immediate feedback for errors and validation states

## 🌍 Location Detection Methods

The component uses an efficient, Wix-native approach for location detection:

### Detection Priority (High Performance):

1. **Site Properties Address** (highest confidence)
   - Uses `siteProperties.getSiteProperties()` to check business address
   - Most accurate for established businesses with configured addresses

2. **Business Locations API** (high confidence)
   - Queries `locations.queryLocations()` for default or active business locations
   - Perfect for businesses with multiple locations or branches

3. **Site Locale Fallback** (medium confidence)
   - Uses site locale settings from Wix site configuration
   - Provides reasonable guess based on site's target market

4. **Default Country** (low confidence)
   - Ultimate fallback to US or specified default country

### Key Advantages:

- **⚡ Fast**: Uses cached Wix site data, no external API calls
- **🔒 Reliable**: Leverages proven Wix business tools APIs
- **🎯 Accurate**: Based on actual business location data
- **📦 Lightweight**: No complex geolocation or IP detection libraries
- **🔄 Consistent**: Works seamlessly across all Wix environments

## 📌 Behavior Notes: Initial Value vs. Detection

- If you pass an initial phoneNumber in E.164 format (e.g., "+14155550101"):
  - The component parses the number, infers the country (US in this example), and preselects it in the CountrySelector.
  - The input field is normalized to the national part (e.g., 4155550101), while the prefix shows the calling code (e.g., +1) from the selected country.
  - Automatic location detection is disabled to avoid overriding the explicit initial value.

- If no initial phoneNumber is provided:
  - Automatic location detection runs (Site Properties → Business Locations → Site Locale → defaultCountry) and preselects a country when available.
  - Users can still manually change the country; validation and formatting work in real time.

- Errors and validation:
  - onError(true, message) is called when validation fails; onError(false, "") clears the error state.
  - onValidNumber is emitted on blur when the number is valid, with the international E.164 formatted number.

## 🔍 Debug Mode

Enable debug mode to get detailed logging:

```tsx
<InputMobileNumber debug={true} />
```

Debug information includes:

- Location detection process
- Country selection events (with priority matching details)
- Phone validation results
- Component state changes

**Example debug output:**
```
🌍 [CountrySelector] AutoComplete onSelect: {optionId: "LK", country: "LK", name: "Sri Lanka"}
🌍 [CountrySelector] Selected: {country: "LK", name: "Sri Lanka", phoneCode: "+94"}
📱 [InputMobileNumber] Country selected: {country: "LK", name: "Sri Lanka", phoneCode: "+94"}
```

## 🎯 Country Selection Priority Matching

The CountrySelector component uses an intelligent priority-based matching system to ensure accurate country selection:

### Priority Levels:

1. **Priority 1: Exact ID Match** (Highest)
   - User types "LK" → Selects Sri Lanka (LK)
   - User types "US" → Selects United States (US)
   - Prevents conflicts (e.g., "LK" vs "FK" Falkland Islands which contains "lk")

2. **Priority 2: Exact Label Match**
   - User types "Sri Lanka LK +94" → Selects Sri Lanka

3. **Priority 3: Exact Country Name Match**
   - User types "Sri Lanka" → Selects Sri Lanka (LK)
   - User types "United Kingdom" → Selects United Kingdom (GB)

4. **Priority 4: Single Filtered Result**
   - User types "United King" → Only GB matches → Auto-select GB

5. **Priority 5: Starts-With Match** (for ≤3 results)
   - User types "Uni" → Multiple matches → Select first starting with "Uni"

6. **Priority 6: Revert to Last Valid** (Fallback)
   - User types invalid text → Reverts to previous selection
   - Empty search → Reverts to last valid selection

### Examples:

```tsx
// Search by country code
// Type "LK" → Blur → Selects Sri Lanka (LK) ✓

// Search by full name
// Type "Sri Lanka" → Blur → Selects Sri Lanka (LK) ✓

// Partial search with unique result
// Type "United King" → Blur → Selects United Kingdom (GB) ✓

// Invalid search recovery
// Select "US" → Type "XYZ" → Blur → Reverts to US ✓
```

### Keyboard Navigation:

- **Enter**: Selects first exact ID match or first filtered option
- **Escape**: Reverts to last valid selection
- **Tab**: Validates and selects based on priority matching

## ✅ Validation Features

- **Format Validation**: Checks phone number format for selected country
- **Length Validation**: Ensures correct number length
- **Type Detection**: Identifies mobile, landline, etc.
- **International Support**: Works with all countries
- **Custom Validators**: Support for business-specific rules

## 🎨 Styling & Theming

The component uses Wix Design System components and follows design system guidelines:

```tsx
// Custom styling example
<InputMobileNumber className="custom-phone-input" size="large" />
```

```css
.custom-phone-input {
  /* Your custom styles */
  margin-bottom: 16px;
}
```

## 🧪 Testing

The component is designed for testability:

```tsx
// Test example
import { render, fireEvent } from "@testing-library/react";
import { InputMobileNumber } from "./InputMobileNumber";

test("validates phone number correctly", () => {
  const onValidNumber = jest.fn();
  const { getByPlaceholderText } = render(<InputMobileNumber onValidNumber={onValidNumber} />);

  const input = getByPlaceholderText("Enter phone number");
  fireEvent.change(input, { target: { value: "1234567890" } });

  // Add assertions
});
```

## 🚨 Error Handling

The component provides comprehensive error handling:

- **Network Errors**: Graceful fallback for location detection
- **Validation Errors**: Clear error messages for invalid numbers
- **User Feedback**: Real-time validation with proper status indicators
- **Accessibility**: Error messages are properly announced

## 🔗 Integration with Wix Ecosystem

- **Direct Business Tools Integration**: Uses `@wix/business-tools` APIs directly for optimal performance
- **Design System Compliance**: Native Wix Design System components
- **CLI Compatibility**: Works seamlessly with Wix CLI development workflow
- **Site Settings Integration**: Leverages site business location and locale settings
- **Self-Contained**: No external dependencies, fully integrated with Wix platform

## 📈 Performance

- **Instant Detection**: Uses cached Wix site data for immediate results
- **Zero External Calls**: No geolocation, IP detection, or third-party APIs
- **Optimized Bundle**: Eliminated complex location detection libraries
- **Efficient Validation**: Debounced validation prevents excessive processing
- **Smart Caching**: Leverages Wix's built-in caching mechanisms
- **Minimal Bundle Impact**: Lightweight implementation focused on Wix APIs

## 🤝 Contributing

When contributing to this component:

1. Follow Wix Design System guidelines
2. Maintain TypeScript strict mode compliance
3. Add tests for new features
4. Update documentation
5. Test with various phone number formats

## 📝 License

Part of the WhatsApp Chat Marketing Dashboard project.

---

_Built with ❤️ for the Wix ecosystem_
