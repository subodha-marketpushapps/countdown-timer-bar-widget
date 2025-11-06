import { useState, useCallback, useEffect } from "react";
import { useIntercom } from "react-use-intercom";
import { useRecoilValue } from "recoil";
import LogRocket from "logrocket";
import { WixSiteData, Settings } from "../../interfaces";
import { useWixSiteData } from "./useWixSiteData";
import { useSettings } from "./useSettings";
import { _DEV, APP_NAME } from "../../constants";
import { debugLogger } from "../utils/debug-logger";
import { intercomAlignmentState } from "../services/state";

export type InitializationStep =
  | "loading-wix-data"
  | "updating-instance"
  | "loading-settings"
  | "initializing-analytics"
  | "completed"
  | "error";

interface InitializationError {
  step: InitializationStep;
  title: string;
  subtitle: string;
  retry?: () => void;
}

interface UseAppInitializationResult {
  // State
  currentStep: InitializationStep;
  error: InitializationError | null;
  isInitialized: boolean;
  initializationKey: number;

  // Data
  wixSiteData: WixSiteData | null;
  settings: Settings | null;

  // Actions
  retryInitialization: () => void;
  retryFromStep: (step: InitializationStep) => void;

  // Loading states
  isWixDataLoading: boolean;
  isSettingsLoading: boolean;
  isInstanceUpdating: boolean;
}

