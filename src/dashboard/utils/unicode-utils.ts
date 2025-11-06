/**
 * Unicode-safe utility functions for state management
 */

/**
 * Generate a Unicode-safe checksum for any object
 * @param obj The object to generate a checksum for
 * @param length Desired length of the checksum (default: 16)
 * @returns A hex string checksum
 */
export function generateUnicodeSafeChecksum(
  obj: any,
  length: number = 16
): string {
  try {
    const jsonString = safeJSONStringify(obj);

    // Use TextEncoder if available (modern browsers)
    if (typeof TextEncoder !== "undefined") {
      const encoder = new TextEncoder();
      const data = encoder.encode(jsonString);
      return generateHashFromBytes(data, length);
    }

    // Fallback for older environments
    return generateHashFromString(jsonString, length);
  } catch (error) {
    console.error("Failed to generate checksum:", error);
    // Return a time-based fallback
    return Date.now().toString(36).slice(-length).padEnd(length, "0");
  }
}

/**
 * Generate hash from Uint8Array bytes
 */
function generateHashFromBytes(data: Uint8Array, length: number): string {
  let hash = 0;

  // Use a simple but effective hash algorithm
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash + data[i]) & 0xffffffff;
  }

  // Convert to positive hex and trim/pad to desired length
  const hex = Math.abs(hash).toString(16);
  return hex.slice(0, length).padEnd(length, "0");
}

/**
 * Generate hash directly from string (Unicode-safe)
 */
function generateHashFromString(str: string, length: number): string {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    // Use charCodeAt which handles Unicode properly
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) & 0xffffffff;
  }

  // Convert to positive hex and trim/pad to desired length
  const hex = Math.abs(hash).toString(16);
  return hex.slice(0, length).padEnd(length, "0");
}

/**
 * Test if a string contains Unicode characters outside Latin1 range
 * @param str String to test
 * @returns True if contains Unicode characters
 */
export function containsUnicodeCharacters(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      return true;
    }
  }
  return false;
}

/**
 * Safe JSON stringify that handles circular references and Unicode
 * @param obj Object to stringify
 * @param space Optional spacing
 * @returns JSON string
 */
export function safeJSONStringify(obj: any, space?: string | number): string {
  try {
    const seen = new WeakSet();
    return JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) return "[Circular Reference]";
          seen.add(value);
        }
        return value;
      },
      space
    );
  } catch (error) {
    console.error("Safe JSON stringify failed:", error);
    return "{}";
  }
}

/**
 * Unicode-safe Base64 encode/decode helpers
 */
export function unicodeSafeBase64Encode(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  } catch {
    // Fallback: escape Unicode to UTF-8 percent-encoding then btoa
    return btoa(unescape(encodeURIComponent(str)));
  }
}

export function unicodeSafeBase64Decode(b64: string): string {
  try {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    // Fallback for legacy environments
    return decodeURIComponent(escape(atob(b64)));
  }
}
