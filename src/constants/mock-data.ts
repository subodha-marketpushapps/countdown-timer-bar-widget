/**
 * Mock Data Providers for Fast Development
 *
 * These mocks provide realistic data without API calls
 * for faster development iterations
 */

import { WhatsAppAgent, WidgetContent, WidgetStyles } from "../interfaces";

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
  mainBehavior: "multi-chat",
  unavailableAgentBehavior: "show",
  members: [
    {
      id: "agent_1",
      name: "Alex Johnson",
      role: "Customer Support",
      phoneNumber: "+14155550101",
      availableTime: {
        startHour: 0,
        endHour: 0,
        availableDays: {
          Monday: true,
          Tuesday: true,
          Wednesday: true,
          Thursday: true,
          Friday: true,
          Saturday: true,
          Sunday: true,
        },
      },
      imageUrl:
        "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/image_chat-app_user-av_1.png",
      statusIndicator: {
        indicator: "both",
        textOnline: "I'm here to help!",
        textOffline: "Offline",
      },
      introMessage:
        "Hello! How may I assist you today?",
      initialMessage: "Hello! I have a question.",
      isVisible: true,
    },
    {
      id: "agent_2",
      name: "James Miller",
      role: "Sales Consultant",
      phoneNumber: "+14155550102",
      availableTime: {
        startHour: 0,
        endHour: 0,
        availableDays: {
          Monday: true,
          Tuesday: true,
          Wednesday: true,
          Thursday: true,
          Friday: true,
          Saturday: true,
          Sunday: true,
        },
      },
      imageUrl:
        "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/image_chat-app_user-av_2.png",
      statusIndicator: {
        indicator: "bulb",
        textOnline: "Need a quote? Let’s chat!",
        textOffline: "Unavailable",
      },
      introMessage:
        "Hello! I'm James from Sales. Let me know if you want a product recommendation or a quote.",
      initialMessage:
        "Hi, I’d like to know more about your pricing and offers.",
      isVisible: true,
    },
    {
      id: "agent_3",
      name: "Sofia Garcia",
      role: "Technical Support",
      phoneNumber: "+14155550103",
      availableTime: {
        startHour: 0,
        endHour: 0,
        availableDays: {
          Monday: true,
          Tuesday: true,
          Wednesday: true,
          Thursday: true,
          Friday: true,
          Saturday: true,
          Sunday: true,
        },
      },
      imageUrl:
        "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/image_chat-app_user-av_3.png",
      statusIndicator: {
        indicator: "text",
        textOnline: "Tech problem? I can help!",
        textOffline: "Tech Support Offline",
      },
      introMessage:
        "Hi, I'm Sofia. I can help you troubleshoot technical issues or answer product setup questions.",
      initialMessage: "I need help setting up my device.",
      isVisible: true,
    },
    {
      id: "agent_4",
      name: "Michael Lee",
      role: "Billing Specialist",
      phoneNumber: "+14155550104",
      availableTime: {
        startHour: 0,
        endHour: 0,
        availableDays: {
          Monday: true,
          Tuesday: true,
          Wednesday: true,
          Thursday: true,
          Friday: true,
          Saturday: true,
          Sunday: true,
        },
      },
      imageUrl:
        "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/image_chat-app_user-av_4.png",
      statusIndicator: {
        indicator: "bulb",
        textOnline: "Billing question? Ask me!",
        textOffline: "Offline",
      },
      introMessage:
        "Hello, I'm Michael from Billing. Ask me about invoices, payments, or refunds.",
      initialMessage: "I have a question about my invoice.",
      isVisible: true,
    },
    {
      id: "agent_5",
      name: "Olivia Smith",
      role: "Returns & Exchanges",
      phoneNumber: "+14155550105",
      availableTime: {
        startHour: 0,
        endHour: 0,
        availableDays: {
          Monday: true,
          Tuesday: true,
          Wednesday: true,
          Thursday: true,
          Friday: true,
          Saturday: true,
          Sunday: true,
        },
      },
      imageUrl:
        "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/image_chat-app_user-av_5.png",
      statusIndicator: {
        indicator: "text",
        textOnline: "Return or exchange? I’m here!",
        textOffline: "Away",
      },
      introMessage:
        "Hi! I'm Olivia. I can assist you with returns, exchanges, or warranty claims.",
      initialMessage: "I want to return or exchange a product.",
      isVisible: true,
    },
    {
      id: "agent_6",
      name: "Lucas Müller",
      role: "Product Specialist",
      phoneNumber: "+14155550106",
      availableTime: {
        startHour: 0,
        endHour: 0,
        availableDays: {
          Monday: true,
          Tuesday: true,
          Wednesday: true,
          Thursday: true,
          Friday: true,
          Saturday: true,
          Sunday: true,
        },
      },
      imageUrl:
        "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/image_chat-app_user-av_6.png",
      statusIndicator: {
        indicator: "both",
        textOnline: "Product questions? Ask away!",
        textOffline: "Offline",
      },
      introMessage:
        "Hello! I'm Lucas, your Product Specialist. Ask me about features, compatibility, or best practices.",
      initialMessage: "Can you tell me more about this product’s features?",
      isVisible: true,
    },
    {
      id: "agent_7",
      name: "Chloe Dubois",
      role: "Order Tracking",
      phoneNumber: "+14155550107",
      availableTime: {
        startHour: 0,
        endHour: 0,
        availableDays: {
          Monday: true,
          Tuesday: true,
          Wednesday: true,
          Thursday: true,
          Friday: true,
          Saturday: true,
          Sunday: true,
        },
      },
      imageUrl:
        "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/image_chat-app_user-av_7.png",
      statusIndicator: {
        indicator: "bulb",
        textOnline: "Track your order? Let’s check!",
        textOffline: "Offline",
      },
      introMessage:
        "Hi, I'm Chloe. I can help you track your order or update delivery details.",
      initialMessage: "I want to check the status of my order.",
      isVisible: true,
    },
    {
      id: "agent_8",
      name: "David Kim",
      role: "General Inquiries",
      phoneNumber: "+14155550108",
      availableTime: {
        startHour: 0,
        endHour: 0,
        availableDays: {
          Monday: true,
          Tuesday: true,
          Wednesday: true,
          Thursday: true,
          Friday: true,
          Saturday: true,
          Sunday: true,
        },
      },
      imageUrl:
        "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/image_chat-app_user-av_8.png",
      statusIndicator: {
        indicator: "text",
        textOnline: "Got a question? I’m online!",
        textOffline: "Offline",
      },
      introMessage:
        "Hello! I'm David. If you have any general questions, feel free to ask.",
      initialMessage: "I have a general question about your services.",
      isVisible: true,
    },
    {
      id: "agent_9",
      name: "Isabella Rossi",
      role: "Feedback & Suggestions",
      phoneNumber: "+14155550109",
      availableTime: {
        startHour: 0,
        endHour: 0,
        availableDays: {
          Monday: true,
          Tuesday: true,
          Wednesday: true,
          Thursday: true,
          Friday: true,
          Saturday: true,
          Sunday: true,
        },
      },
      imageUrl:
        "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/image_chat-app_user-av_9.png",
      statusIndicator: {
        indicator: "both",
        textOnline: "Share feedback? I’m listening!",
        textOffline: "Offline",
      },
      introMessage:
        "Hi! I'm Isabella. Share your feedback or suggestions to help us improve.",
      initialMessage: "I’d like to leave feedback about my experience.",
      isVisible: true,
    },
    {
      id: "agent_10",
      name: "Omar Farouk",
      role: "Account Management",
      phoneNumber: "+14155550110",
      availableTime: {
        startHour: 0,
        endHour: 0,
        availableDays: {
          Monday: true,
          Tuesday: true,
          Wednesday: true,
          Thursday: true,
          Friday: true,
          Saturday: true,
          Sunday: true,
        },
      },
      imageUrl:
        "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/image_chat-app_user-av_10.png",
      statusIndicator: {
        indicator: "bulb",
        textOnline: "Account update? I can help!",
        textOffline: "Offline",
      },
      introMessage:
        "Hello, I'm Omar. I can help you update your account details or manage your preferences.",
      initialMessage: "I want to update my account information.",
      isVisible: true,
    },
  ],
  headerTitle: "Chat with us",
  headerSubtitle: "We're here to help",
  footerText: "Powered by WhatsApp",
  badgeText: "Chat",
  badgeIndicatorEnabled: true,
  badgeIndicatorMode: "smart",
  badgeIndicatorResetKey: "default",
  showWelcomePopup: true,
  welcomeContentType: "custom",
  welcomeMessage: "Welcome! How can we help you today?",
  welcomePopupRepeatMode: "perReload",
  welcomePopupDuration: 10000,
};

