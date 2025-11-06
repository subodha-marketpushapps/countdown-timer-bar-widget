import React, { useCallback, useState, useEffect } from "react";
import {
  ComposerHeader,
  Button,
  Box,
  Divider,
  Badge,
  Tooltip,
  TextButton,
  PopoverMenu,
  IconButton,
  Loader,
  SegmentedToggle,
} from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  publishedWidgetState,
  draftWidgetState,
  editorState,
  wixSiteDataState,
} from "../../../services/state";
import { VIEW_TYPE, BACKGROUND_MODE } from "../../../../interfaces";
import SaveButton from "./SaveButton";
import UndoRedoControls from "./UndoRedoControls";
import { useStatusToast } from "../../../services/providers/StatusToastProvider";
import {
  ModalPreviewConfirmation,
  ModalDiscardConfirmation,
  ModalLeaveConfirmation,
  ModalUnpublishConfirmation,
} from "../Modals";
import { DEV_MODE } from "../../../../constants/dev-modes"; // Import DEV_MODE

interface WidgetEditorHeaderProps {
  onBackClicked: () => void;
  onPublish: () => void;
  onVisibilityChange: () => void; // Add unpublish handler
  onSave: () => void;
  onDiscard: () => void;
  isSaving: boolean;
  isPublishing: boolean;
  isDataLoaded: boolean;
}

/**
 * WidgetEditorHeader Component
 *
 * Main header for the widget editor with save/publish controls and state indicators.
 * Integrates with the debounced autosave system to show save animations for both
 * manual and automatic save operations.
 *
 * Features:
 * - Manual/Auto save button with animation
 * - Publish/Unpublish controls
 * - Draft state indicators (Hidden, Unpublished Changes)
 * - Desktop/Mobile view toggle
 * - Undo/Redo controls
 * - Preview functionality with modals
 */
