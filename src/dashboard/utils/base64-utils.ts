import { Base64 } from "js-base64";

// Function to encode an object to Base64
export function objectToBase64(obj: Record<string, any>): string {
  return Base64.encode(JSON.stringify(obj));
}

// Function to decode Base64 to an object
export function base64ToObject(base64Str: string): Record<string, any> {
  return JSON.parse(Base64.decode(base64Str));
}

// Function to encode Unicode string to Base64
export function utf8ToBase64(str: string): string {
  return Base64.encode(str);
}

// Function to decode Base64 to Unicode string
export function base64ToUtf8(base64Str: string): string {
  return Base64.decode(base64Str);
}

// Function to handle both encoding and decoding
export function handleBase64(action: "encode" | "decode", str: string): string {
  if (action === "encode") {
    return Base64.encode(str);
  } else if (action === "decode") {
    return Base64.decode(str);
  } else {
    throw new Error("Invalid action. Use 'encode' or 'decode'.");
  }
}

/**
 * Sanitizes a base64 string that may have been mangled by HTML attribute encoding (e.g., Wix data attributes).
 * - Replaces spaces with '+'
 * - Removes non-base64 characters (for extra safety)
 * - Adds padding if needed
 *
 * This is necessary because some platforms (like Wix) may mangle base64 strings in HTML attributes.
 */
export function sanitizeBase64ForDecoding(input: string): string {
  if (!input) return "";
  let sanitized = input.replace(/ /g, "+");
  sanitized = sanitized.replace(/[^A-Za-z0-9+/=]/g, "");
  const pad = sanitized.length % 4;
  if (pad) {
    sanitized += "=".repeat(4 - pad);
  }
  return sanitized;
}
