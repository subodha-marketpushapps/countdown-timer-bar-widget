import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { useCallback } from "react";
import type { Stats } from "../../interfaces";
import * as analyticsApi from "../services/api/analytics";
import { analyticsState, realTimeAnalyticsState } from "../services/state";
import { debugLogger } from "../utils/debug-logger";

// Re-export from API for convenience
export type { AnalyticsFilters } from "../services/api/analytics";

/**
 * Analytics filters interface (re-exported from API)
 */
export interface UseAnalyticsFilters {
  dateRange: "7d" | "30d" | "90d" | "custom";
  startDate?: Date;
  endDate?: Date;
  agentId?: string;
  includeDeviceData?: boolean;
  includeTimeBreakdown?: boolean;
}

/**
 * Real-time stats interface
 */
export interface RealTimeStats {
  activeChats: number;
  onlineAgents: number;
  avgResponseTime: number;
  lastUpdated: Date;
}

/**
 * Analytics hook options
 */
interface UseAnalyticsOptions {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
  onSuccess?: (data: Stats) => void;
  onError?: (error: Error) => void;
}

/**
 * Analytics hook return type
 */
export interface UseAnalyticsReturn {
  // Main analytics data
  data: Stats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  
  // Real-time data
  realTimeData: RealTimeStats | null;
  isRealTimeLoading: boolean;
  realTimeError: Error | null;
  refetchRealTime: () => void;
  
  // Mutations
  exportData: (format?: "csv" | "json" | "xlsx") => Promise<void>;
  isExporting: boolean;
  exportError: string | null;
  
  // Agent performance
  getAgentPerformance: (agentId?: string) => Promise<Stats["topAgents"]>;
}

/**
 * Analytics hook following the established TanStack Query + Recoil pattern
 * 
 * @param filters - Analytics filters
 * @param options - Hook options
 * @returns Analytics data and methods
 * 
 * @example
 * ```tsx
 * const {
 *   data,
 *   isLoading,
 *   realTimeData,
 *   exportData,
 *   getAgentPerformance
 * } = useAnalytics({ dateRange: "7d" });
 * ```
 */
