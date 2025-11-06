import { useCallback } from "react";
import { parsePhoneNumberWithError, isValidNumber, AsYouType } from "libphonenumber-js";
import type { CountryOption, PhoneValidationResult } from "../InputMobileNumber.types";
import { VALIDATION_MESSAGES } from "../InputMobileNumber.constants";

/**
 * Hook for phone number validation and formatting
 */
export const usePhoneValidation = (
  customValidator?: (phoneNumber: string, countryCode: string) => PhoneValidationResult,
) => {
  /**
   * Validates a phone number with the selected country
   */
  const validatePhone = useCallback(
    (phone: string, country: CountryOption | null): PhoneValidationResult => {
      if (!phone || !country) {
        return {
          isValid: false,
          errorMessage: phone ? VALIDATION_MESSAGES.SELECT_COUNTRY : "",
        };
      }

      // Use custom validator if provided
      if (customValidator) {
        return customValidator(phone, country.id);
      }

      try {
        const fullNumber = `${country.phoneCode}${phone}`;
        const isValidPhone = isValidNumber(fullNumber);

        if (isValidPhone) {
          const parsedNumber = parsePhoneNumberWithError(fullNumber);

          return {
            isValid: true,
            formattedNumber: parsedNumber.number,
            nationalNumber: parsedNumber.nationalNumber,
            countryCode: parsedNumber.country,
            internationalNumber: parsedNumber.formatInternational(),
          };
        } else {
          return {
            isValid: false,
            errorMessage: VALIDATION_MESSAGES.INVALID_PHONE,
          };
        }
      } catch (error) {
        return {
          isValid: false,
          errorMessage: VALIDATION_MESSAGES.INVALID_FORMAT,
        };
      }
    },
    [customValidator],
  );

  /**
   * Generates dynamic placeholder based on selected country
   */
  const getPhonePlaceholder = useCallback(
    (selectedCountry: CountryOption | null, fallbackPlaceholder: string) => {
      if (!selectedCountry) {
        return fallbackPlaceholder;
      }

      try {
        const formatter = new AsYouType(selectedCountry.id as any);
        const exampleNumber = formatter.input("1234567890");
        return `e.g., ${exampleNumber}`;
      } catch (error) {
        return fallbackPlaceholder;
      }
    },
    [],
  );

  return {
    validatePhone,
    getPhonePlaceholder,
  };
};
