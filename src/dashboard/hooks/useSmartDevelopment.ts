/**
 * Smart Development Hooks
 *
 * These hooks automatically switch between real API calls and mock data
 * based on the current development mode configuration.
 * 
 * CRITICAL: State management is ALWAYS preserved, only API calls are mocked
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import {
  DEV_MODE,
  DEV_CONFIG,
  getCurrentDevMode,
} from "../../constants/dev-modes";
import {
  mockApiResponses,
  mockErrorResponses,
  mockWidgetContent,
  mockWidgetStyles,
} from "../../constants/mock-data";
import { useWidgetStateManager } from "./useWidgetStateManager";
import { WidgetState } from "../../interfaces/custom/widget-state-interface";

/**
 * Smart Widget State Manager Hook
 * CRITICAL: Always uses real state management, only mocks API persistence in dev modes
 * This ensures proper state handling while skipping heavy API calls during development
 */
export const useSmartWidgetStateManager = (options = {}) => {
  const shouldSkipApiCalls = DEV_CONFIG.features.skipApiCalls;
  
  // Always use the real hook to maintain proper state management
  let realStateManager;
  
  try {
    realStateManager = useWidgetStateManager({
      autoSave: !shouldSkipApiCalls, // Disable auto-save in dev modes
      enableValidation: true, // Always keep validation
      enableOptimisticUpdates: true, // Always keep optimistic updates
      ...options,
    });
  } catch (error) {
    console.warn("[DEV] Real useWidgetStateManager failed, using fallback:", error);
    // Fallback to a minimal state manager if the real one fails
    return useFallbackStateManager();
  }

  // In dev modes, wrap API calls with mock responses but keep state logic
  if (shouldSkipApiCalls) {
    return {
      ...realStateManager,
      // Mock API persistence methods while keeping state updates
      save: async () => {
        // Keep the local state update logic but skip API call
        return { success: true, changes: [] };
      },
      publish: async () => {
        // Keep the local state update logic but skip API call
        return { success: true, changes: [] };
      },
      unpublish: async () => {
        // Keep the local state update logic but skip API call
        return { success: true, changes: [] };
      },
      // Keep all other functionality intact (state updates, validation, history)
      isSaving: false, // Override loading states in dev mode
      isPublishing: false,
    };
  }

  // In full mode, return the real hook unchanged
  return realStateManager;
};

/**
 * Fallback State Manager for Development
 * Used when the real state manager fails in dev environments
 */
const useFallbackStateManager = () => {
  const [draftState, setDraftState] = useState({
    content: mockWidgetContent,
    styles: mockWidgetStyles,
    isVisible: true,
    visibilityData: { visibilityOption: "all-pages" as const, visibilityPagePaths: [] },
  });

  const [publishedState, setPublishedState] = useState({
    content: mockWidgetContent,
    styles: mockWidgetStyles,
    isVisible: true,
    visibilityData: { visibilityOption: "all-pages" as const, visibilityPagePaths: [] },
  });

  return useMemo(() => ({
    // State access
    draftState,
    publishedState,

    // Update methods with proper state management
    updateDraft: async (update: any) => {
      setDraftState(prev => 
        typeof update === 'function' ? update(prev) : { ...prev, ...update }
      );
      return { success: true, changes: [] };
    },

    updateStyles: async (styles: any) => {
      setDraftState(prev => ({ ...prev, styles: { ...prev.styles, ...styles } }));
      return { success: true, changes: [] };
    },

    updateContent: async (content: any) => {
      setDraftState(prev => ({ ...prev, content: { ...prev.content, ...content } }));
      return { success: true, changes: [] };
    },

    updateAgents: async (agents: any) => {
      setDraftState(prev => ({ 
        ...prev, 
        content: { ...prev.content, members: agents }
      }));
      return { success: true, changes: [] };
    },

    // Persistence methods
    save: async () => {
      return { success: true, changes: [] };
    },

    publish: async () => {
      setPublishedState(draftState);
      return { success: true, changes: [] };
    },

    unpublish: async () => {
      return { success: true, changes: [] };
    },

    discard: () => {
      setDraftState(publishedState);
    },

    // History methods (simplified)
    undo: () => { return false; },
    redo: () => { return false; },
    clearHistory: () => { },

    // State flags
    hasUnsavedChanges: JSON.stringify(draftState) !== JSON.stringify(publishedState),
    hasUnpublishedChanges: JSON.stringify(draftState) !== JSON.stringify(publishedState),
    canUndo: false,
    canRedo: false,
    isLoading: false,
    isSaving: false,
    isPublishing: false,
    isEmbedding: false,
    isNewUser: false,

    // Validation
    validationErrors: [],
    validationWarnings: [],

    // Batch operations
    startBatch: () => "dev-batch",
    endBatch: () => { },

    // Debug utilities
    debugEmbed: async () => { },

    // Circuit breaker status
    embedOperationInProgress: false,
    lastEmbedTimestamp: 0,
  }), [draftState, publishedState]);
};

