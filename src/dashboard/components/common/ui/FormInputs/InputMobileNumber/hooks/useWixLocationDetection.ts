import { useState, useEffect, useCallback } from "react";
import { siteProperties, locations } from "@wix/business-tools";

export interface WixLocationResult {
  country: string;
  method: "site-properties" | "business-location" | "locale-fallback" | "default";
  confidence: "high" | "medium" | "low";
  isLoading: boolean;
  error?: string;
  redetect?: () => Promise<WixLocationResult>;
}

interface UseWixLocationDetectionOptions {
  defaultCountry?: string;
  enabled?: boolean;
  debug?: boolean;
}

/**
 * Hook for detecting user's country using Wix site data
 * This is specifically designed for the InputMobileNumber component
 * and uses Wix business tools directly for optimal performance
 */
export const useWixLocationDetection = (
  options: UseWixLocationDetectionOptions = {},
): WixLocationResult => {
  const { defaultCountry = "US", enabled = true, debug = false } = options;

  const [result, setResult] = useState<WixLocationResult>({
    country: defaultCountry,
    method: "default",
    confidence: "low",
    isLoading: enabled,
  });

  const debugLog = useCallback(
    (message: string, data?: any) => {
      if (debug) {
        console.log(`🏢 [WixLocationDetection] ${message}`, data || "");
      }
    },
    [debug],
  );

  const detectLocation = useCallback(async (): Promise<WixLocationResult> => {
    try {
      debugLog("Starting location detection from Wix site data");

      // Get site properties first
      const { properties } = await siteProperties.getSiteProperties();

      // Priority 1: Site Properties Address (highest confidence)
      if (properties?.address?.country) {
        debugLog("Location found in site properties address", {
          country: properties.address.country,
          city: properties.address.city,
        });

        return {
          country: properties.address.country,
          method: "site-properties",
          confidence: "high",
          isLoading: false,
        };
      }

      // Priority 2: Business Locations (high confidence)
      try {
        debugLog("Checking business locations");

        const locationsQuery = await locations.queryLocations().eq("default", true).find();

        let locationItem = locationsQuery.items[0];

        // Fallback to any active location if no default
        if (!locationItem && locationsQuery.items.length === 0) {
          const allLocationsQuery = await locations
            .queryLocations()
            .eq("status", "ACTIVE")
            .limit(1)
            .find();
          locationItem = allLocationsQuery.items[0];
        }

        if (locationItem?.address?.country) {
          debugLog("Location found in business locations", {
            country: locationItem.address.country,
            city: locationItem.address.city,
          });

          return {
            country: locationItem.address.country,
            method: "business-location",
            confidence: "high",
            isLoading: false,
          };
        }
      } catch (businessLocationError) {
        debugLog("Business location query failed", businessLocationError);
      }

      // Priority 3: Site Locale (medium confidence fallback)
      if (properties?.locale?.country) {
        debugLog("Location found in site locale", {
          country: properties.locale.country,
        });

        return {
          country: properties.locale.country,
          method: "locale-fallback",
          confidence: "medium",
          isLoading: false,
        };
      }

      debugLog("No location data found, using default");

      // Ultimate fallback
      return {
        country: defaultCountry,
        method: "default",
        confidence: "low",
        isLoading: false,
      };
    } catch (error) {
      debugLog("Location detection failed", error);

      return {
        country: defaultCountry,
        method: "default",
        confidence: "low",
        isLoading: false,
        error: error instanceof Error ? error.message : "Location detection failed",
      };
    }
  }, [defaultCountry, debugLog]);

  useEffect(() => {
    if (!enabled) {
      setResult({
        country: defaultCountry,
        method: "default",
        confidence: "low",
        isLoading: false,
      });
      return;
    }

    let cancelled = false;

    const runDetection = async () => {
      try {
        const detectionResult = await detectLocation();

        if (!cancelled) {
          setResult(detectionResult);
        }
      } catch (error) {
        if (!cancelled) {
          setResult({
            country: defaultCountry,
            method: "default",
            confidence: "low",
            isLoading: false,
            error: error instanceof Error ? error.message : "Detection failed",
          });
        }
      }
    };

    runDetection();

    return () => {
      cancelled = true;
    };
  }, [enabled, defaultCountry, detectLocation]);

  const redetect = useCallback(async (): Promise<WixLocationResult> => {
    if (!enabled) {
      return result;
    }

    setResult((prev) => ({ ...prev, isLoading: true }));
    const newResult = await detectLocation();
    setResult(newResult);
    return newResult;
  }, [enabled, result, detectLocation]);

  return {
    ...result,
    redetect,
  };
};
