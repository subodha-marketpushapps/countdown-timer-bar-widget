import { useQuery } from "@tanstack/react-query";
import { getSitePages, SitePage } from "../services/api/wix-site-data";
import { debugLogger } from "../utils/debug-logger";

export const QUERY_SITE_PAGES = "sitePages";

interface UseSitePagesOptions {
  initializationKey?: number;
  enabled?: boolean;
  retry?: boolean;
  staleTime?: number;
  onSuccess?: (pages: SitePage[]) => void;
  onError?: (error: Error) => void;
}

export const useSitePages = (options: UseSitePagesOptions = {}) => {
  const {
    initializationKey,
    enabled = true,
    retry = false,
    staleTime = 5 * 60 * 1000,
    onSuccess,
    onError,
  } = options;

  const queryKey = initializationKey !== undefined 
    ? [QUERY_SITE_PAGES, initializationKey] 
    : [QUERY_SITE_PAGES];

  return useQuery<SitePage[], Error>({
    queryKey,
    queryFn: async () => {
      debugLogger.info("site-pages", "Fetching site pages");
      const pages = await getSitePages();
      debugLogger.info("site-pages", "Site pages fetched successfully", {
        count: pages.length,
        pages: pages.map(p => ({ name: p.name, url: p.url, type: p.type })),
      });
      
      onSuccess?.(pages);
      return pages;
    },
    enabled,
    retry,
    staleTime,
    refetchOnWindowFocus: false,
    onError: (error) => {
      debugLogger.error("site-pages", "Failed to fetch site pages", error);
      onError?.(error);
    },
  });
};

// Export the interface for use in components
export type { SitePage };