/**
 * Smart User Data Hook
 */
export const useSmartUserData = (options = {}) => {
  const shouldUseMockData = DEV_CONFIG.features.useMockData;

  return useQuery({
    queryKey: ["userData"],
    queryFn: shouldUseMockData ? mockApiResponses.getUserData : getUserDataApi,
    enabled: true, // Always enabled, just mock the response
    ...options,
  });
};

/**
 * Smart Site Data Hook
 */
export const useSmartSiteData = (options = {}) => {
  const shouldUseMockData = DEV_CONFIG.features.useMockData;

  return useQuery({
    queryKey: ["siteData"],
    queryFn: shouldUseMockData ? mockApiResponses.getSiteData : getSiteDataApi,
    enabled: true, // Always enabled, just mock the response
    ...options,
  });
};

/**
 * Smart Analytics Hook
 */
export const useSmartAnalytics = (options = {}) => {
  const shouldUseMockData = DEV_CONFIG.features.useMockData;

  return useQuery({
    queryKey: ["analytics"],
    queryFn: shouldUseMockData
      ? mockApiResponses.getAnalyticsData
      : getAnalyticsApi,
    enabled: true, // Always enabled in some form
    ...options,
  });
};

/**
 * Smart Templates Hook
 */
export const useSmartTemplates = (options = {}) => {
  const shouldUseMockData = DEV_CONFIG.features.useMockData;

  return useQuery({
    queryKey: ["templates"],
    queryFn: shouldUseMockData
      ? mockApiResponses.getTemplateData
      : getTemplatesApi,
    enabled: true, // Templates are lightweight
    ...options,
  });
};

/**
 * Smart Wix API Hook
 */
export const useSmartWixAPI = (endpoint: string, options = {}) => {
  const shouldCallAPI = !DEV_CONFIG.features.skipApiCalls;

  return useQuery({
    queryKey: ["wixAPI", endpoint],
    queryFn: shouldCallAPI
      ? () => callWixAPI(endpoint)
      : () => Promise.resolve(null),
    enabled: shouldCallAPI,
    ...options,
  });
};

/**
 * Development Hook Utilities
 */
export const useDevHookUtils = () => {
  const queryClient = useQueryClient();

  return {
    // Force refresh all queries
    refreshAll: () => {
      queryClient.invalidateQueries();
    },

    // Toggle between mock and real data
    toggleMockMode: () => {
      // To toggle mock mode, change DEV_MODE in src/constants/dev-modes.ts
    },

    // Get current data source
    getDataSource: () => {
      const useMock = DEV_CONFIG.features.useMockData;
      return {
        userData: useMock ? "mock" : "api",
        siteData: useMock ? "mock" : "api",
        analytics: useMock ? "mock" : "api",
        templates: useMock ? "mock" : "api",
      };
    },

    // Performance metrics
    getPerformanceMetrics: () => {
      const devMode = getCurrentDevMode();
      const enabledComponents = Object.entries(DEV_CONFIG.loadComponents)
        .filter(([_, enabled]) => enabled)
        .map(([component]) => component);

      const disabledComponents = Object.entries(DEV_CONFIG.loadComponents)
        .filter(([_, enabled]) => !enabled)
        .map(([component]) => component);

      return {
        devMode,
        enabledComponents,
        disabledComponents,
        estimatedSpeedup: `${disabledComponents.length * 500}ms saved`,
        usingMockData: DEV_CONFIG.features.useMockData,
      };
    },
  };
};

/**
 * Development Performance Monitor
 */
export const useDevPerformanceMonitor = () => {
  const startTime = performance.now();

  return {
    logLoadTime: (component: string) => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      // Performance logging disabled for cleaner console
    },

    logSkipped: (feature: string) => {
      // Skip logging disabled for cleaner console
    },

    getCurrentMode: () => DEV_MODE,

    getConfig: () => DEV_CONFIG,
  };
};

// Placeholder API functions (would be implemented elsewhere)
const getUserDataApi = async () => {
  throw new Error("Real getUserData API not implemented");
};

const getSiteDataApi = async () => {
  throw new Error("Real getSiteData API not implemented");
};

const getAnalyticsApi = async () => {
  throw new Error("Real getAnalytics API not implemented");
};

const getTemplatesApi = async () => {
  throw new Error("Real getTemplates API not implemented");
};

const callWixAPI = async (endpoint: string) => {
  throw new Error(`Real Wix API call to ${endpoint} not implemented`);
};
