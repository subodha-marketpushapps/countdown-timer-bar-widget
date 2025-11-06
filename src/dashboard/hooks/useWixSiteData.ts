import { useQuery } from "@tanstack/react-query";
import { useSetRecoilState } from "recoil";
import { WixSiteData } from "../../interfaces";
import { fetchWixSiteData } from "../services/api/wix-site-data";
import { wixSiteDataState } from "../services/state";
import { debugLogger } from "../utils/debug-logger";

export const QUERY_WIX_SITE_DATA = "wixSiteData";

interface UseWixSiteDataOptions {
  initializationKey?: number;
  enabled?: boolean;
  retry?: boolean;
  staleTime?: number;
  onSuccess?: (data: WixSiteData) => void;
  onError?: (error: Error) => void;
}

export const useWixSiteData = (options: UseWixSiteDataOptions = {}) => {
  const setWixSiteDataState = useSetRecoilState(wixSiteDataState);
  const {
    initializationKey,
    enabled = true,
    retry = false,
    staleTime = 5 * 60 * 1000,
    onSuccess,
    onError,
  } = options;

  const queryKey = initializationKey !== undefined 
    ? [QUERY_WIX_SITE_DATA, initializationKey] 
    : [QUERY_WIX_SITE_DATA];

  return useQuery<WixSiteData, Error>({
    queryKey,
    queryFn: async () => {
      debugLogger.info("wix-site-data", "Fetching Wix site data");
      const data = await fetchWixSiteData();
      debugLogger.info("wix-site-data", "Wix site data fetched successfully", {
        instanceId: data.instanceId,
        siteDisplayName: data.siteDisplayName,
      });
      
      setWixSiteDataState(data);
      onSuccess?.(data);
      
      return data;
    },
    enabled,
    retry,
    // Disable caching completely to avoid race conditions on hot reload
    staleTime: 0, // Data is always stale
    cacheTime: 0, // Don't cache at all (v4 uses cacheTime, v5 uses gcTime)
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always refetch on mount
    onError: (error) => {
      debugLogger.error("wix-site-data", "Failed to fetch Wix site data", error);
      onError?.(error);
    },
  });
};
