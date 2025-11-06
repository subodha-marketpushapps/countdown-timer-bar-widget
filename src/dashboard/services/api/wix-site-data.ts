import { appInstances } from "@wix/app-management";
import { siteProperties, locations } from "@wix/business-tools";
import { site } from "@wix/site-site";
import { httpClient } from "@wix/essentials";
import { WixSiteData } from "../../../interfaces";

export interface SitePage {
  name: string;
  url: string;
  type: "static" | "dynamic" | "router" | "app";
  isHomePage?: boolean;
}

/**
 * Fetches site pages using Wix Site SDK
 * Returns both static pages and dynamic/router pages with comprehensive fallback handling
 */
export const getSitePages = async (): Promise<SitePage[]> => {
  try {
    // Get the site structure using the official API
    const siteStructure = await site.getSiteStructure();

    const allPages: SitePage[] = [];

    // Process static and template pages
    if (siteStructure?.pages && Array.isArray(siteStructure.pages)) {
      for (const page of siteStructure.pages) {
        if (page.name) {
          allPages.push({
            name: page.name,
            url: page.url || page.prefix || `/${page.name.toLowerCase().replace(/\s+/g, '-')}`,
            type: page.type === "static" ? "static" : page.type === "template" ? "dynamic" : "static",
            isHomePage: page.isHomePage || page.url === '/' || page.prefix === '/',
          });
        }
      }
    }

    // Process router pages by getting their sitemaps
    if (siteStructure?.prefixes && Array.isArray(siteStructure.prefixes)) {
      for (const prefix of siteStructure.prefixes) {
        if (prefix.type === "router" || prefix.type === "dynamicPages") {
          try {
            const routerSitemap = await site.routerSitemap(prefix.prefix);

            if (Array.isArray(routerSitemap)) {
              for (const entry of routerSitemap) {
                if (entry.url) {
                  allPages.push({
                    name: entry.pageName || entry.title || `Page ${entry.url}`,
                    url: entry.url,
                    type: "router",
                    isHomePage: entry.url === '/',
                  });
                }
              }
            }
          } catch (routerError) {
            // If router sitemap fails, add the prefix as a general route option
            if (prefix.prefix) {
              allPages.push({
                name: prefix.name || `${prefix.prefix} Pages`,
                url: prefix.prefix,
                type: "router",
                isHomePage: prefix.prefix === '/',
              });
            }
          }
        } else if (prefix.type === "app") {
          // Add app pages/prefixes
          if (prefix.prefix) {
            allPages.push({
              name: prefix.name || `${prefix.prefix} App`,
              url: prefix.prefix,
              type: "app",
              isHomePage: prefix.prefix === '/',
            });
          }
        }
      }
    }

    // Ensure we always have at least a home page
    if (allPages.length === 0 || !allPages.some(p => p.isHomePage || p.url === '/')) {
      allPages.unshift({
        name: "Home",
        url: "/",
        type: "static",
        isHomePage: true,
      });
    }

    // Remove duplicates and sort: Home first, then alphabetically
    const uniquePages = allPages
      .filter((page, index, self) =>
        index === self.findIndex(p => p.url === page.url)
      )
      .sort((a, b) => {
        if (a.isHomePage) return -1;
        if (b.isHomePage) return 1;
        return a.name.localeCompare(b.name);
      });

    return uniquePages;

  } catch (error) {
    // Fallback: Return at least the home page
    console.warn("Failed to fetch site pages, using fallback:", error);
    return [
      {
        name: "Home",
        url: "/",
        type: "static",
        isHomePage: true,
      }
    ];
  }
};

/**
 * Fetches core Wix site data needed by the dashboard and component layer.
 * Includes a best-effort location detection derived from Site Properties,
 * Business Locations, and finally locale as a fallback.
 */
