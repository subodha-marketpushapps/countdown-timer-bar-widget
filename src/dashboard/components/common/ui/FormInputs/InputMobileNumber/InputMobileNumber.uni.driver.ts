/**
 * InputMobileNumber Test Driver
 *
 * This driver provides a uniform interface for testing the InputMobileNumber component
 * following Wix Design System conventions.
 */

export interface InputMobileNumberDriver {
  /** Check if the component exists */
  exists(): Promise<boolean>;

  /** Get the phone input element */
  getPhoneInput(): HTMLInputElement | null;

  /** Get the selected country value */
  getSelectedCountry(): Promise<string | null>;

  /** Enter a phone number */
  enterPhoneNumber(phoneNumber: string): Promise<void>;

  /** Get the current phone number value */
  getPhoneNumberValue(): Promise<string>;

  /** Get error message if present */
  getErrorMessage(): Promise<string | null>;

  /** Check if component has error state */
  hasError(): Promise<boolean>;

  /** Check if component is disabled */
  isDisabled(): Promise<boolean>;

  /** Trigger phone input blur event */
  blurPhoneInput(): Promise<void>;

  /** Get placeholder text */
  getPlaceholderText(): Promise<string>;
}

export const createInputMobileNumberDriver = (container: HTMLElement): InputMobileNumberDriver => {
  const getElement = (selector: string): HTMLElement | null => container.querySelector(selector);

  return {
    exists: async () => {
      return getElement('[data-hook="input-mobile-number"]') !== null;
    },

    getPhoneInput: () => {
      return getElement('[data-testid$="-phone"] input') as HTMLInputElement;
    },

    getSelectedCountry: async () => {
      const countrySelector = getElement('[data-testid$="-country"]');
      return countrySelector?.getAttribute("data-selected-country") || null;
    },

    enterPhoneNumber: async (phoneNumber: string) => {
      const phoneInput = getElement('[data-testid$="-phone"] input') as HTMLInputElement;
      if (phoneInput) {
        phoneInput.value = phoneNumber;
        phoneInput.dispatchEvent(new Event("change", { bubbles: true }));
      }
    },

    getPhoneNumberValue: async () => {
      const phoneInput = getElement('[data-testid$="-phone"] input') as HTMLInputElement;
      return phoneInput?.value || "";
    },

    getErrorMessage: async () => {
      const errorElement = getElement('.error-message, [data-hook="error-message"]');
      return errorElement?.textContent || null;
    },

    hasError: async () => {
      return getElement('.error-message, [data-hook="error-message"]') !== null;
    },

    isDisabled: async () => {
      const phoneInput = getElement('[data-testid$="-phone"] input') as HTMLInputElement;
      return phoneInput?.disabled || false;
    },

    blurPhoneInput: async () => {
      const phoneInput = getElement('[data-testid$="-phone"] input') as HTMLInputElement;
      if (phoneInput) {
        phoneInput.dispatchEvent(new Event("blur", { bubbles: true }));
      }
    },

    getPlaceholderText: async () => {
      const phoneInput = getElement('[data-testid$="-phone"] input') as HTMLInputElement;
      return phoneInput?.placeholder || "";
    },
  };
};
