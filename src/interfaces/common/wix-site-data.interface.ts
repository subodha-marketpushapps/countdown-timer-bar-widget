/** High-level method used to determine the site's location. */
export type WixLocationDetectionMethod =
  | "site-properties"
  | "business-location"
  | "locale-fallback";

/** Confidence level of the detected location. */
export type WixLocationConfidence = "high" | "medium" | "low";

/** Enhanced location shape available on WixSiteData. */
export interface WixSiteLocation {
  /** Country name or ISO code depending on source (see countryCode). */
  country: string;
  /** ISO-3166 alpha-2 country code when available. */
  countryCode?: string;
  city?: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timezone?: string;
  method: WixLocationDetectionMethod;
  confidence: WixLocationConfidence;
}

/** Core site data fetched at app init and used across the dashboard. */
export interface WixSiteData {
  instanceId: string;
  currency: string;
  locale: string; // e.g. en-US
  email: string;
  siteDisplayName: string;
  siteUrl: string;
  subscriptionPlan: string;
  appVersion: string; // normalized to a string, "unknown" if not available
  /** Location details when available; undefined if not detected */
  location?: WixSiteLocation;
}
