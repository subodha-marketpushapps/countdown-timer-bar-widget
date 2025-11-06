import React, { useState, useEffect, useCallback } from "react";
import {
  Layout,
  Cell,
  ComposerSidebar,
  Loader,
  Box,
  StatusToast,
  MobilePreviewWidget,
  Text,
} from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
// import WidgetController from "../../../components/WidgetWhatsappChat/WidgetController";
// import WidgetPreviewControlPanel from "../../components/dev/WidgetPreviewControlPanel";
import { useRecoilState, useRecoilValue } from "recoil";
import { editorState, wixSiteDataState } from "../../services/state";
import { useSmartWidgetStateManager } from "../../hooks/useSmartDevelopment";
import { useWidgetPreviewControl } from "../../hooks/useWidgetPreviewControl";
import { useBaseModal } from "../../services/providers/BaseModalProvider";
import { useStatusToast } from "../../services/providers/StatusToastProvider";
import {
  DEV_MODE,
  DEV_CONFIG,
  getCurrentDevMode,
} from "../../../constants/dev-modes";
import WidgetEditorHeader from "./WidgetEditorHeader";
import SidePanelContainer from "./SidePanels/SidePanelContainer";
import WidgetBuilderBackground from "./WidgetBuilderBackground";
import { ModalSuccessfullyPublished } from "./Modals";

