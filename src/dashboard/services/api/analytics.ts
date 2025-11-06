import { APP_ENDPOINTS } from "../../../constants";
import ApiClient from "../../utils/api-client";

export interface AnalyticsFilters {
  dateRange: "7d" | "30d" | "90d" | "custom";
  startDate?: Date;
  endDate?: Date;
  agentId?: string;
  includeDeviceData?: boolean;
  includeTimeBreakdown?: boolean;
}

/**
 * Fetch analytics data with optional filters
 */
export const fetchAnalytics = async (
  filters: AnalyticsFilters = { dateRange: "7d" }
) => {
  const queryParams = new URLSearchParams();
  queryParams.append("range", filters.dateRange);

  if (filters.agentId) {
    queryParams.append("agentId", filters.agentId);
  }

  if (filters.includeDeviceData) {
    queryParams.append("includeDeviceData", "true");
  }

  if (filters.includeTimeBreakdown) {
    queryParams.append("includeTimeBreakdown", "true");
  }

  if (filters.startDate) {
    queryParams.append("startDate", filters.startDate.toISOString());
  }

  if (filters.endDate) {
    queryParams.append("endDate", filters.endDate.toISOString());
  }

  return await ApiClient.request({
    url: `${APP_ENDPOINTS.STATS}?${queryParams.toString()}`,
    method: "GET",
    data: null,
    errorMessage: "Failed to fetch analytics data",
    secured: true,
  });
};

/**
 * Fetch real-time statistics
 */
export const fetchRealTimeStats = async () => {
  return await ApiClient.request({
    url: `${APP_ENDPOINTS.STATS}/realtime`,
    method: "GET",
    data: null,
    errorMessage: "Failed to fetch real-time stats",
    secured: true,
  });
};

/**
 * Fetch agent performance data
 */
export const fetchAgentPerformance = async (agentId?: string) => {
  const endpoint = agentId
    ? `${APP_ENDPOINTS.STATS}/agents/${agentId}`
    : `${APP_ENDPOINTS.STATS}/agents`;

  return await ApiClient.request({
    url: endpoint,
    method: "GET",
    data: null,
    errorMessage: "Failed to fetch agent performance",
    secured: true,
  });
};

/**
 * Export analytics data
 */
export const exportAnalyticsData = async (
  filters: AnalyticsFilters,
  format: "csv" | "json" | "xlsx" = "csv"
) => {
  return await ApiClient.request({
    url: `${APP_ENDPOINTS.STATS}/export`,
    method: "POST",
    data: { ...filters, format },
    errorMessage: "Failed to export analytics data",
    secured: true,
  });
};
