/**
 * Constants for InputMobileNumber component
 */

export const DEFAULT_PROPS = {
  placeholder: "Enter phone number",
  countryLabel: "Country",
  phoneLabel: "Phone Number",
  infoContent: "Enter the phone number to which the message will be sent.",
  enableLocationDetection: true,
  defaultCountry: "US",
  debug: false,
  disabled: false,
  required: false,
  size: "medium" as const,
} as const;

export const VALIDATION_MESSAGES = {
  SELECT_COUNTRY: "Please select a country",
  INVALID_PHONE: "Please enter a valid phone number",
  INVALID_FORMAT: "Invalid phone number format",
} as const;

export const STORAGE_KEYS = {
  USER_PREFERRED_COUNTRY: "user-preferred-country",
  DETECTED_COUNTRY_CACHE: "whatsapp_chat_detected_country",
} as const;

export const COMPONENT_DATA_TESTID = "input-mobile-number";
export const COMPONENT_DATA_HOOK = "input-mobile-number";

export const DEBUG_PREFIXES = {
  MAIN: "📱 [InputMobileNumber]",
  VALIDATION: "🔍 [Validation]",
  COUNTRY_SELECTOR: "🌍 [CountrySelector]",
} as const;
