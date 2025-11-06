import React, { useState, useEffect, useCallback } from "react";
import { Box } from "@wix/design-system";
import { useRecoilState, useRecoilValue } from "recoil";
import { editorState, wixSiteDataState } from "../../../services/state";
import { useStatusToast } from "../../../services/providers/StatusToastProvider";
import { WidgetBuilderBackgroundProps, WebsiteLoadStatus } from "./types";
import { WIDGET_KEY, PREVIEW_ACTIONS } from "../../../../constants";

/**
 * WidgetBuilderBackground Component
 *
 * Handles the background rendering logic for the widget builder including:
 * - Clean background (default gray)
 * - Website background (iframe with user's live site)
 * - Loading states and error handling
 * - Mobile/desktop view considerations
 * - iframe communication for widget hiding
 */
const WidgetBuilderBackground: React.FC<WidgetBuilderBackgroundProps> = ({
  children,
}) => {
  const [editorStateData, setEditorStateData] = useRecoilState(editorState);
  const wixSiteData = useRecoilValue(wixSiteDataState);
  const { addToast } = useStatusToast();

  // Website iframe state
  const [websiteIframeRef, setWebsiteIframeRef] =
    useState<HTMLIFrameElement | null>(null);
  const [websiteTimeoutRef, setWebsiteTimeoutRef] = useState<number | null>(
    null
  );

  // Update website load status in editor state
  const updateWebsiteLoadStatus = useCallback(
    (status: WebsiteLoadStatus) => {
      setEditorStateData((prev) => ({
        ...prev,
        websiteLoadStatus: status,
      }));
    },
    [setEditorStateData]
  );

  // Handle website iframe load success
  const handleWebsiteLoad = useCallback(() => {
    // Clear any existing timeout
    if (websiteTimeoutRef) {
      clearTimeout(websiteTimeoutRef);
      setWebsiteTimeoutRef(null);
    }
    updateWebsiteLoadStatus("loaded");
  }, [updateWebsiteLoadStatus, websiteTimeoutRef]);

  // Handle website iframe load error
  const handleWebsiteError = useCallback(() => {
    // Clear any existing timeout
    if (websiteTimeoutRef) {
      clearTimeout(websiteTimeoutRef);
      setWebsiteTimeoutRef(null);
    }

    // Auto-switch to clean background and update status atomically
    setEditorStateData((prev) => ({
      ...prev,
      backgroundMode: "clean" as const,
      desktopBackgroundMode: "clean" as const, // Also update desktop preference
      websiteLoadStatus: "failed" as const, // Update status atomically
    }));

    addToast({
      content:
        "Website background failed to load. Switched to clean background.",
      status: "warning",
    });
  }, [websiteTimeoutRef, addToast, setEditorStateData]);

  // Initialize website loading when component mounts or site URL changes
  useEffect(() => {
    // Only run website loading logic when we're in website mode, desktop view, and not already loaded
    if (
      editorStateData.backgroundMode === "website" &&
      editorStateData.viewType === "desktopView" &&
      editorStateData.websiteLoadStatus !== "loaded"
    ) {
      // Get the site URL - check if we have a valid URL
      const siteUrl = wixSiteData?.siteUrl;

      if (siteUrl && siteUrl !== "" && siteUrl !== "https://example.com") {
        updateWebsiteLoadStatus("loading");

        // Set a timeout to mark as failed if it takes too long
        const timeout = setTimeout(() => {
          // Auto-switch to clean background and update status atomically
          setEditorStateData((prev) => ({
            ...prev,
            backgroundMode: "clean" as const,
            desktopBackgroundMode: "clean" as const, // Also update desktop preference
            websiteLoadStatus: "failed" as const, // Update status atomically
          }));

          addToast({
            content:
              "Website background failed to load. Switched to clean background.",
            status: "warning",
          });
        }, 15000); // 15 seconds timeout

        setWebsiteTimeoutRef(timeout);

        return () => {
          clearTimeout(timeout);
          setWebsiteTimeoutRef(null);
        };
      } else {
        // No valid site URL available, mark as failed and switch to clean
        setEditorStateData((prev) => ({
          ...prev,
          backgroundMode: "clean" as const,
          desktopBackgroundMode: "clean" as const, // Also update desktop preference
          websiteLoadStatus: "failed" as const, // Update status atomically
        }));

        addToast({
          content:
            "Website background not available. Please publish your site first to use this feature.",
          status: "warning",
        });
      }
    } else {
      // When not in website mode or already loaded, ensure we don't show loading status
      if (editorStateData.websiteLoadStatus === "loading") {
        updateWebsiteLoadStatus("failed");
      }
    }
  }, [
    wixSiteData?.siteUrl,
    addToast,
    setEditorStateData,
    editorStateData.backgroundMode,
    editorStateData.viewType,
    editorStateData.desktopBackgroundMode,
    updateWebsiteLoadStatus,
  ]);

  // Force clean background in mobile view
  useEffect(() => {
    if (
      editorStateData.viewType === "mobileView" &&
      editorStateData.backgroundMode === "website"
    ) {
      setEditorStateData((prev) => ({
        ...prev,
        backgroundMode: "clean",
      }));
    }
  }, [
    editorStateData.viewType,
    editorStateData.backgroundMode,
    setEditorStateData,
  ]);

  // Send message to iframe to hide widgets when in preview mode
  useEffect(() => {
    const sendHideWidgetMessage = () => {
      if (
        websiteIframeRef?.contentWindow &&
        editorStateData.websiteLoadStatus === "loaded"
      ) {
        try {
          websiteIframeRef.contentWindow.postMessage(
            {
              action: PREVIEW_ACTIONS.HIDE,
              widgetKey: WIDGET_KEY,
              source: "widget-builder-preview",
            },
            "*"
          );
        } catch (error) {
          console.warn("Failed to send message to iframe:", error);
        }
      }
    };

    // Send message when iframe loads
    if (editorStateData.websiteLoadStatus === "loaded") {
      // Send message immediately
      sendHideWidgetMessage();

      // Send again after a delay to ensure widget scripts have loaded
      const delayedMessageTimeout = setTimeout(sendHideWidgetMessage, 1000);
      const secondDelayedMessageTimeout = setTimeout(
        sendHideWidgetMessage,
        3000
      );

      return () => {
        clearTimeout(delayedMessageTimeout);
        clearTimeout(secondDelayedMessageTimeout);

        // On cleanup (e.g., switching modes or unmounting), attempt to show widgets back
        try {
          websiteIframeRef?.contentWindow?.postMessage(
            {
              action: PREVIEW_ACTIONS.SHOW,
              widgetKey: WIDGET_KEY,
              source: "widget-builder-preview:cleanup",
            },
            "*"
          );
        } catch (_) {}
      };
    }
  }, [websiteIframeRef, editorStateData.websiteLoadStatus]);

  // Ensure widget is shown again when leaving website background or desktop view
  useEffect(() => {
    const isWebsiteActive =
      editorStateData.backgroundMode === "website" &&
      editorStateData.viewType === "desktopView" &&
      editorStateData.websiteLoadStatus === "loaded";

    if (!isWebsiteActive && websiteIframeRef?.contentWindow) {
      try {
        websiteIframeRef.contentWindow.postMessage(
          {
            action: PREVIEW_ACTIONS.SHOW,
            widgetKey: WIDGET_KEY,
            source: "widget-builder-preview:mode-change",
          },
          "*"
        );
      } catch (_) {}
    }
  }, [
    websiteIframeRef,
    editorStateData.backgroundMode,
    editorStateData.viewType,
    editorStateData.websiteLoadStatus,
  ]);

  // Belt-and-suspenders: on component unmount, try to SHOW the widget back regardless of status
  useEffect(() => {
    return () => {
      try {
        websiteIframeRef?.contentWindow?.postMessage(
          {
            action: PREVIEW_ACTIONS.SHOW,
            widgetKey: WIDGET_KEY,
            source: "widget-builder-preview:unmount",
          },
          "*"
        );
      } catch (_) {}
    };
  }, [websiteIframeRef]);

  // Determine if website background should be visible
  const isWebsiteBackgroundVisible =
    editorStateData.backgroundMode === "website" &&
    editorStateData.websiteLoadStatus === "loaded" &&
    editorStateData.viewType === "desktopView";

  // Determine if clean background should be visible (default)
  const isCleanBackgroundVisible =
    editorStateData.backgroundMode === "clean" ||
    editorStateData.viewType === "mobileView" ||
    editorStateData.websiteLoadStatus !== "loaded";

  return (
    <Box
      backgroundColor="D70"
      width="100%"
      position="relative"
      overflow="hidden"
    >
      {/* Website background iframe - only render in desktop view */}
      {editorStateData.viewType === "desktopView" && (
        <Box
          position="absolute"
          top={0}
          left={0}
          width="100%"
          height="100%"
          zIndex={1}
        >
          <iframe
            ref={setWebsiteIframeRef}
            src={wixSiteData?.siteUrl}
            width="100%"
            height="100%"
            style={{
              border: "none",
              // Show website background only when all conditions are met
              opacity: isWebsiteBackgroundVisible ? 1 : 0,
              pointerEvents: isWebsiteBackgroundVisible ? "auto" : "none",
              transition: "opacity 0.3s ease-in-out",
            }}
            onLoad={handleWebsiteLoad}
            onError={handleWebsiteError}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            referrerPolicy="no-referrer-when-downgrade"
            title="Website Background Preview"
          />

          {/* Soft inner shadows overlay */}
          <Box
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            style={{
              pointerEvents: "none",
              // Only show shadows when website is visible
              opacity: isWebsiteBackgroundVisible ? 1 : 0,
              transition: "opacity 0.3s ease-in-out",
              boxShadow: `
                inset 0 0 60px rgba(0, 0, 0, 0.04),
                inset 0 0 120px rgba(0, 0, 0, 0.02),
                inset 0 0 200px rgba(0, 0, 0, 0.01),
                inset 0 4px 20px rgba(0, 0, 0, 0.03),
                inset 4px 0 20px rgba(0, 0, 0, 0.03),
                inset -4px 0 20px rgba(0, 0, 0, 0.03),
                inset 0 -4px 20px rgba(0, 0, 0, 0.03)
              `,
            }}
            zIndex={2}
          />
        </Box>
      )}

      {/* Loading Indicator - show when in website mode, desktop view, and loading */}
      {/* Removed: Now handled in header instead */}

      {/* Failed Indicator - Removed since we auto-switch to clean background */}
      {/* When website fails, we automatically switch to clean mode, so no need for overlay */}

      {/* Clean Background Layer */}
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        style={{
          // Show clean background when website is not visible
          backgroundColor: isCleanBackgroundVisible ? "#f1f1f5" : "transparent", // D70 equivalent
          transition: "background-color 0.3s ease-in-out",
        }}
        zIndex={3} // Above the website iframe and shadows, below content
      />

      {/* Content Layer */}
      <Box
        position="relative"
        width="100%"
        height="100%"
        zIndex={4} // Above everything
      >
        {children}
      </Box>
    </Box>
  );
};

export default WidgetBuilderBackground;
