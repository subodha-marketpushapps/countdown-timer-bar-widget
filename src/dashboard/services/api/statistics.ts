import { APP_ENDPOINTS } from "../../../constants";
import ApiClient from "../../utils/api-client";

export const fetchStatistics = async (range: string) => {
  return await ApiClient.request({
    url: `${APP_ENDPOINTS.STATS}?range=${range}`,
    method: "GET",
    data: null,
    errorMessage: "Failed to fetch statistics",
    secured: true,
  });
};
