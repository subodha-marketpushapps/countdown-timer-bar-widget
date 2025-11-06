import { useCallback } from "react";
import { useRecoilState } from "recoil";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { settingsState, intercomAlignmentState } from "../services/state";
import { updateSettings } from "../services/api/settings";
import { Settings } from "../../interfaces";

export const useAppNavigation = () => {
  const [settings, setSettings] = useRecoilState(settingsState);
  const [, setIntercomAlignment] = useRecoilState(intercomAlignmentState);
  const queryClient = useQueryClient();

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Partial<Settings>) => updateSettings(data),
    onSuccess: (data) => {
      setSettings(data as Settings);
      queryClient.setQueryData(["settings"], data);
    },
  });

  const navigateToWidgetBuilderFromOnboarding =
    useCallback(async (): Promise<void> => {
      // Move Intercom to left when entering Widget Builder
      setIntercomAlignment("left");

      await updateSettingsMutation.mutateAsync({
        installPopupShow: true,
      });
    }, [updateSettingsMutation, setIntercomAlignment]);

  const navigateToWidgetBuilderFromOverview =
    useCallback(async (): Promise<void> => {
      // Move Intercom to left when entering Widget Builder
      setIntercomAlignment("left");

      // No need to change installPopupShow - user is already existing
      // This is just UI navigation, not state change
    }, [setIntercomAlignment]);

  const navigateToOnboarding = useCallback(async (): Promise<void> => {
    // Reset Intercom to right when leaving Widget Builder
    setIntercomAlignment("right");

    await updateSettingsMutation.mutateAsync({
      installPopupShow: false,
    });
  }, [updateSettingsMutation, setIntercomAlignment]);

  const navigateToOverview = useCallback(async (): Promise<void> => {
    // Reset Intercom to right when leaving Widget Builder
    setIntercomAlignment("right");

    // No need to change installPopupShow - just UI navigation
    // User state should already be correct
  }, [setIntercomAlignment]);

  return {
    navigateToWidgetBuilderFromOnboarding,
    navigateToWidgetBuilderFromOverview,
    navigateToOnboarding,
    navigateToOverview,
    isNavigating: updateSettingsMutation.isPending,
    currentView: settings?.installPopupShow ? "overview" : "onboarding",
  };
};