export const useAnalytics = (
  filters: analyticsApi.AnalyticsFilters = { dateRange: "7d" },
  options: UseAnalyticsOptions = {}
): UseAnalyticsReturn => {
  const queryClient = useQueryClient();
  const setAnalyticsState = useSetRecoilState(analyticsState);
  const setRealTimeState = useSetRecoilState(realTimeAnalyticsState);
  const realTimeData = useRecoilValue(realTimeAnalyticsState);

  const {
    enabled = true,
    refetchInterval,
    staleTime = 5 * 60 * 1000, // 5 minutes
    onSuccess,
    onError,
  } = options;

  // Data processing utilities (moved from AnalyticsService)
  const processAnalyticsData = useCallback((rawData: any): Stats => {
    return {
      totalChats: rawData.totalChats || 0,
      totalClicks: rawData.totalClicks || 0,
      conversionRate: rawData.conversionRate || 0,
      topAgents: processAgentData(rawData.topAgents || rawData.agents || []),
      chartData: processChartData(rawData.chartData || rawData.timeSeriesData || []),
      deviceBreakdown: {
        mobile: rawData.deviceBreakdown?.mobile || 0,
        desktop: rawData.deviceBreakdown?.desktop || 0,
      },
      timeBreakdown: {
        morning: rawData.timeBreakdown?.morning || 0,
        afternoon: rawData.timeBreakdown?.afternoon || 0,
        evening: rawData.timeBreakdown?.evening || 0,
      },
    };
  }, []);

  const processAgentData = useCallback((agents: any[]): Stats["topAgents"] => {
    if (!Array.isArray(agents)) return [];
    
    return agents
      .map((agent) => ({
        name: agent.name || "Unknown Agent",
        chats: agent.chats || agent.chatCount || 0,
        rating: agent.rating || agent.averageRating || 0,
      }))
      .sort((a, b) => b.chats - a.chats)
      .slice(0, 3); // Top 3 agents
  }, []);

  const processChartData = useCallback((timeSeriesData: any[]): Stats["chartData"] => {
    if (!Array.isArray(timeSeriesData)) return [];
    
    return timeSeriesData.map((item) => ({
      date: item.date || new Date().toISOString().split("T")[0],
      chats: item.chats || 0,
      clicks: item.clicks || 0,
    }));
  }, []);

  const processRealTimeData = useCallback((rawData: any): RealTimeStats => {
    return {
      activeChats: rawData.activeChats || 0,
      onlineAgents: rawData.onlineAgents || 0,
      avgResponseTime: rawData.avgResponseTime || 0,
      lastUpdated: new Date(),
    };
  }, []);

  // Main analytics query
  const analyticsQuery = useQuery({
    queryKey: ["analytics", filters],
    queryFn: async (): Promise<Stats> => {
      debugLogger.info("analytics", "Fetching analytics data", { filters });
      const rawData = await analyticsApi.fetchAnalytics(filters);
      const processedData = processAnalyticsData(rawData);
      debugLogger.info("analytics", "Analytics data fetched successfully");
      
      // Update Recoil state
      setAnalyticsState(processedData);
      
      return processedData;
    },
    enabled,
    staleTime,
    refetchInterval,
    refetchOnWindowFocus: false,
    onSuccess,
    onError,
  });

  // Real-time analytics query
  const realTimeQuery = useQuery({
    queryKey: ["analytics", "realtime"],
    queryFn: async (): Promise<RealTimeStats> => {
      debugLogger.info("analytics", "Fetching real-time analytics");
      const rawData = await analyticsApi.fetchRealTimeStats();
      const processedData = processRealTimeData(rawData);
      debugLogger.info("analytics", "Real-time analytics fetched successfully");
      
      // Update Recoil state
      setRealTimeState(processedData);
      
      return processedData;
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds for real-time data
    refetchInterval: enabled ? 60 * 1000 : false, // Refresh every minute
    refetchOnWindowFocus: false,
  });

  // Export data mutation
  const exportMutation = useMutation({
    mutationFn: async (format: "csv" | "json" | "xlsx" = "csv") => {
      debugLogger.info("analytics", "Exporting analytics data", { format });
      const data = await analyticsApi.exportAnalyticsData(filters, format);
      
      // Create blob and download
      const blob = new Blob([JSON.stringify(data)], {
        type: format === "json" ? "application/json" : "text/csv",
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analytics-${filters.dateRange}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      debugLogger.info("analytics", "Analytics data exported successfully");
      return data;
    },
    onError: (error) => {
      debugLogger.error("analytics", "Failed to export analytics data", { error });
    },
  });

  // Agent performance function
  const getAgentPerformance = useCallback(async (agentId?: string): Promise<Stats["topAgents"]> => {
    debugLogger.info("analytics", "Fetching agent performance", { agentId });
    const data = await analyticsApi.fetchAgentPerformance(agentId);
    return (data as any).agents || [];
  }, []);

  return {
    // Main analytics data
    data: analyticsQuery.data || null,
    isLoading: analyticsQuery.isLoading,
    error: analyticsQuery.error as Error | null,
    refetch: analyticsQuery.refetch,
    
    // Real-time data
    realTimeData: realTimeQuery.data || null,
    isRealTimeLoading: realTimeQuery.isLoading,
    realTimeError: realTimeQuery.error as Error | null,
    refetchRealTime: realTimeQuery.refetch,
    
    // Export functionality
    exportData: async (format?: "csv" | "json" | "xlsx") => {
      return new Promise<void>((resolve, reject) => {
        exportMutation.mutate(format, {
          onSuccess: () => resolve(),
          onError: (error) => reject(error),
        });
      });
    },
    isExporting: exportMutation.isPending,
    exportError: exportMutation.error instanceof Error ? exportMutation.error.message : null,
    
    // Agent performance
    getAgentPerformance,
  };
};

export default useAnalytics;
