import { embeddedScripts } from "@wix/app-management";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { debugLogger } from "../utils/debug-logger";

export const QUERY_EMBEDS = "embeds";
export const MUTATE_EMBEDS = "embedScript";

interface UseEmbedsOptions {
  enabled?: boolean;
  retry?: boolean;
  staleTime?: number;
}

export const useEmbeds = <T extends Record<string, string>>(
  options: UseEmbedsOptions = {}
) => {
  const queryClient = useQueryClient();
  const { enabled = true, retry = false, staleTime = 5 * 60 * 1000 } = options;

  const getEmbeddedScript = useQuery<T, Error>({
    queryKey: [QUERY_EMBEDS],
    queryFn: async () => {
      debugLogger.info("embeds", "Fetching embedded script parameters");
      
      // https://dev.wix.com/docs/sdk/backend-modules/app-management/embedded-scripts/get-embedded-script
      const embeddedScript = await embeddedScripts.getEmbeddedScript();
      const parameters = (embeddedScript.parameters || {}) as T;
      
      debugLogger.info("embeds", "Embedded script parameters fetched successfully", parameters);
      return parameters;
    },
    enabled,
    retry,
    staleTime,
    refetchOnWindowFocus: false, // TanStack Query v5 best practice
    onError: (error) => {
      debugLogger.error("embeds", "Failed to fetch embedded script parameters", error);
    },
  });

  const embedScript = useMutation<T, Error, T>({
    mutationKey: [MUTATE_EMBEDS],
    mutationFn: async (parameters: T) => {
      debugLogger.info("embeds", "Embedding script with parameters", parameters);
      
      // https://dev.wix.com/docs/sdk/backend-modules/app-management/embedded-scripts/embed-script
      await embeddedScripts.embedScript({ parameters });
      
      debugLogger.info("embeds", "Script embedded successfully");
      return parameters;
    },
    onSuccess: (data) => {
      debugLogger.info("embeds", "Embed script mutation successful");
      queryClient.setQueryData([QUERY_EMBEDS], data);
    },
    onError: (error) => {
      debugLogger.error("embeds", "Failed to embed script", error);
    },
  });

  return { 
    embedScript, 
    getEmbeddedScript,
    // Expose loading states for better UX
    isLoadingScript: getEmbeddedScript.isLoading,
    isEmbedding: embedScript.isPending,
  };
};