export const useAppInitialization = (): UseAppInitializationResult => {
  const { boot, update } = useIntercom();
  const intercomAlignment = useRecoilValue(intercomAlignmentState);

  // Local state
  const [currentStep, setCurrentStep] =
    useState<InitializationStep>("loading-wix-data");
  const [error, setError] = useState<InitializationError | null>(null);
  const [initializationKey, setInitializationKey] = useState(0);
  const [hasTriggeredInstanceUpdate, setHasTriggeredInstanceUpdate] =
    useState(false);
  const [hasInitializedAnalytics, setHasInitializedAnalytics] = useState(false);

  // Debug step changes
  useEffect(() => {
    debugLogger.info("initialization", `Step changed to: ${currentStep}`);
  }, [currentStep]);

  // Retry logic
  const retryFromStep = useCallback((step: InitializationStep) => {
    setError(null);
    setCurrentStep(step);

    // Reset guards when retrying
    if (step === "updating-instance") {
      setHasTriggeredInstanceUpdate(false);
    }
    if (step === "initializing-analytics") {
      setHasInitializedAnalytics(false);
    }
    if (step === "loading-wix-data") {
      setInitializationKey((prev) => prev + 1);
    }
  }, []);

  const retryInitialization = useCallback(() => {
    setError(null);
    setCurrentStep("loading-wix-data");
    setHasTriggeredInstanceUpdate(false);
    setHasInitializedAnalytics(false);
    setInitializationKey((prev) => prev + 1);
  }, []);

  // Error handlers
  const handleWixDataError = useCallback(
    (error: Error) => {
      setError({
        step: "loading-wix-data",
        title: "We couldn't sync with the Wix Site data",
        subtitle:
          "Looks like there was a technical issue on our end. Wait a few minutes and try again.",
        retry: () => retryFromStep("loading-wix-data"),
      });
      setCurrentStep("error");
    },
    [retryFromStep]
  );

  const handleWixDataSuccess = useCallback((data: WixSiteData) => {
    setCurrentStep("updating-instance");
  }, []);

  const handleInstanceUpdateSuccess = useCallback(() => {
    setHasTriggeredInstanceUpdate(true);
    setCurrentStep("loading-settings");
  }, []);

  const handleInstanceUpdateError = useCallback(
    (error: unknown) => {
      setError({
        step: "updating-instance",
        title: "We couldn't update your instance",
        subtitle:
          "Looks like there was a technical issue on our end. Wait a few minutes and try again.",
        retry: () => retryFromStep("updating-instance"),
      });
      setCurrentStep("error");
    },
    [retryFromStep]
  );

  const handleSettingsError = useCallback(
    (error: Error) => {
      setError({
        step: "loading-settings",
        title: "We couldn't load your settings",
        subtitle:
          "Looks like there was a technical issue on our end. Wait a few minutes and try again.",
        retry: () => retryFromStep("loading-settings"),
      });
      setCurrentStep("error");
    },
    [retryFromStep]
  );

  const handleSettingsSuccess = useCallback((data: Settings) => {
    debugLogger.info(
      "initialization",
      "Settings loaded successfully, moving to analytics"
    );
    setCurrentStep("initializing-analytics");
  }, []);

  // Step 1: Fetch Wix Site Data
  const {
    data: wixSiteData,
    isLoading: isWixDataLoading,
    error: wixDataError,
  } = useWixSiteData({
    initializationKey,
    enabled: currentStep === "loading-wix-data",
    onSuccess: handleWixDataSuccess,
    onError: handleWixDataError,
  });

  // Step 2: Update Instance
  const { updateInstance } = useSettings();
  const updateInstanceMutation = updateInstance({
    onSuccess: handleInstanceUpdateSuccess,
    onError: handleInstanceUpdateError,
  });

  // Step 3: Get Settings
  const {
    data: settings,
    isLoading: isSettingsLoading,
    error: settingsError,
  } = useSettings().getSettings({
    initializationKey,
    enabled: currentStep === "loading-settings",
    onSuccess: handleSettingsSuccess,
    onError: handleSettingsError,
  });

  // Step 4: Initialize Analytics
  const initializeAnalytics = useCallback(() => {
    if (hasInitializedAnalytics || !wixSiteData || !settings) return;

    try {
      debugLogger.info("analytics", "Initializing analytics", {
        wixSiteData: wixSiteData.instanceId,
        settings: settings.businessName,
      });

      if (_DEV) {
        debugLogger.info(
          "analytics",
          "Skipping analytics initialization in development mode"
        );
        setHasInitializedAnalytics(true);
        setCurrentStep("completed");
        return;
      }

      boot({
        name:
          wixSiteData.siteDisplayName ??
          settings.businessName ??
          `${APP_NAME}(Unknown user)`,
        email: settings.email || wixSiteData.email,
        alignment: intercomAlignment,
        verticalPadding: intercomAlignment == "left" ? 12 : 52,
        customAttributes: {
          app: APP_NAME,
          user_id: wixSiteData.instanceId,
          instance_id: wixSiteData.instanceId,
          business_name: settings.businessName ?? wixSiteData.siteDisplayName,
          website_url: wixSiteData.siteUrl,
          subscription_plan: wixSiteData.subscriptionPlan ?? "Basic",
        },
      });

      LogRocket.identify(wixSiteData.instanceId || "unknown", {
        name:
          wixSiteData.siteDisplayName ??
          settings.businessName ??
          "Unknown user",
        email: settings.email || wixSiteData.email || "unknown@email.com",
        instance_id: wixSiteData.instanceId ?? "unknown",
        business_name:
          settings.businessName ?? wixSiteData.siteDisplayName ?? "Unknown",
        website_url: wixSiteData.siteUrl ?? "unknown",
        subscription_plan: wixSiteData.subscriptionPlan ?? "Basic",
      });

      setHasInitializedAnalytics(true);
      setCurrentStep("completed");
      debugLogger.info("analytics", "Analytics initialization completed");
    } catch (error) {
      debugLogger.error("analytics", "Analytics initialization failed", error);
      setCurrentStep("completed");
    }
  }, [boot, wixSiteData, settings, hasInitializedAnalytics, intercomAlignment]);

  // Update Intercom alignment when it changes (after initialization)
  useEffect(() => {
    if (hasInitializedAnalytics && intercomAlignment) {
      update({
        alignment: intercomAlignment,
        verticalPadding: intercomAlignment == "left" ? 12 : 52,
      });
      debugLogger.info(
        "analytics",
        `Intercom alignment updated to: ${intercomAlignment}`
      );
    }
  }, [intercomAlignment, hasInitializedAnalytics, update]);

  // Handle instance update trigger
  useEffect(() => {
    if (
      currentStep === "updating-instance" &&
      wixSiteData?.instanceId &&
      !hasTriggeredInstanceUpdate &&
      !updateInstanceMutation.isPending
    ) {
      updateInstanceMutation.mutate(wixSiteData.instanceId);
    }
  }, [
    currentStep,
    wixSiteData?.instanceId,
    hasTriggeredInstanceUpdate,
    updateInstanceMutation,
  ]);

  // Handle analytics initialization
  useEffect(() => {
    if (currentStep === "initializing-analytics" && !hasInitializedAnalytics) {
      initializeAnalytics();
    }
  }, [currentStep, hasInitializedAnalytics, initializeAnalytics]);

  const isInitialized = currentStep === "completed";

  return {
    // State
    currentStep,
    error,
    isInitialized,
    initializationKey,

    // Data
    wixSiteData: wixSiteData ?? null,
    settings: settings ?? null,

    // Actions
    retryInitialization,
    retryFromStep,

    // Loading states
    isWixDataLoading,
    isSettingsLoading,
    isInstanceUpdating: updateInstanceMutation.isPending,
  };
};
