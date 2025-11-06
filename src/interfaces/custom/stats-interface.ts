export interface Stats {
  totalChats: number;
  totalClicks: number;
  conversionRate: number;
  topAgents: Array<{
    name: string;
    chats: number;
    rating: number;
  }>;
  chartData: Array<{
    date: string;
    chats: number;
    clicks: number;
  }>;
  deviceBreakdown: {
    mobile: number;
    desktop: number;
  };
  timeBreakdown: {
    morning: number;
    afternoon: number;
    evening: number;
  };
}
