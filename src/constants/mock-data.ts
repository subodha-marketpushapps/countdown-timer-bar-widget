/**
 * Mock Data Providers for Fast Development
 *
 * These mocks provide realistic data without API calls
 * for faster development iterations
 */

import { WidgetContent, WidgetStyles } from "../interfaces";

/**
 * Mock User Data
 */
export const mockUserData = {
  id: "dev-user-123",
  email: "developer@example.com",
  name: "Dev User",
  subscription: "premium",
  siteId: "dev-site-123",
  permissions: ["read", "write", "admin"],
};

/**
 * Mock Site Data
 */
export const mockSiteData = {
  id: "dev-site-123",
  name: "Development Site",
  url: "https://dev-site.wixsite.com",
  language: "en",
  timezone: "UTC",
  premiumPlan: true,
};

/**
 * Mock Widget Content
 */
export const mockWidgetContent: WidgetContent = {
  // Content Section (PanelContent)
  title: "Limited Time Offer",
  subtitle: "Up to 50% Off",
  
  // Button Configuration
  showButton: true,
  buttonText: "Shop Now",
  buttonLink: "https://example.com/shop",
  makeEntireTimerClickable: false,
  openInNewTab: true,
  
  // Close Button
  showCloseButton: true,
  
  // Timer Section (PanelTimer)
  timerMode: "start-to-finish-timer",
  timerConfig: {
    startDate: new Date("2025-01-01"),
    startTime: "00:00:00",
    endDate: new Date("2025-12-31"),
    endTime: "23:59:59",
    timeZone: "UTC",
    displayOptions: {
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
    },
  },
  actionConfig: {
    action: "show-message",
    message: "The sale has ended. Thank you for your interest!",
    redirectUrl: "",
    showCountries: false,
    showButton: false,
  },
  
  // Appearance Section (PanelAppearance)
  selectedTemplate: "template-1",
  selectedClockStyle: "1",
  selectedTheme: "theme-1",
};

/**
 * Mock Widget Styles
 */
export const mockWidgetStyles: WidgetStyles = {
  // Layout Properties
  L_Widget_MaxWidth: 960,
  L_Widget_ElementGap: 12,
  L_Widget_FontSize: 2,
  L_Widget_FontFamily: "Arial, sans-serif",
  L_Widget_CornerRounding: 8,
  L_Widget_ZIndex: 100000,
  
  // Position Properties
  L_Widget_Position: "floating_top",
  L_Widget_Position_Desktop: {
    top: 0,
    left: 0,
    right: 0,
  },
  L_Widget_Position_Mobile: {
    top: 0,
    left: 0,
    right: 0,
  },
  L_Widget_PositionAlign_Desktop: "center",
  L_Widget_PositionAlign_Mobile: "center",
  
  // Design/Theme Properties
  D_Widget_BackgroundColor: "#ffffff",
  D_Widget_TextColor: "#272727",
  D_Widget_ButtonBackgroundColor: "#2563eb",
  D_Widget_ButtonTextColor: "#ffffff",
  D_Widget_BackgroundImage: "",
  D_Widget_Theme: "theme-1",
  
  // Clock Style Properties
  D_Clock_BackgroundColor: "#2563eb",
  D_Clock_TextColor: "#ffffff",
  D_Clock_NumberStyle: "fillEachDigit",
  D_Clock_LabelPosition: "bottom",
};

/**
 * Mock Analytics Data
 */
export const mockAnalyticsData = {
  totalChats: 156,
  totalClicks: 1230,
  conversionRate: 12.7,
  topAgents: [
    { name: "Sarah Johnson", chats: 67, rating: 4.8 },
    { name: "Mike Chen", chats: 45, rating: 4.6 },
    { name: "Lisa Anderson", chats: 44, rating: 4.9 },
  ],
  chartData: [
    { date: "2025-07-01", chats: 12, clicks: 89 },
    { date: "2025-07-02", chats: 18, clicks: 156 },
    { date: "2025-07-03", chats: 15, clicks: 134 },
    { date: "2025-07-04", chats: 22, clicks: 178 },
    { date: "2025-07-05", chats: 19, clicks: 167 },
    { date: "2025-07-06", chats: 25, clicks: 201 },
    { date: "2025-07-07", chats: 21, clicks: 189 },
  ],
  deviceBreakdown: {
    mobile: 68,
    desktop: 32,
  },
  timeBreakdown: {
    morning: 25,
    afternoon: 45,
    evening: 30,
  },
};

/**
 * Mock Template Data
 */
export const mockTemplateData = [
  {
    id: "template-1",
    name: "Sales Team",
    description: "Perfect for sales-focused businesses",
    category: "sales",
    content: {
      ...mockWidgetContent,
      greetingMessage: "Ready to boost your sales? Let's talk!",
    },
    styles: {
      ...mockWidgetStyles,
      primaryColor: "#FF6B6B",
      theme: "theme-sales",
    },
    preview:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop",
  },
  {
    id: "template-2",
    name: "Support Center",
    description: "Ideal for customer support teams",
    category: "support",
    content: {
      ...mockWidgetContent,
      greetingMessage: "Need help? Our support team is here for you!",
    },
    styles: {
      ...mockWidgetStyles,
      primaryColor: "#4ECDC4",
      theme: "theme-support",
    },
    preview:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop",
  },
  {
    id: "template-3",
    name: "Restaurant",
    description: "Great for restaurants and food businesses",
    category: "restaurant",
    content: {
      ...mockWidgetContent,
      greetingMessage: "Hungry? Let us help you with your order!",
    },
    styles: {
      ...mockWidgetStyles,
      primaryColor: "#FFB74D",
      theme: "theme-restaurant",
    },
    preview:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop",
  },
];

/**
 * Mock API Response Functions
 */
export const mockApiResponses = {
  getUserData: () => Promise.resolve(mockUserData),
  getSiteData: () => Promise.resolve(mockSiteData),
  getWidgetContent: () => Promise.resolve(mockWidgetContent),
  getWidgetStyles: () => Promise.resolve(mockWidgetStyles),
  getAnalyticsData: () => Promise.resolve(mockAnalyticsData),
  getTemplateData: () => Promise.resolve(mockTemplateData),

  // Simulate API delays for realistic testing
  getUserDataWithDelay: (delay = 500) =>
    new Promise((resolve) => setTimeout(() => resolve(mockUserData), delay)),
  getSiteDataWithDelay: (delay = 800) =>
    new Promise((resolve) => setTimeout(() => resolve(mockSiteData), delay)),
  getAnalyticsDataWithDelay: (delay = 1200) =>
    new Promise((resolve) =>
      setTimeout(() => resolve(mockAnalyticsData), delay)
    ),
};

/**
 * Mock Error Responses (for testing error states)
 */
export const mockErrorResponses = {
  networkError: () => Promise.reject(new Error("Network Error")),
  authError: () => Promise.reject(new Error("Authentication Error")),
  validationError: () => Promise.reject(new Error("Validation Error")),
  serverError: () => Promise.reject(new Error("Server Error")),
};