/**
 * Mock Widget Styles
 */
export const mockWidgetStyles: WidgetStyles = {
  D_Avatar_IndicatorActiveColor: "#24D366",
  D_Avatar_IndicatorDisabledColor: "#ACAFC4",
  D_Text_HighEmphasisColor: "#272727",
  D_Text_LowEmphasisColor: "#6A6C6C",
  D_Text_DisabledColor: "#CCCCCC",
  D_Btn_BackgroundColor: "#24D366",
  D_Btn_TextColor: "#FFFFFF",
  D_Card_BackgroundColor: "#FFFFFF",
  D_Header_BackgroundColor: "#008069",
  D_Header_Text_HighEmphasisColor: "#FFFFFF",
  D_Header_Text_LowEmphasisColor: "#E6E6E6",
  D_Content_BackgroundColor: "#E5DDD5",
  D_Content_BorderColor: "#E2E2E2",
  D_Content_BackgroundImage:
    "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/image_whatsapp-chat-background-classic.png",
  D_Footer_BackgroundColor: "#F8F9FA",
  L_Widget_FontFamily: "Arial, sans-serif",

  L_Widget_CornerRounding: 2,
  L_Widget_FontSize: 2,

  L_Widget_MaxWidth: 360,
  L_Widget_PositionAlign: "right",
  L_Widget_Position: {
    bottom: 24,
    left: 20,
    right: 20,
  },
  L_Widget_Position_Mobile: {
    bottom: 24,
    left: 20,
    right: 20,
  },
  L_Widget_PositionAlign_Mobile: "right",
  L_Widget_ElementGap: 12,
  L_Widget_ZIndex: 100000,
  D_Badge_BackgroundColor: "#24D366",
  D_Badge_TextColor: "#FFFFFF",
  D_Badge_IndicatorColor: "#FF3B30",
  L_Badge_Size: 1.8,
  L_Badge_Size_Mobile: 1.8,
  L_Badge_CornerRounding: {
    topLeft: 28,
    topRight: 28,
    bottomLeft: 28,
    bottomRight: 28,
    linked: true,
  },
  L_Badge_CornerRounding_Mobile: {
    topLeft: 28,
    topRight: 28,
    bottomLeft: 28,
    bottomRight: 28,
    linked: true,
  },
  D_Widget_Theme: "",
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
