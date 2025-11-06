// Note: This file contains all the constants used in the dashboard module.
import wixConfig from "../../wix.config.json";

// To handle console.log() statements in production, you can use the _DEV constant. When _DEV is set to true, console.log() statements are executed. When _DEV is set to false, console.log() statements are ignored.
export const _DEV: boolean = true;

export const APP_ID = wixConfig.appId;
export const APP_NAME = "WhatsApp Chat";
export const APP_VERSION = "1.0.2";

// Widget identity used for namespacing preview control and DOM ids
export const WIDGET_KEY = "whatsapp-chat" as const;

// Preview actions shared with embedded script (string values must match)
export const PREVIEW_ACTIONS = {
  HIDE: "mkp.preview.hide",
  SHOW: "mkp.preview.show",
} as const;

// The APP_CONSTANTS object contains the baseUrl property
export const APP_CONSTANTS = {
  baseUrl:
    "https://us-east1-whatsapp-chat-and-marketing.cloudfunctions.net/app",
  digitalOceanBaseUrl:
    "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat",
};

export const APP_ENDPOINTS = {
  SETTINGS: APP_CONSTANTS.baseUrl + "/settings",
  SETTINGS_UPDATE: APP_CONSTANTS.baseUrl + "/settings",
  SETTINGS_UPDATE_INSTANCE: (instanceId: string) =>
    APP_CONSTANTS.baseUrl + `/settings/update-instance/${instanceId}`,

  SUBSCRIPTIONS: APP_CONSTANTS.baseUrl + "/subscriptions",

  // Stats
  STATS: APP_CONSTANTS.baseUrl + "/stats",
};

// The HELP_CENTER_URL constant contains the URL of the help center
export const HELP_CENTER_URL =
  "https://help.marketpushapps.com/en/collections/11166423-quantity-and-volume-discounts";

// The INTERCOM_APP_ID constant contains the Intercom app ID
export const INTERCOM_APP_ID = "h6dkwybg";

// The LOGROCKET_APP_ID constant contains the LogRocket app ID
export const LOGROCKET_APP_ID = "mea0ra/whatsapp-chat-marketing-tv0cc";

// The GUIDE_JAR_IFRAMES object contains the MAIN_FLOW_URL and PUBLISH_SITE_FLOW_URL properties
export const GUIDE_JAR_IFRAMES = {
  MAIN_FLOW_URL:
    "https://www.guidejar.com/embed/d42e4a28-2a1c-4ce3-ba85-af73ed244771?type=1&controls=off",
  PUBLISH_SITE_FLOW_URL:
    "https://www.guidejar.com/embed/rn7smN63qr0lK8uZ6cxZ?type=1&controls=off",
  DISCOUNT_NAME_FLOW_URL:
    "https://www.guidejar.com/embed/fb65913a-3037-45bc-addf-9aa8afb5bfe6?type=1&controls=off",
};

// Loading Screen Constants
// export { FEATURE_SLIDES, SLIDER_CONFIG } from "./loading-screen";

export * from "./data";

// Debug logging utility for WhatsApp Widget
export const DEBUG_WIDGET = {
  enabled: _DEV,
  log: (component: string, message: string, data?: any) => {
    if (DEBUG_WIDGET.enabled) {
      const timestamp = new Date().toISOString();
      console.log(
        `[${timestamp}] [WIDGET-${component}] ${message}`,
        data || ""
      );
    }
  },
  warn: (component: string, message: string, data?: any) => {
    if (DEBUG_WIDGET.enabled) {
      const timestamp = new Date().toISOString();
      console.warn(
        `[${timestamp}] [WIDGET-${component}] ${message}`,
        data || ""
      );
    }
  },
  error: (component: string, message: string, error?: any) => {
    if (DEBUG_WIDGET.enabled) {
      const timestamp = new Date().toISOString();
      console.error(
        `[${timestamp}] [WIDGET-${component}] ${message}`,
        error || ""
      );
    }
  },
};