const WidgetEditorHeader: React.FC<WidgetEditorHeaderProps> = ({
  onBackClicked,
  onPublish,
  onVisibilityChange,
  onSave,
  onDiscard,
  isSaving,
  isPublishing,
  isDataLoaded,
}) => {
  const [published] = useRecoilState(publishedWidgetState);
  const [draft, setDraft] = useRecoilState(draftWidgetState);
  const [editorStateData, setEditorStateData] = useRecoilState(editorState);
  const wixSiteData = useRecoilValue(wixSiteDataState);
  const { addToast } = useStatusToast();

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewModalType, setPreviewModalType] = useState<
    "notPublished" | "hidden" | "unpublishedChanges" | null
  >(null);
  const [pendingPreview, setPendingPreview] = useState(false);
  const [discardModalOpen, setDiscardModalOpen] = useState(false);
  const [pendingDiscard, setPendingDiscard] = useState(false);
  const [lastSaveType, setLastSaveType] = useState<"manual" | "auto">("auto");
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [pendingLeave, setPendingLeave] = useState(false);
  const [unpublishModalOpen, setUnpublishModalOpen] = useState(false);
  const [pendingUnpublish, setPendingUnpublish] = useState(false);

  // Detect autosave and update lastSaveType
  useEffect(() => {
    if (isSaving && !isPublishing && lastSaveType !== "manual") {
      setLastSaveType("auto");
    }
  }, [isSaving, isPublishing, lastSaveType]);

  const unpublishedChanges =
    JSON.stringify(published) !== JSON.stringify(draft);

  // Detect if there are unsaved changes (draft state changes not saved to backend yet)
  // In development mode with auto-save enabled, don't treat unpublished changes as "unsaved"
  // since they're automatically saved and the beforeunload warning is disabled anyway
  const hasUnsavedChanges =
    DEV_MODE === "full" ? isSaving || unpublishedChanges : isSaving; // In dev modes, only consider manual saving state

  // Handle back navigation with leave confirmation
  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setLeaveModalOpen(true);
    } else {
      onBackClicked();
    }
  };

  // Save & leave handler
  const handleSaveAndLeave = async () => {
    try {
      onSave();
      // Add a small delay to ensure save completes
      setTimeout(() => {
        handleLeaveWithoutSaving();
      }, 1000);
    } catch (error) {
      console.error("Save failed:", error);
      setPendingLeave(false);
    }
  };

  // Handle leave without saving
  const handleLeaveWithoutSaving = () => {
    setLeaveModalOpen(false);
    onBackClicked();
  };

  const handleDiscard = useCallback(() => {
    if (!unpublishedChanges) {
      addToast({ content: "No changes to discard.", status: "info" });
      return;
    }
    setDiscardModalOpen(true);
  }, [addToast, unpublishedChanges]);

  const handleConfirmDiscard = async () => {
    setPendingDiscard(true);
    try {
      // Replace draft with published
      // Use Recoil's setDraftWidgetState
      // But we only have the setter from useRecoilState, so:
      setDraft(published);
      setDiscardModalOpen(false);
      addToast({ content: "Draft changes discarded.", status: "info" });
    } finally {
      setPendingDiscard(false);
    }
  };

  const changeViewType = (value: string) => {
    const newViewType = value as VIEW_TYPE;

    setEditorStateData((prevState) => {
      let newBackgroundMode = prevState.backgroundMode;

      if (newViewType === "mobileView") {
        // When switching to mobile, always use clean background
        newBackgroundMode = "clean";
      } else if (newViewType === "desktopView") {
        // When switching back to desktop, restore the user's desktop preference
        newBackgroundMode = prevState.desktopBackgroundMode;
      }

      return {
        ...prevState,
        viewType: newViewType,
        backgroundMode: newBackgroundMode,
      };
    });
  };

  const changeBackgroundMode = (value: string) => {
    const newMode = value as BACKGROUND_MODE;

    // If switching to website mode but no valid site URL available, show error and prevent switch
    if (newMode === "website") {
      const siteUrl = wixSiteData?.siteUrl;
      if (!siteUrl || siteUrl === "" || siteUrl === "https://example.com") {
        addToast({
          content:
            "Website background not available. Please publish your site first to use this feature.",
          status: "warning",
        });
        return; // Prevent the switch
      }
    }

    // If switching to website mode but website failed to load, show error and prevent switch
    if (
      newMode === "website" &&
      editorStateData.websiteLoadStatus === "failed"
    ) {
      addToast({
        content:
          "Unable to load website background. Please check your site URL or try refreshing the page.",
        status: "error",
      });
      return; // Prevent the switch
    }

    // If switching to website mode but in mobile view, show info and prevent switch
    if (newMode === "website" && editorStateData.viewType === "mobileView") {
      addToast({
        content: "Website background is only available in desktop view",
        status: "info",
      });
      return; // Prevent the switch
    }

    setEditorStateData((prevState) => ({
      ...prevState,
      backgroundMode: newMode,
      // Also update the desktop preference so it's remembered when switching views
      desktopBackgroundMode: newMode,
    }));
  };

  // Helper to get the live site URL
  const getSiteUrl = () => {
    return wixSiteData.siteUrl || "";
  };

  // Open the live site in a new tab
  const openLiveSite = () => {
    const url = getSiteUrl();
    if (url) {
      window.open(url, "_blank");
    } else {
      addToast({ content: "Site URL not found.", status: "error" });
    }
  };

  // Preview button logic
  const handlePreviewClick = () => {
    if (!published.isVisible && !published.content) {
      // Not published at all
      setPreviewModalType("notPublished");
      setPreviewModalOpen(true);
      return;
    }
    if (!published.isVisible) {
      setPreviewModalType("hidden");
      setPreviewModalOpen(true);
      return;
    }
    if (unpublishedChanges) {
      setPreviewModalType("unpublishedChanges");
      setPreviewModalOpen(true);
      return;
    }
    // All good, open live site
    openLiveSite();
  };

  // Modal action handlers
  const handleModalPublish = async () => {
    setPendingPreview(true);
    try {
      await onPublish();
      setPreviewModalOpen(false);
      openLiveSite();
    } finally {
      setPendingPreview(false);
    }
  };

  const handleModalMakeVisible = async () => {
    setPendingPreview(true);
    try {
      await onVisibilityChange();
      setPreviewModalOpen(false);
      openLiveSite();
    } finally {
      setPendingPreview(false);
    }
  };

  const handleModalPreviewAnyway = () => {
    setPreviewModalOpen(false);
    openLiveSite();
  };

  const handleUnpublish = () => {
    setUnpublishModalOpen(true);
  };

  const handleConfirmUnpublish = async () => {
    setPendingUnpublish(true);
    try {
      await onVisibilityChange();
      setUnpublishModalOpen(false);
    } finally {
      setPendingUnpublish(false);
    }
  };

  // Wrap onSave to set save type for manual saves
  const handleManualSave = () => {
    setLastSaveType("manual");
    onSave();
  };

  // Add beforeunload event listener for browser close/refresh (disabled in dev mode)
  useEffect(() => {
    // Skip beforeunload warning in development modes
    if (DEV_MODE !== "full") {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  return (
    <>
      <ComposerHeader
        backButtonValue="Back to Overview"
        onBackClick={handleBackClick}
      >
        <ComposerHeader.Actions>
          <Box verticalAlign="middle">
            <SegmentedToggle
              selected={editorStateData.viewType}
              onClick={(_, value: string) => changeViewType(value)}
            >
              <SegmentedToggle.Icon value={"desktopView"} tooltipText="Desktop">
                <Icons.Desktop />
              </SegmentedToggle.Icon>
              <SegmentedToggle.Icon value={"mobileView"} tooltipText="Mobile">
                <Icons.Mobile />
              </SegmentedToggle.Icon>
            </SegmentedToggle>

            {/* Only show background toggle in desktop view */}
            {editorStateData.viewType === "desktopView" && (
              <>
                <Box height={24} align="center" marginLeft={4} marginRight={4}>
                  <Divider direction="vertical" />
                </Box>

                {/* Show loading indicator while website is loading */}
                {editorStateData.websiteLoadStatus === "loading" ? (
                  <Box
                    gap={2}
                    verticalAlign="middle"
                    paddingLeft={2}
                    paddingRight={2}
                  >
                    <Loader size="tiny" />
                    <span style={{ fontSize: "14px", color: "#7A8699" }}>
                      Loading background...
                    </span>
                  </Box>
                ) : (
                  /* Show background toggle only when website loaded or failed */
                  <SegmentedToggle
                    selected={editorStateData.backgroundMode}
                    onClick={(_, value: string) => changeBackgroundMode(value)}
                  >
                    <SegmentedToggle.Icon
                      value={"clean"}
                      tooltipText="Clean Background"
                    >
                      <Icons.CircleLarge />
                    </SegmentedToggle.Icon>
                    <SegmentedToggle.Icon
                      value={"website"}
                      tooltipText={
                        !wixSiteData?.siteUrl ||
                        wixSiteData.siteUrl === "" ||
                        wixSiteData.siteUrl === "https://example.com"
                          ? "Website Background (Publish your site first to use this feature)"
                          : editorStateData.websiteLoadStatus === "failed"
                          ? "Website Background (Failed to load)"
                          : "Website Background"
                      }
                    >
                      <Icons.Languages />
                    </SegmentedToggle.Icon>
                  </SegmentedToggle>
                )}
              </>
            )}
          </Box>
        </ComposerHeader.Actions>
        <ComposerHeader.Actions justifyContent="flex-end">
          {!published.isVisible && unpublishedChanges && (
            <Tooltip content="Widget is ready to publish. Publish to make it live on your site.">
              <Badge skin="warning">Unpublished</Badge>
            </Tooltip>
          )}
          {!published.isVisible && unpublishedChanges && (
            <Box height={24} align="center" marginLeft={4} marginRight={5}>
              <Divider direction="vertical" />
            </Box>
          )}
          {!published.isVisible && !unpublishedChanges && (
            <Tooltip content="Widget is hidden and will not appear on your live site. Publish to make it live on your site.">
              <Badge skin="warning">Hidden</Badge>
            </Tooltip>
          )}
          {!published.isVisible && !unpublishedChanges && (
            <Box height={24} align="center" marginLeft={4} marginRight={5}>
              <Divider direction="vertical" />
            </Box>
          )}
          {published.isVisible && unpublishedChanges && (
            <Tooltip content="Draft saved but not published. Publish to apply changes.">
              <Badge skin="neutral">Unpublished Changes</Badge>
            </Tooltip>
          )}
          {published.isVisible && unpublishedChanges && (
            <Box height={24} align="center" marginLeft={4} marginRight={5}>
              <Divider direction="vertical" />
            </Box>
          )}
          {isDataLoaded && <UndoRedoControls />}
          {isDataLoaded && (
            <Box height={24} align="center" marginLeft={4} marginRight={4}>
              <Divider direction="vertical" />
            </Box>
          )}
          {isDataLoaded && (
            <SaveButton
              onSaveClick={handleManualSave}
              isSaving={isSaving && !isPublishing}
              saveType={lastSaveType}
            />
          )}
        </ComposerHeader.Actions>
        <ComposerHeader.MainActions>
          <Box gap={4} verticalAlign="middle">
            <TextButton onClick={handlePreviewClick}>Preview</TextButton>
            <Box gap={3}>
              <Tooltip
                content="Make this widget live on your site."
                enterDelay={1000}
              >
                <Box width={112}>
                  <Button
                    onClick={onPublish}
                    priority="primary"
                    fullWidth
                    disabled={!isDataLoaded}
                  >
                    {isPublishing ? <Loader size="tiny" /> : "Publish"}
                  </Button>
                </Box>
              </Tooltip>
              <PopoverMenu
                textSize="medium"
                triggerElement={
                  <IconButton priority="secondary" size="medium">
                    <Icons.More />
                  </IconButton>
                }
                placement="bottom"
                appendTo="window"
                moveBy={{ x: -80, y: 0 }}
              >
                <PopoverMenu.MenuItem
                  prefixIcon={<Icons.DocExpire />}
                  text="Discard changes"
                  onClick={handleDiscard}
                  disabled={!isDataLoaded}
                />
                {published.isVisible && (
                  <PopoverMenu.MenuItem
                    prefixIcon={<Icons.Hidden />}
                    text="Unpublish"
                    onClick={handleUnpublish}
                    disabled={!isDataLoaded}
                  />
                )}
              </PopoverMenu>
            </Box>
          </Box>
        </ComposerHeader.MainActions>
      </ComposerHeader>
      <ModalPreviewConfirmation
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        type={
          previewModalType as "notPublished" | "hidden" | "unpublishedChanges"
        }
        isPublishing={pendingPreview}
        onPublish={handleModalPublish}
        onMakeVisible={handleModalMakeVisible}
        onPreviewAnyway={handleModalPreviewAnyway}
      />
      <ModalDiscardConfirmation
        isOpen={discardModalOpen}
        onClose={() => setDiscardModalOpen(false)}
        onDiscard={handleConfirmDiscard}
        isDiscarding={pendingDiscard}
      />
      <ModalLeaveConfirmation
        isModalOpened={leaveModalOpen}
        onModalClosed={() => setLeaveModalOpen(false)}
        onLeavePageClicked={handleLeaveWithoutSaving}
        onSaveAndLeave={handleSaveAndLeave}
        isSaving={pendingLeave}
        hasUnsavedChanges={hasUnsavedChanges}
      />
      <ModalUnpublishConfirmation
        isOpen={unpublishModalOpen}
        onClose={() => setUnpublishModalOpen(false)}
        onUnpublish={handleConfirmUnpublish}
        isUnpublishing={pendingUnpublish}
      />
    </>
  );
};

export default WidgetEditorHeader;
