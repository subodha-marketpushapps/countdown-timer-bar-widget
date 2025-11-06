/**
 * Utility functions for InputMobileNumber component (barrel)
 */

/**
 * Case-insensitive string search utility
 * @param str - The string to search in
 * @param searchTerm - The term to search for
 * @returns Whether the search term is found in the string
 */
export function includesCaseInsensitive(str: string, searchTerm: string): boolean {
  return str.toLowerCase().includes(searchTerm.toLowerCase());
}

/**
 * Sanitizes phone number input to digits only
 * @param phoneNumber - Raw phone number input
 * @returns Phone number with only digits
 */
export function sanitizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, "");
}

/**
 * Formats display value for selected country
 * @param countryCode - ISO country code
 * @returns Formatted display value
 */
export function formatCountryDisplay(countryCode: string): string {
  return countryCode.toUpperCase();
}
