import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSetRecoilState } from "recoil";
import { Settings } from "../../interfaces";
import * as settingsApi from "../services/api/settings";
import { settingsState } from "../services/state";
import { debugLogger } from "../utils/debug-logger";

export const QUERY_SETTINGS = "settings";

export const MUTATE_UPDATE_SETTINGS = "updateSettings";
export const MUTATE_UPDATE_INSTANCE = "updateInstance";

interface GetSettingsOptions {
  initializationKey?: number;
  enabled?: boolean;
  retry?: boolean;
  staleTime?: number;
  onSuccess?: (data: Settings) => void;
  onError?: (error: Error) => void;
}

interface UpdateInstanceOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: unknown) => void;
}

export const useSettings = () => {
  const queryClient = useQueryClient();
  const setSettingsState = useSetRecoilState(settingsState);

  const getSettings = (options: GetSettingsOptions = {}) => {
    const {
      initializationKey,
      enabled = true,
      retry = false,
      staleTime = 5 * 60 * 1000,
      onSuccess,
      onError,
    } = options;

    const queryKey =
      initializationKey !== undefined
        ? [QUERY_SETTINGS, initializationKey]
        : [QUERY_SETTINGS];

    return useQuery<Settings, Error>({
      queryKey,
      queryFn: async () => {
        debugLogger.info("settings", "Fetching settings");
        const data = await settingsApi.getSettings();
        debugLogger.info("settings", "Settings fetched successfully", {
          businessName: data.businessName,
          email: data.email,
        });

        setSettingsState(data);

        // Call success callback if provided
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
        debugLogger.error("settings", "Failed to fetch settings", error);
        onError?.(error);
      },
    });
  };

  const updateSettings = useMutation({
    mutationKey: [MUTATE_UPDATE_SETTINGS],
    mutationFn: (data: Partial<Settings>) => {
      debugLogger.info("settings", "Updating settings", data);
      return settingsApi.updateSettings(data);
    },
    onSuccess: (data) => {
      debugLogger.info("settings", "Settings updated successfully");
      queryClient.setQueryData([QUERY_SETTINGS], data);
      setSettingsState(data as Settings);
    },
    onError: (error) => {
      debugLogger.error("settings", "Failed to update settings", error);
    },
  });

  const updateInstance = (options: UpdateInstanceOptions = {}) => {
    const { onSuccess, onError } = options;

    return useMutation({
      mutationKey: [MUTATE_UPDATE_INSTANCE],
      mutationFn: async (instanceId: string) => {
        debugLogger.info("settings", "Updating instance", { instanceId });
        return settingsApi.updateInstance(instanceId);
      },
      retry: false, // Rely on API client retry logic
      onSuccess: (data) => {
        debugLogger.info("settings", "Instance updated successfully", data);
        onSuccess?.(data);
      },
      onError: (error) => {
        debugLogger.error("settings", "Failed to update instance", error);
        onError?.(error);
      },
    });
  };

  return {
    getSettings,
    updateSettings,
    updateInstance,
  };
};
