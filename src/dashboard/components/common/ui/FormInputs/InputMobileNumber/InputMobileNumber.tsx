import React, { useState, useCallback, useEffect } from "react";
import { FieldSet, FormField, Input } from "@wix/design-system";
import { parsePhoneNumber } from "libphonenumber-js";

import { CountrySelector } from "./components/CountrySelector";
import { usePhoneValidation } from "./hooks/usePhoneValidation";
import { sanitizePhoneNumber } from "./utils";
import {
  DEFAULT_PROPS,
  COMPONENT_DATA_TESTID,
  COMPONENT_DATA_HOOK,
  DEBUG_PREFIXES,
} from "./InputMobileNumber.constants";
import { getCountryName } from "./constants/countries";
import type { InputMobileNumberProps, CountryOption } from "./InputMobileNumber.types";

/**
 * InputMobileNumber - Enhanced mobile number input component
 *
 * A production-ready phone number input with:
 * - Intelligent country detection
 * - Real-time validation
 * - Dynamic placeholders
 * - Accessibility support
 * - TypeScript-first design
 *
 * @example
 * ```tsx
 * <InputMobileNumber
 *   onValidNumber={(number) => console.log("Valid:", number)}
 *   onError={(hasError, message) => console.log("Error:", hasError, message)}
 *   enableLocationDetection={true}
 *   required={true}
 * />
 * ```
 */
