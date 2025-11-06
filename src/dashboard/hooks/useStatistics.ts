import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSetRecoilState } from "recoil";
import { fetchStatistics } from "../services/api/statistics";
import { statisticsState } from "../services/state";
import { Stats } from "../../interfaces";
import { debugLogger } from "../utils/debug-logger";

/**
 * Simplified statistics hook using TanStack Query
 * 
 * @param range - Time range for statistics (default: "7d")
 * @returns Query result with refresh functionality
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error, refresh } = useStatistics("7d");
 * 
 * // Refresh with same range
 * refresh();
 * 
 * // Refresh with different range
 * refresh("30d");
 * ```
 */
export const useStatistics = (range: string = "7d") => {
  const queryClient = useQueryClient();
  const setStatisticsState = useSetRecoilState(statisticsState);

  const query = useQuery({
    queryKey: ["statistics", range],
    queryFn: async (): Promise<Stats> => {
      debugLogger.info("statistics", "Fetching statistics", { range });
      const data = await fetchStatistics(range) as Stats;
      debugLogger.info("statistics", "Statistics fetched successfully");
      
      // Update Recoil state
      setStatisticsState(data);
      
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const refreshMutation = useMutation({
    mutationFn: async (newRange?: string) => {
      const targetRange = newRange || range;
      debugLogger.info("statistics", "Refreshing statistics", { targetRange });
      return await fetchStatistics(targetRange) as Stats;
    },
    onSuccess: (data) => {
      debugLogger.info("statistics", "Statistics refreshed successfully");
      queryClient.setQueryData(["statistics", range], data);
      setStatisticsState(data);
    },
    onError: (error) => {
      debugLogger.error("statistics", "Failed to refresh statistics", error);
    },
  });

  return {
    ...query,
    refresh: refreshMutation.mutate,
    isRefreshing: refreshMutation.isPending,
  };
}; 