import {
  WhatsAppAgent,
  WidgetContent,
  WidgetStyles,
  WidgetVisibilityData,
  Settings,
  Stats,
  WixSiteData,
} from "../interfaces";


// WhatsApp Agent Defaults
// Default new member template
export const DEFAULT_NEW_MEMBER = {
  id: "new_member_template",
  name: "New Member",
  role: "Agent",
  phoneNumber: "",
  email: "",
  isVisible: true,
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
  imageUrl: "",
  showRole: true,
  initialMessage: "Hello! How can I help you?",
  introMessage: "Hi! I'm here to assist you.",
  statusIndicator: {
    indicator: "bulb" as const,
    textOnline: "Online",
    textOffline: "Offline",
  },
};

// Default Agents
export const DEFAULT_WHATSAPP_AGENTS: WhatsAppAgent[] = [
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
    initialMessage: "Hi, I’d like to know more about your pricing and offers.",
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
];

// Widget Content Defaults
export const DEFAULT_WIDGET_CONTENT: WidgetContent = {
  headerTitle: "Hello 👋",
  headerSubtitle:
    "We are happy to help you with any questions you might have. Please click one of our representatives below to send a message or email us at contact@example.com.",
  members: [DEFAULT_WHATSAPP_AGENTS[0]],
  footerText: "Feel free to reach out to us anytime!",
  badgeText: "",
  badgeIcon: 1,
  badgeIndicatorEnabled: true,
  badgeIndicatorMode: "smart",
  badgeIndicatorResetKey: "default",
  mainBehavior: "single-chat",
  chatInputMode: "input", // Default to input mode for chat interaction
  chatButtonLabel: "Chat on WhatsApp", // Default button label for direct button mode
  welcomeContentType: "agent",
  unavailableAgentBehavior: "show",
  showWelcomePopup: true,
  welcomeMessage: "Hello! How can we help you?",
  welcomePopupRepeatMode: "perReload",
  welcomePopupSoundEnabled: true,
  welcomePopupSoundType: "pop",
  welcomePopupSoundVolume: 0.5,
};

// Widget Visibility Defaults
export const DEFAULT_VISIBILITY_DATA: WidgetVisibilityData = {
  visibilityOption: "all-pages",
  visibilityPagePaths: [],
};

// Widget Styles Defaults
export const DEFAULT_WIDGET_STYLES: WidgetStyles = {
  D_Avatar_IndicatorActiveColor: "#24D366",
  D_Avatar_IndicatorDisabledColor: "#ACAFC4",
  D_Text_HighEmphasisColor: "#272727",
  D_Text_LowEmphasisColor: "#6A6C6C",
  D_Text_DisabledColor: "#929494",
  D_Btn_BackgroundColor: "#24D366",
  D_Btn_TextColor: "#FFFFFF",
  D_Card_BackgroundColor: "#FFFFFF",
  D_Header_BackgroundColor: "#008069",
  D_Header_Text_HighEmphasisColor: "#FFFFFF",
  D_Header_Text_LowEmphasisColor: "#E6E6E6",
  D_Content_BackgroundColor: "#E5DDD5",
  D_Content_BorderColor: "#E2E2E2",
  D_Footer_BackgroundColor: "#F8F9FA",
  L_Widget_FontFamily: "Arial, sans-serif",
  L_Widget_CornerRounding: 2,
  L_Widget_FontSize: 2,
  D_Content_BackgroundImage:
    "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/image_whatsapp-chat-background-classic.png",
  D_Badge_BackgroundColor: "#24D366",
  D_Badge_TextColor: "#FFFFFF",
  D_Badge_IndicatorColor: "#FF3B30",
  L_Badge_CornerRounding: {
    topLeft: 28,
    topRight: 28,
    bottomLeft: 28,
    bottomRight: 28,
    linked: true,
  },
  L_Badge_Size: 1.8,
  L_Widget_MaxWidth: 320,
  L_Widget_PositionAlign: "right",
  L_Widget_Position: {
    bottom: 24,
    left: 20,
    right: 20,
  },
  L_Widget_ElementGap: 12,
  L_Widget_ZIndex: 100000,
  D_Widget_Theme: "",
  L_Widget_Position_Mobile: {
    bottom: 24,
    left: 20,
    right: 20,
  },
  L_Widget_PositionAlign_Mobile: "right",
  L_Badge_Size_Mobile: 1.8,
  L_Badge_CornerRounding_Mobile: {
    topLeft: 28,
    topRight: 28,
    bottomLeft: 28,
    bottomRight: 28,
    linked: true,
  },
};

// Default Site Data
export const DEFAULT_WIX_SITE_DATA: WixSiteData = {
  instanceId: "",
  currency: "USD",
  locale: "en-US",
  email: "",
  siteDisplayName: "",
  siteUrl: "https://dev-sitex-413144989.wixdev-sites.org/",
  subscriptionPlan: "Free",
  appVersion: "unknown",
};

// Default Statistics - Empty stats object for fallback when no analytics data is available
export const DEFAULT_STATISTICS: Stats = {
  totalChats: 0,
  totalClicks: 0,
  conversionRate: 0,
  topAgents: [],
  chartData: [],
  deviceBreakdown: {
    mobile: 0,
    desktop: 0,
  },
  timeBreakdown: {
    morning: 0,
    afternoon: 0,
    evening: 0,
  },
};

// Default Settings
export const DEFAULT_SETTINGS: Settings = {
  firstName: null,
  lastName: null,
  email: null,
  timezoneId: null,
  businessName: null,
  businessPhoneNumber: null,
  installPopupShow: false,
  country: null,
  isUserReviewed: false,
  isAutoSaveEnabled: true,
};