import {
  PanelDesign,
  PanelContent,
  PanelTimer,
  PanelAppearance,
  PanelPosition,
  PanelVisibility,
} from "./SidePanels";
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
    updateAgents,
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

  const [editorStateData, setEditorStateData] = useRecoilState(editorState);
  const wixSiteData = useRecoilValue(wixSiteDataState);
  const { checkAndDisplayFeedbackModal } = useBaseModal();
  const { addToast } = useStatusToast();

  const [selectedSidebar, setSelectedSidebar] = useState<number>(
    showAgentPanelFirst ? 2 : 0 // Show Agents panel (index 2) for brand new users
  );
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const [forceWelcomeTab, setForceWelcomeTab] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [indicatorPreviewToken, setIndicatorPreviewToken] = useState(0); // Token for indicator preview control




  // sidebar items
  const sidebarItems = [
    { id: 0, label: "Timer", icon: <Icons.Timer /> },
    { id: 1, label: "Content", icon: <Icons.SiteContent /> },
    { id: 2, abel: "Appearance", icon: <Icons.Template /> },
    { id: 3, abel: "Position", icon: <Icons.Pin /> },
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

  const handleAgentsChange = useCallback(
    (agents: any) => {
      updateAgents(agents, { source: "agents-panel" });
    },
    [updateAgents]
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

  // Initialize widget preview control
  const previewControl = useWidgetPreviewControl(
    draftState.content,
    draftState.styles,
    handleContentChange
  );

  // Agent validation warnings (only in full mode)
  useEffect(() => {
    if (DEV_MODE !== "full") return; // Skip validation in dev modes

    const isMultiChat = draftState.content.mainBehavior === "multi-chat";
    const isOfflineAgentsShouldBeHidden =
      draftState.content.unavailableAgentBehavior === "hide";

    const agents = isMultiChat
      ? draftState.content.members
      : [draftState.content.members[0]];

    // const onlineAgents = agents.filter((agent: any) =>
    //   checkAgentAvailability(agent)
    // );
    const availableAgents = agents.filter((agent: any) => agent?.isVisible);

    // These warnings would be handled by the validation system
    // but we keep the UX logic here for now
  }, [draftState.content, selectedSidebar]);



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

  // Indicator preview handlers
  const handleIndicatorPreviewReset = useCallback(() => {
    // Reset preview control to show badge only briefly
    previewControl.closeModal();
    // After a brief moment, return to auto mode
    setTimeout(() => {
      previewControl.autoModal();
    }, 300);
  }, [previewControl]);

  const handleIndicatorSmartPreview = useCallback(() => {
    // Increment the token to trigger smart indicator preview
    setIndicatorPreviewToken((prev) => prev + 1);
  }, []);

  // Compute a key for WidgetController based on welcome popup settings and preview refresh
  const welcomePopupKey = [
    draftState.content.showWelcomePopup,
    draftState.content.welcomeMessage,
    draftState.content.welcomePopupDelay,
    draftState.content.welcomeContentType,
    previewRefreshKey,
  ].join("|");

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
          <Box gap="0" height="calc(100dvh - 66px)">
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
                  onBehaviorChange={(behavior) => {
                    // Auto-adjust preview based on behavior change
                    previewControl.simulateBehaviorChange(behavior);

                    // Show the modal briefly for single-chat and multi-chat, then revert to auto mode
                    if (
                      behavior === "single-chat" ||
                      behavior === "multi-chat"
                    ) {
                      setTimeout(() => {
                        // Open modal to show user the difference
                        previewControl.openModal();

                        // Then revert to auto mode after a brief moment so user can interact naturally
                        setTimeout(() => {
                          previewControl.autoModal();
                        }, 1000); // Show for 1 second, then back to auto
                      }, 50);
                    } else if (behavior === "direct") {
                      // For direct mode, just ensure modal is closed and stay in auto mode
                      setTimeout(() => {
                        previewControl.autoModal();
                      }, 50);
                    }
                  }}
                  onWelcomeMessagePreview={() => {
                    // Trigger a natural widget refresh to show welcome popup
                    setPreviewRefreshKey((k) => k + 1);
                  }}
                  onOpenWelcomeContent={() => {
                    // Open Content tab (index 1) and force welcome subtab
                    setForceWelcomeTab(true);
                    setSelectedSidebar(1);
                    // Reset force flag after a brief delay
                    setTimeout(() => setForceWelcomeTab(false), 100);
                  }}
                  onIndicatorPreviewReset={handleIndicatorPreviewReset}
                  onIndicatorSmartPreview={handleIndicatorSmartPreview}
                />
              )}
              {selectedSidebar === 1 && (
                <PanelContent
                  options={draftState.content}
                  onChange={handleContentChange}
                  onCloseButtonClick={() => setSelectedSidebar(-1)}
                  previewControl={previewControl}
                  onWelcomeMessagePreview={() => {
                    // Trigger a natural widget refresh to show welcome popup
                    setPreviewRefreshKey((k) => k + 1);
                  }}
                  forceWelcomeTab={forceWelcomeTab}
                />
              )}
              {selectedSidebar === 2 && (
                <PanelAppearance
                  options={draftState.content}
                  onChange={handleStylesChange}
                  onCloseButtonClick={() => setSelectedSidebar(-1)}
                  previewControl={previewControl}
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

            <WidgetBuilderBackground>
              {/* Development Mode Indicator */}
              {DEV_MODE !== "full" && (
                <Box
                  position="absolute"
                  top="16px"
                  left="16px"
                  zIndex={10}
                  backgroundColor="Y30"
                  padding="8px 12px"
                  borderRadius="4px"
                  border="1px solid #FFA726"
                >
                  <Text size="small" weight="bold">
                    🚀 DEV MODE: {getCurrentDevMode().toUpperCase()}
                  </Text>
                </Box>
              )}

              {/* Preview Control Panel - Only show in dev mode */}
              {!isLoading && DEV_CONFIG.ui.showPreviewControls && (
                <Box
                  position="absolute"
                  top="60px"
                  left="16px"
                  zIndex={10}
                  maxWidth="320px"
                >
                  <h2>WidgetPreviewControlPanel</h2>
                  {/* <WidgetPreviewControlPanel
                    previewControl={previewControl}
                    agents={draftState.content.members}
                    currentBehavior={draftState.content.mainBehavior}
                  /> */}
                </Box>
              )}

              {/* Mobile Preview */}
              {editorStateData.viewType === "mobileView" && (
                <MobilePreviewWidget skin="gradient">
                  <Box
                    align="center"
                    verticalAlign="middle"
                    height="100%"
                    backgroundColor="transparent" // Let background component handle color
                    position="relative"
                    zIndex={2}
                  >
                    {/* <WidgetController
                      key={welcomePopupKey}
                      styles={draftState.styles}
                      widgetContent={draftState.content}
                      isDevMode={true}
                      manualMobile={true}
                      forceModalState={previewControl.state.forceModalOpen}
                      forceSelectedAgent={previewControl.state.forceSelectedAgent}
                      previewMode={previewControl.state.previewMode}
                      forceStep={previewControl.state.forceStep}
                      previewAgent={previewControl.state.previewAgent}
                      indicatorSmartPreviewToken={indicatorPreviewToken}
                      onStateChange={(state) => { }}
                    /> */}
                  </Box>
                </MobilePreviewWidget>
              )}

              {/* Desktop Preview */}
              {editorStateData.viewType === "desktopView" && (
                <Box
                align="center"
                verticalAlign="middle"
                height="100%"
                backgroundColor="transparent" // Let background component handle color
                position="relative"
                zIndex={2}
              >
                <h1>Hello World</h1>
                </Box>
                // <WidgetController
                //   key={welcomePopupKey}
                //   styles={draftState.styles}
                //   widgetContent={draftState.content}
                //   isDevMode={true}
                //   manualMobile={false}
                //   forceModalState={previewControl.state.forceModalOpen}
                //   forceSelectedAgent={previewControl.state.forceSelectedAgent}
                //   previewMode={previewControl.state.previewMode}
                //   forceStep={previewControl.state.forceStep}
                //   previewAgent={previewControl.state.previewAgent}
                //   indicatorSmartPreviewToken={indicatorPreviewToken}
                //   onStateChange={(state) => { }}
                // />
              )}
            </WidgetBuilderBackground>
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
