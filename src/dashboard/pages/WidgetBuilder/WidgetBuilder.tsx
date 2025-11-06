import React, { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Cell,
  ComposerSidebar,
  Loader,
  Box,
  StatusToast,
  Text,
  IconButton,
} from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
// import WidgetController from "../../../components/WidgetWhatsappChat/WidgetController";
// import WidgetPreviewControlPanel from "../../components/dev/WidgetPreviewControlPanel";
import { useRecoilValue } from "recoil";
import { wixSiteDataState } from "../../services/state";
import { useSmartWidgetStateManager } from "../../hooks/useSmartDevelopment";
import { useBaseModal } from "../../services/providers/BaseModalProvider";
import { useStatusToast } from "../../services/providers/StatusToastProvider";
import {
  DEV_MODE,
  getCurrentDevMode,
} from "../../../constants/dev-modes";
import WidgetEditorHeader from "./WidgetEditorHeader";
import SidePanelContainer from "./SidePanels/SidePanelContainer";
import { ModalSuccessfullyPublished } from "./Modals";

import {
  PanelDesign,
  PanelContent,
  PanelTimer,
  PanelAppearance,
  PanelPosition,
  PanelVisibility,
} from "./SidePanels";
import CountDownTemplate from "../../../components/WidgetCountDown/CountDownTemplate";
// import { checkAgentAvailability } from "../../../components/WidgetWhatsappChat/utils";

