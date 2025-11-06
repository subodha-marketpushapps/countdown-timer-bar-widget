import { atom } from "recoil";
import { Stats, Settings, WixSiteData } from "../../../interfaces";
import {
  DEFAULT_WIDGET_CONTENT,
  DEFAULT_WIDGET_STYLES,
  DEFAULT_VISIBILITY_DATA,
  DEFAULT_WIX_SITE_DATA,
  DEFAULT_SETTINGS,
  DEFAULT_STATISTICS,
} from "../../../constants";
import { WidgetState } from "../../../interfaces/custom/widget-state-interface";

// To store the wix site data
export const wixSiteDataState = atom<WixSiteData>({
  key: "wixSiteDataState",
  default: DEFAULT_WIX_SITE_DATA,
});

// To store the MKP settings data
export const settingsState = atom<Settings>({
  key: "settingsState",
  default: DEFAULT_SETTINGS,
});

// To store the statistics data
export const statisticsState = atom<Stats>({
  key: "statistics",
  default: DEFAULT_STATISTICS,
});

// To store the analytics data (enhanced analytics with filters)
export const analyticsState = atom<Stats | null>({
  key: "analyticsState",
  default: null,
});

// To store real-time analytics data
export const realTimeAnalyticsState = atom<{
  activeChats: number;
  onlineAgents: number;
  avgResponseTime: number;
  lastUpdated: Date;
} | null>({
  key: "realTimeAnalyticsState",
  default: null,
});

export const editorState = atom({
  key: "editorState",
  default: {
    viewType: "desktopView",
    backgroundMode: "website", // Default to website as per requirements
    desktopBackgroundMode: "website", // Remember user's desktop preference
    websiteLoadStatus: "loading", // "loading" | "loaded" | "failed"
  },
});

export const publishedWidgetState = atom<WidgetState>({
  key: "publishedWidgetState",
  default: {
    styles: DEFAULT_WIDGET_STYLES,
    content: DEFAULT_WIDGET_CONTENT,
    isVisible: false,
    visibilityData: DEFAULT_VISIBILITY_DATA,
  },
});

export const draftWidgetState = atom<WidgetState>({
  key: "draftWidgetState",
  default: {
    styles: DEFAULT_WIDGET_STYLES,
    content: DEFAULT_WIDGET_CONTENT,
    isVisible: false,
    visibilityData: DEFAULT_VISIBILITY_DATA,
  },
});

export const selectedTemplateSubmitState = atom({
  key: "selectedTemplateSubmitState",
  default: {
    isQuantityError: false,
    isErrors: false,
    isSubmitting: false,
    isRefreshRequested: false,
  },
});

export const activeRouteIdState = atom<number>({
  key: "activeRouteIdState",
  default: 0,
});

export const fullLoaderState = atom<boolean>({
  key: "fullLoaderState",
  default: false,
});

// To store the current navigation view (persists across hot reload)
export const currentViewState = atom<"onboarding" | "overview" | "widget-builder">({
  key: "currentViewState",
  default: "onboarding",
});

// Export Intercom alignment state
export { intercomAlignmentState } from './intercom';
