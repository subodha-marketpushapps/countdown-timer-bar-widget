/**
 * 🚀 Fast Development Configuration
 *
 * Simply change the DEV_MODE value to switch between development modes
 * No shell scripts, no environment variables - just change one line!
 */

export type DevModeType =
  | "full" // Regular flow, no blocks - complete app with AppInitializationProvider
  | "widget-builder" // Widget builder only, no initial data loading
  | "widget-only" // WhatsApp widget only with mock data
  | "dashboard"; // Dashboard only, no widget components

// 🎯 CHANGE THIS VALUE TO SWITCH MODES
export const DEV_MODE: DevModeType = "widget-builder"; // <-- Edit this line to change mode

// Available modes:
// 'full'           - Complete application with full initialization (slowest)
// 'widget-builder' - Widget builder component only, skip AppInitializationProvider
// 'widget-only'    - WhatsApp widget only with mock data (fastest)
// 'dashboard'      - Dashboard only, no widget components

/**
 * Development Mode Configuration
 */
const createDevConfig = (mode: DevModeType) =>
  ({
    // Current mode
    mode,

    // Feature flags based on mode
    features: {
      showDebugLogs: mode !== "full",
      useMockData: mode !== "full",
      skipApiCalls: mode !== "full",
      skipInitialization: mode !== "full", // Skip AppInitializationProvider
      showPerformanceInfo: mode !== "full",
      showModeIndicator: mode !== "full",
    },

    // What to load in each mode
    loadComponents: {
      widgetBuilder: ["widget-builder", "full"].includes(mode),
      widget: ["widget-only", "full"].includes(mode),
      initialization: mode === "full", // Only load AppInitializationProvider in full mode
      navigation: ["widget-builder", "full", "dashboard"].includes(mode),
    },

    // UI configurations
    ui: {
      showHeader: mode === "full",
      showSidebar: mode === "full",
      showFooter: mode === "full",
      showModeIndicator: mode !== "full",
      showPreviewControls: mode !== "full", // Show preview controls in dev modes
    },
  } as const);

export const DEV_CONFIG = createDevConfig(DEV_MODE);

/**
 * Helper functions
 */
export const isDev = (mode: DevModeType): boolean => DEV_MODE === mode;
export const isProduction = (): boolean => DEV_CONFIG.mode === "full";
export const shouldLoad = (
  component: keyof typeof DEV_CONFIG.loadComponents
): boolean => DEV_CONFIG.loadComponents[component];
export const shouldShow = (ui: keyof typeof DEV_CONFIG.ui): boolean =>
  DEV_CONFIG.ui[ui];

// Key helper for your use case
export const shouldSkipInitialization = (): boolean =>
  DEV_CONFIG.features.skipInitialization;

/**
 * Debug helper
 */
export const logDevMode = (): void => {
  // Debug logging disabled for cleaner console
};

// Legacy compatibility - keeping for existing imports
export const getCurrentDevMode = (): DevModeType => DEV_MODE;
export const getDevModeConfig = () => DEV_CONFIG;
export const isDevModeEnabled = (): boolean => DEV_CONFIG.mode !== "full";
export const shouldSkipApiCalls = (): boolean =>
  DEV_CONFIG.features.skipApiCalls;
export const shouldUseMockData = (): boolean => DEV_CONFIG.features.useMockData;
export const shouldShowDebugInfo = (): boolean =>
  DEV_CONFIG.features.showDebugLogs;
