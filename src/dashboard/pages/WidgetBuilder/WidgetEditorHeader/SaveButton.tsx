import React, { useState, useEffect, useCallback } from "react";
import {
  TextButton,
  Text,
  Box,
  ToggleSwitch,
  FormField,
  Popover,
  Divider,
} from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import { useRecoilValue } from "recoil";
import { settingsState } from "../../../services/state";
// import { useSettings } from "../../../hooks/useSettings;
import { useStatusToast } from "../../../services/providers/StatusToastProvider";
import { debugLogger } from "../../../utils/debug-logger";
import classes from "./SaveButton.module.css";

interface SaveButtonProps {
  onSaveClick: () => void;
  isSaving?: boolean;
  saveType?: "manual" | "auto";
}

/**
 * SaveButton Component
 *
 * Displays a save button with animated progress bar and state indicators.
 * Supports both manual and automatic save operations with different visual feedback.
 * Includes autosave toggle functionality with a toggle switch.
 *
 * Features:
 * - Manual save: Shows checkmark icon when complete
 * - Auto save: Shows "Saved" text when complete
 * - Animated progress bar during saving
 * - Debounced autosave animation (triggers after user stops editing)
 * - Autosave toggle with ToggleSwitch component in FloatingHelper
 * - Self-contained autosave toggle functionality
 */
const SaveButton: React.FC<SaveButtonProps> = ({
  onSaveClick,
  isSaving = false,
  saveType = "auto",
}) => {
  const settings = useRecoilValue(settingsState);
  // const { updateSettings } = useSettings();
  const { addToast } = useStatusToast();

  const [buttonState, setButtonState] = useState<
    "idle" | "saving" | "savedManual" | "savedAuto"
  >("idle");
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [popoverShown, setPopoverShown] = useState(false);

  const handleSaveClick = useCallback(() => {
    setIsManualLoading(true); // Set temporary loading state
    setButtonState("saving");
    onSaveClick();
  }, [onSaveClick]);

  // const toggleAutosave = useCallback(async () => {
  //   const newAutoSaveState = !settings.isAutoSaveEnabled;

  //   debugLogger.info("SaveButton", "Toggling autosave", {
  //     from: settings.isAutoSaveEnabled,
  //     to: newAutoSaveState,
  //   });

  //   // try {
  //   //   await updateSettings.mutateAsync({
  //   //     isAutoSaveEnabled: newAutoSaveState,
  //   //   });

  //   //   addToast({
  //   //     content: `Autosave ${newAutoSaveState ? "enabled" : "disabled"}`,
  //   //     status: "info",
  //   //   });

  //   //   debugLogger.info("SaveButton", "Autosave toggled successfully", {
  //   //     newState: newAutoSaveState,
  //   //   });
  //   // } catch (error) {
  //   //   debugLogger.error("SaveButton", "Failed to toggle autosave", error);

  //   //   addToast({
  //   //     content: "Failed to toggle autosave setting",
  //   //     status: "error",
  //   //   });
  //   // }
  // }, [settings.isAutoSaveEnabled, updateSettings, addToast]);

  const openPopover = useCallback(() => {
    setPopoverShown(true);
  }, []);

  const closePopover = useCallback(() => {
    setPopoverShown(false);
  }, []);

  useEffect(() => {
    if (isSaving || isManualLoading) {
      setIsManualLoading(false); // Clear temporary loading state when saving starts
      if (buttonState === "idle") {
        setButtonState("saving");
      }
    } else if (buttonState === "saving") {
      handleFinishingState();
    }
  }, [isSaving, buttonState, isManualLoading, saveType]);

  const handleFinishingState = () => {
    if (saveType === "manual") {
      setButtonState("savedManual");
    } else {
      setButtonState("savedAuto");
    }
  };

  useEffect(() => {
    if (buttonState === "savedManual" || buttonState === "savedAuto") {
      const timer = setTimeout(() => {
        setButtonState("idle");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [buttonState, isSaving]);

  const getButtonContent = () => {
    switch (buttonState) {
      case "saving":
        return "Saving...";
      case "savedManual":
        return (
          <Box width={32} height={32} align="center" verticalAlign="middle">
            <Text skin="primary">
              <Icons.Check size="28" />
            </Text>
          </Box>
        );
      case "savedAuto":
        return "Saved";
      case "idle":
      default:
        return "Save";
    }
  };

  const getFloatingHelperContent = () => {
    const statusText = settings.isAutoSaveEnabled
      ? "Changes are automatically saved as you work."
      : "Changes are only saved when you click Save.";

    return (
      <Box padding={5} direction="vertical" gap={2}>
        <FormField label="Autosave" labelPlacement="left" labelSize="small">
          <ToggleSwitch
            checked={settings.isAutoSaveEnabled}
            onChange={() => {}}
            size="medium"
          />
        </FormField>
        <Divider />
        <Text size="small" secondary>
          {statusText}
        </Text>
      </Box>
    );
  };

  return (
    <Popover
      showArrow
      animate
      placement="bottom"
      shown={popoverShown}
      onMouseEnter={openPopover}
      onMouseLeave={closePopover}
      appendTo="window"
      width={240}
      showDelay={300}
    >
      <Popover.Element>
        <Box direction="vertical" align="center" gap={0} width="80px">
          <TextButton
            onClick={handleSaveClick}
            priority="secondary"
            skin="standard"
            disabled={buttonState !== "idle"}
          >
            {getButtonContent()}
          </TextButton>
          {buttonState === "saving" && (
            <Box
              transform="translateY(6px)"
              width="100%"
              height={2}
              backgroundColor="D60"
              borderRadius={3}
              overflow="hidden"
              position="relative"
            >
              <Box
                className={classes["progress-bar"]}
                height={2}
                position="absolute"
                left={0}
                top={0}
                backgroundColor="B10"
              />
            </Box>
          )}
        </Box>
      </Popover.Element>
      <Popover.Content>{getFloatingHelperContent()}</Popover.Content>
    </Popover>
  );
};

export default SaveButton;