export const fetchWixSiteData = async (): Promise<WixSiteData> => {
  const DEFAULT_LOCALE = {
    country: "US",
    languageCode: "en",
  };

  const { instance, site } = await appInstances.getAppInstance();

  const properties = await getSiteProperties();
  const locale = properties?.locale || DEFAULT_LOCALE;
  const email = properties?.email || "";
  const {
    country = DEFAULT_LOCALE.country,
    languageCode = DEFAULT_LOCALE.languageCode,
  } = locale;

  const billing = instance?.billing;
  const plan = billing?.packageName ?? "Basic";

  const location = await detectSiteLocation(properties);

  const result = {
    instanceId: instance?.instanceId ?? "",
    currency: site?.paymentCurrency ?? "",
    locale: `${languageCode}-${country}`,
    email,
    siteDisplayName: site?.siteDisplayName ?? "",
    siteUrl: site?.url ?? "",
    subscriptionPlan: plan ?? "Basic",
    appVersion: instance?.appVersion ?? "unknown",
    location,
  };

  return result;
};

/**
 * Loads Site Properties, using the official API and a guarded HTTP fallback
 * to improve resilience. Throws if both primary and fallback fail.
 */
const getSiteProperties = async (): Promise<
  siteProperties.Properties | undefined
> => {
  try {
    const { properties } = await siteProperties.getSiteProperties();
    return properties;
  } catch (error: any) {
    console.warn("Primary site properties API failed, trying backup:", error);
    try {
      const response = await httpClient.fetchWithAuth(
        "https://www.wixapis.com/site-properties/v4/properties",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const backupProperties = await response.json();
      return backupProperties.properties as siteProperties.Properties;
    } catch (backupError: any) {
      console.error("Backup site properties API also failed:", backupError);
      throw new Error(
        "Failed to load site data from both primary and backup sources."
      );
    }
  }
};

/**
 * Enhanced location detection using Wix APIs with a clear priority order:
 * 1) Site Properties address (high confidence)
 * 2) Business Locations (high confidence)
 * 3) Site locale (medium confidence)
 */
const detectSiteLocation = async (
  properties?: siteProperties.Properties
): Promise<WixSiteData["location"]> => {
  try {
    // Priority 1: Site Properties Address (highest confidence)
    if (properties?.address?.country) {
      const coordinates =
        properties.address.coordinates &&
          typeof properties.address.coordinates.latitude === "number" &&
          typeof properties.address.coordinates.longitude === "number"
          ? {
            latitude: properties.address.coordinates.latitude,
            longitude: properties.address.coordinates.longitude,
          }
          : undefined;

      const result = {
        country: properties.address.country,
        countryCode: properties.address.country,
        city: properties.address.city,
        address:
          properties.address.googleFormattedAddress ||
          `${properties.address.street || ""} ${properties.address.streetNumber || ""
            }`.trim() ||
          undefined,
        coordinates,
        timezone: properties.timeZone || undefined,
        method: "site-properties" as const,
        confidence: "high" as const,
      };
      return result;
    }

    // Priority 2: Business Locations (high confidence)
    try {
      const locationsQuery = await locations
        .queryLocations()
        .eq("default", true)
        .find();

      let locationItem = locationsQuery.items[0];

      if (!locationItem && locationsQuery.items.length === 0) {
        // Try to get any active location
        const allLocationsQuery = await locations
          .queryLocations()
          .eq("status", "ACTIVE")
          .limit(1)
          .find();
        locationItem = allLocationsQuery.items[0];
      }

      if (locationItem?.address?.country) {
        const result = {
          country: locationItem.address.country,
          countryCode: locationItem.address.country,
          city: locationItem.address.city || undefined,
          address:
            `${locationItem.address.streetAddress?.name || ""} ${locationItem.address.streetAddress?.number || ""
              }`.trim() || undefined,
          coordinates: undefined, // Business locations might not have coordinates
          timezone: properties?.timeZone || undefined,
          method: "business-location" as const,
          confidence: "high" as const,
        };
        return result;
      }
    } catch (error) {
      // Keep silent in production; upstream fallback logic will engage.
    }

    // Priority 3: Site Locale (medium confidence fallback)
    if (properties?.locale?.country) {
      const result = {
        country: properties.locale.country,
        countryCode: properties.locale.country,
        city: undefined,
        address: undefined,
        coordinates: undefined,
        timezone: properties.timeZone || undefined,
        method: "locale-fallback" as const,
        confidence: "medium" as const,
      };
      return result;
    }
    return undefined;
  } catch (error) {
    console.warn("Site location detection failed:", error);
    return undefined;
  }
};