const Builder: React.FC<{
  onBackClicked: () => void;
  showAgentPanelFirst?: boolean; // For brand new users
}> = ({ onBackClicked, showAgentPanelFirst = false }) => {
  // Enhanced state management with smart development mode
  const {
    draftState,
    publishedState,
    updateDraft,
    updateStyles,
    updateContent,
    save,
    publish,
    unpublish,
    discard,
    hasUnpublishedChanges,
    isSaving,
    isPublishing,
    isLoading,
    validationErrors,
    validationWarnings,
  } = useSmartWidgetStateManager({
    autoSave: DEV_MODE === "full" || DEV_MODE === "widget-builder", // Enable auto-save in widget-builder mode
    autoSaveDelay: DEV_MODE === "widget-only" ? 1000 : 5000, // Faster saves in widget-only mode
    enableValidation: DEV_MODE === "full",
    enableOptimisticUpdates: true,
  });

  const wixSiteData = useRecoilValue(wixSiteDataState);
  const { checkAndDisplayFeedbackModal } = useBaseModal();
  const { addToast } = useStatusToast();

  const [selectedSidebar, setSelectedSidebar] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isWidgetClosed, setIsWidgetClosed] = useState(false);




  // sidebar items
  const sidebarItems = [
    { id: 0, label: "Timer", icon: <Icons.Timer /> },
    { id: 1, label: "Content", icon: <Icons.SiteContent /> },
    { id: 2, label: "Appearance", icon: <Icons.Template /> },
    { id: 3, label: "Position", icon: <Icons.Pin /> },
  ];

  // Handler functions using the new state manager
  const handleStylesChange = useCallback(
    (styles: any) => {
      updateStyles(styles, { source: "styles-panel" });
    },
    [updateStyles]
  );

  const handleContentChange = useCallback(
    (content: any) => {
      updateContent(content, { source: "content-panel" });
    },
    [updateContent]
  );


  const handleVisibilityDataChange = useCallback(
    (visibilityData: any) => {
      // Ensure page paths are deduped & normalized BEFORE updating state manager to avoid merge duplication
      const cleanedVisibilityData = visibilityData
        ? {
          ...visibilityData,
          visibilityPagePaths: Array.isArray(visibilityData.visibilityPagePaths)
            ? [...new Set(
              visibilityData.visibilityPagePaths
                .filter((p: string) => p && p.trim())
                .map((p: string) => (p.startsWith('/') ? p.trim() : `/${p.trim()}`))
            )]
            : [],
        }
        : { visibilityOption: 'all-pages', visibilityPagePaths: [] };



      updateDraft({ visibilityData: cleanedVisibilityData }, { source: "visibility-panel" });
    },
    [updateDraft]
  );


  // Validation warnings (only in full mode)
  useEffect(() => {
    if (DEV_MODE !== "full") return; // Skip validation in dev modes

    // Add countdown widget validation logic here if needed
    // For example: validate timer dates, check if timer has ended, etc.
  }, [draftState.content, selectedSidebar]);

  // Reset widget closed state when content or styles change
  useEffect(() => {
    setIsWidgetClosed(false);
  }, [draftState.content, draftState.styles]);



  const handleSave = useCallback(async () => {
    await save();
  }, [save]);

  const handlePublish = useCallback(async () => {
    try {
      await publish();
      // Show success modal after successful publish
      setShowSuccessModal(true);
    } catch (error) {
      // Error handling would be managed by the state manager
      console.error("Publish failed:", error);
    }
  }, [publish]);

  const handleDiscard = useCallback(() => {
    discard();
  }, [discard]);

  const handleVisibilityChange = useCallback(async () => {
    // Direct toggle of widget visibility on live site
    // This immediately updates the published state without affecting draft editing
    if (publishedState.isVisible) {
      await unpublish(); // Hide widget on live site
    } else {
      await publish(); // Show widget on live site (publishes current draft)
    }
  }, [publishedState.isVisible, publish, unpublish]);

  // Helper to get site URL
  const getSiteUrl = useCallback(() => {
    return wixSiteData?.siteUrl || "";
  }, [wixSiteData]);

  // Handle success modal actions
  const handleSuccessModalPreview = useCallback(() => {
    const url = getSiteUrl();
    if (url) {
      // Open the live site in a new tab
      const newWindow = window.open(url, "_blank");

      // Check if popup was blocked
      if (
        !newWindow ||
        newWindow.closed ||
        typeof newWindow.closed === "undefined"
      ) {
        // Fallback: try to navigate in same tab if popup blocked
        window.location.href = url;
      } else {
        // Successfully opened in new tab
        // Trigger feedback modal after they've seen their widget live
        checkAndDisplayFeedbackModal(2000, "ask-widget-setup");
      }
    } else {
      // Handle case where site URL is not available
      addToast({
        content: "Site URL not found. Please check your site settings.",
        status: "error",
      });
    }
    setShowSuccessModal(false);
  }, [getSiteUrl, checkAndDisplayFeedbackModal]);

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
  }, []);



  return (
    <Layout gap={0}>
      <Cell>
        <WidgetEditorHeader
          onBackClicked={onBackClicked}
          onPublish={handlePublish}
          onSave={handleSave}
          onDiscard={handleDiscard}
          isSaving={isSaving}
          isPublishing={isPublishing}
          isDataLoaded={!isLoading}
          onVisibilityChange={handleVisibilityChange}
        />
      </Cell>
      <Cell>
        {isLoading ? (
          <Box
            align="center"
            verticalAlign="middle"
            height="calc(100dvh - 100px)"
            width="100vw"
          >
            <Loader text="Loading Widget Data..." size="large" />
          </Box>
        ) : (
          <Box gap="0" height="calc(100dvh - 66px)" direction="horizontal">
            <ComposerSidebar
              labelPlacement="bottom"
              items={sidebarItems}
              selectedId={selectedSidebar}
              // @ts-ignore
              onClick={(_, data) => setSelectedSidebar(Number(data.id))}
              zIndex={100000000}
            />
            <SidePanelContainer isShowing={selectedSidebar !== -1}>
              {selectedSidebar === 0 && (
                <PanelTimer
                  options={draftState.content}
                  onChange={handleContentChange}
                  onCloseButtonClick={() => setSelectedSidebar(-1)}
                />
              )}
              {selectedSidebar === 1 && (
                <PanelContent
                  options={draftState.content}
                  onChange={handleContentChange}
                  onCloseButtonClick={() => setSelectedSidebar(-1)}
                />
              )}
              {selectedSidebar === 2 && (
                <PanelAppearance
                  options={draftState.content}
                  onChange={handleContentChange}
                  onCloseButtonClick={() => setSelectedSidebar(-1)}
                />
              )}
              {selectedSidebar === 3 && (
                <PanelPosition
                  options={draftState.styles}
                  onChange={handleStylesChange}
                  onCloseButtonClick={() => setSelectedSidebar(-1)}
                />
              )}
            </SidePanelContainer>

            {/* Preview Area - White Background Box on the Right */}
            <Box
              flex="1"
              height="100%"
              backgroundColor="#ffffff"
              position="relative"
              style={{
                overflow: "auto",
              }}
            >
              {/* Countdown Widget Preview */}
              {!isLoading && draftState.content && draftState.styles && !isWidgetClosed && (
                <Box
                  width="100%"
                  height="100%"
                  position="relative"
                  style={{
                    padding:
                      draftState.styles.L_Widget_Position === "static_top"
                        ? `${draftState.styles.L_Widget_Position_Desktop?.top || 0}px 20px 20px 20px`
                        : draftState.styles.L_Widget_Position === "floating_top"
                        ? `${draftState.styles.L_Widget_Position_Desktop?.top || 0}px 20px 20px 20px`
                        : draftState.styles.L_Widget_Position === "floating_bottom"
                        ? `20px 20px ${draftState.styles.L_Widget_Position_Desktop?.bottom || 0}px 20px`
                        : draftState.styles.L_Widget_Position === "centered_overlay"
                        ? "20px"
                        : "20px",
                    display:
                      draftState.styles.L_Widget_Position === "centered_overlay"
                        ? "flex"
                        : "block",
                    alignItems:
                      draftState.styles.L_Widget_Position === "centered_overlay"
                        ? "center"
                        : "flex-start",
                    justifyContent:
                      draftState.styles.L_Widget_Position === "centered_overlay"
                        ? "center"
                        : "flex-start",
                    minHeight: "100%",
                  }}
                >
                  {/* Overlay Background for Centered Overlay */}
                  {draftState.styles.L_Widget_Position === "centered_overlay" && (
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      width="100%"
                      height="100%"
                      padding="20px"
                      style={{
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                        zIndex: 1,
                      }}
                    />
                  )}

                  {/* Widget Container */}

                    {/* Card Container */}
                    <Box
                      backgroundColor="#ffffff"
                      margin={"24px"}
                      height="100%"
                      padding="24px"

                      style={{
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        position: "relative",
                      }}
                    >
                      <div>
                      <CountDownTemplate
                        clockConfig={{
                          labelPosition:
                            draftState.styles.D_Clock_LabelPosition || "bottom",
                          numberStyle:
                            draftState.styles.D_Clock_NumberStyle || "fillEachDigit",
                          endDate:
                            draftState.content.timerConfig?.endDate ||
                            new Date("2025-12-31"),
                          endTime:
                            draftState.content.timerConfig?.endTime || "23:59:59",
                          backgroundColor:
                            draftState.styles.D_Clock_BackgroundColor || "#2563eb",
                          textColor:
                            draftState.styles.D_Clock_TextColor || "#ffffff",
                        }}
                        title={draftState.content.title || "Limited Time Offer"}
                        subTitle={draftState.content.subtitle || "Up to 50% Off"}
                        buttonText={
                          draftState.content.showButton
                            ? draftState.content.buttonText || "Shop Now"
                            : ""
                        }
                        buttonLink={draftState.content.buttonLink || ""}
                        backgroundColor={draftState.styles.D_Widget_BackgroundColor}
                        textColor={draftState.styles.D_Widget_TextColor}
                        buttonBackgroundColor={draftState.styles.D_Widget_ButtonBackgroundColor}
                        buttonTextColor={draftState.styles.D_Widget_ButtonTextColor}
                        backgroundImage={draftState.styles.D_Widget_BackgroundImage}
                        borderRadius={draftState.styles.L_Widget_CornerRounding}
                        showCloseButton={draftState.content.showCloseButton}
                        onClose={() => setIsWidgetClosed(true)}
                      />
                      </div>
                    </Box>

                </Box>
              )}
            </Box>
          </Box>
        )}
      </Cell>

      {/* Success Modal */}
      <ModalSuccessfullyPublished
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        onPreview={handleSuccessModalPreview}
        siteUrl={getSiteUrl()}
      />
    </Layout>
  );
};

export default Builder;