const InputMobileNumber: React.FC<InputMobileNumberProps> = ({
  onValidNumber,
  phoneNumber = "",
  onError,
  placeholder = DEFAULT_PROPS.placeholder,
  required = DEFAULT_PROPS.required,
  showValidationErrors = false,
  countryLabel = DEFAULT_PROPS.countryLabel,
  phoneLabel = DEFAULT_PROPS.phoneLabel,
  infoContent = DEFAULT_PROPS.infoContent,
  enableLocationDetection = DEFAULT_PROPS.enableLocationDetection,
  defaultCountry = DEFAULT_PROPS.defaultCountry,
  customValidator,
  debug = DEFAULT_PROPS.debug,
  className,
  disabled = DEFAULT_PROPS.disabled,
  size = DEFAULT_PROPS.size,
  dataTestId = COMPONENT_DATA_TESTID,
  dataHook = COMPONENT_DATA_HOOK,
}) => {
  // Component state
  const [selectedCountry, setSelectedCountry] = useState<CountryOption | null>(null);
  const [phoneInput, setPhoneInput] = useState<string>(phoneNumber);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Custom hooks
  const { validatePhone, getPhonePlaceholder } = usePhoneValidation(customValidator);

  // If an initial E.164 phone number is provided, infer country and normalize input to national number
  useEffect(() => {
    if (!phoneNumber) return;
    try {
      const parsed = parsePhoneNumber(phoneNumber);
      if (parsed?.country && parsed?.countryCallingCode) {
        const countryOption: CountryOption = {
          id: parsed.country,
          subtitle: getCountryName(parsed.country),
          label: `${getCountryName(parsed.country)} ${parsed.country} +${parsed.countryCallingCode}`,
          phoneCode: `+${parsed.countryCallingCode}`,
          title: `${parsed.country} (+${parsed.countryCallingCode})`,
        };
        setSelectedCountry(countryOption);
        // Set input as national number (without country code) for consistency with prefix
        setPhoneInput(parsed.nationalNumber || phoneNumber);

        if (debug) {
          console.log(`${DEBUG_PREFIXES.MAIN} Inferred from initial number:`, {
            input: phoneNumber,
            country: parsed.country,
            callingCode: parsed.countryCallingCode,
            national: parsed.nationalNumber,
          });
        }
      }
    } catch (e) {
      // Ignore parse errors; fall back to manual selection or detection rules
      if (debug) {
        console.log(`${DEBUG_PREFIXES.MAIN} Failed to parse initial number`, {
          input: phoneNumber,
          error: e,
        });
      }
    }
    // Only react to the external prop changing
  }, [phoneNumber, debug]);

  // Handle validation errors display when showValidationErrors is true
  useEffect(() => {
    if (showValidationErrors && required) {
      if (!phoneInput && !selectedCountry) {
        setErrorMessage("Phone number is required");
        onError?.(true, "Phone number is required");
      } else if (!phoneInput && selectedCountry) {
        setErrorMessage("Phone number is required");
        onError?.(true, "Phone number is required");
      } else if (!selectedCountry && phoneInput) {
        setErrorMessage("Please select a country");
        onError?.(true, "Please select a country");
      } else if (phoneInput && selectedCountry) {
        // Validate the phone number
        const validationResult = validatePhone(phoneInput, selectedCountry);
        setErrorMessage(validationResult.errorMessage || "");
        onError?.(!validationResult.isValid, validationResult.errorMessage);
      }
    }
  }, [showValidationErrors, required, phoneInput, selectedCountry, validatePhone, onError]);

  /**
   * Handles phone input change with real-time validation
   */
  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitizedValue = sanitizePhoneNumber(e.target.value);
      setPhoneInput(sanitizedValue);

      // Clear error when user starts typing
      if (errorMessage) {
        setErrorMessage("");
        onError?.(false, "");
      }

      if (debug) {
        console.log(`${DEBUG_PREFIXES.MAIN} Input change:`, {
          raw: e.target.value,
          sanitized: sanitizedValue,
          country: selectedCountry?.id,
        });
      }
    },
    [errorMessage, onError, debug, selectedCountry?.id],
  );

  /**
   * Handles phone input blur with comprehensive validation
   */
  const handlePhoneBlur = useCallback(() => {
    if (!phoneInput || !selectedCountry) {
      return;
    }

    const validationResult = validatePhone(phoneInput, selectedCountry);

    setErrorMessage(validationResult.errorMessage || "");

    // Notify parent components
    onError?.(!validationResult.isValid, validationResult.errorMessage);

    if (validationResult.isValid && validationResult.formattedNumber) {
      onValidNumber?.(validationResult.formattedNumber);
    }

    if (debug) {
      console.log(`${DEBUG_PREFIXES.VALIDATION} Blur validation:`, {
        input: phoneInput,
        country: selectedCountry.id,
        result: validationResult,
      });
    }
  }, [phoneInput, selectedCountry, validatePhone, onError, onValidNumber, debug]);

  /**
   * Handles country selection
   */
  const handleCountrySelect = useCallback(
    (country: CountryOption | null) => {
      setSelectedCountry(country);

      if (!country) {
        setErrorMessage("Please select a country");
        onError?.(true, "Please select a country");
        return;
      }

      // Re-validate existing phone number with new country
      if (phoneInput) {
        const validationResult = validatePhone(phoneInput, country);
        setErrorMessage(validationResult.errorMessage || "");
        onError?.(!validationResult.isValid, validationResult.errorMessage);

        if (validationResult.isValid && validationResult.formattedNumber) {
          onValidNumber?.(validationResult.formattedNumber);
        }
      } else {
        // Clear errors when country is selected but no phone number yet
        setErrorMessage("");
        onError?.(false, "");
      }

      if (debug) {
        console.log(`${DEBUG_PREFIXES.MAIN} Country selected:`, {
          country: country.id,
          name: country.subtitle,
          phoneCode: country.phoneCode,
        });
      }
    },
    [phoneInput, validatePhone, onError, onValidNumber, debug],
  );

  // Allow auto country detection only on first render when no initial value provided
  const allowAutoDetection = enableLocationDetection && (!phoneNumber || phoneNumber.trim() === "");

  return (
    <div className={className} data-testid={dataTestId} data-hook={dataHook}>
      <FieldSet direction="horizontal" columns="1fr 4fr" legend="">
        <FormField label={countryLabel}>
          <CountrySelector
            onSelect={handleCountrySelect}
            value={selectedCountry?.id}
            enableLocationDetection={allowAutoDetection}
            defaultCountry={defaultCountry}
            disabled={disabled}
            size={size}
            debug={debug}
            dataTestId={`${dataTestId}-country`}
          />
        </FormField>

        <FormField
          label={phoneLabel}
          infoContent={infoContent}
          status={errorMessage ? "error" : undefined}
          statusMessage={errorMessage}
          required={required}
        >
          <Input
            placeholder={getPhonePlaceholder(selectedCountry, placeholder)}
            value={phoneInput}
            onChange={handlePhoneChange}
            onBlur={handlePhoneBlur}
            status={errorMessage ? "error" : undefined}
            disabled={disabled}
            size={size}
            prefix={
              selectedCountry ? <Input.Affix>{selectedCountry.phoneCode}</Input.Affix> : undefined
            }
            data-testid={`${dataTestId}-phone-input`}
          />
        </FormField>
      </FieldSet>
    </div>
  );
};

InputMobileNumber.displayName = "InputMobileNumber";

export default InputMobileNumber;
