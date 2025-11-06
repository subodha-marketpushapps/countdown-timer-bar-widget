import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Box,
  Text,
  Image,
  Modal,
  CustomModalLayout,
  Loader,
  Button,
} from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import { useIntercom } from "react-use-intercom";
import imageUserFeedback from "../../../../assets/images/image_user-feedback.svg";
import imageWidgetPreview from "../../../../assets/images/image-widget-preview.png";
import classes from "./ModalFeedback.module.scss";
import { APP_ID, APP_NAME } from "../../../../constants";

/**
 * Defines the flow step for the modal feedback process
 * - 'default': Directly shows the feedback form
 * - 'ask-widget-setup': Shows widget setup confirmation first, then feedback form
 *
 * Extend this type as needed for project-specific flows.
 */
export type FlowStep = "default" | "ask-widget-setup";

/**
 * ModalFeedback Component
 *
 * A multi-step modal component that handles user feedback collection with configurable flows.
 * Supports both direct feedback and pre-feedback confirmation flows.
 *
 * Features:
 * - Direct feedback flow: Shows feedback form immediately
 * - Widget setup confirmation flow: Asks if widget is set up before showing feedback
 * - Embedded iframe for Wix App Market review submission
 * - Loading states and overlay interactions
 * - Accessibility support with keyboard navigation
 * - Intercom integration for setup support
 *
 * @example
 * // Direct feedback flow
 * <ModalFeedback
 *   isModalOpened={true}
 *   onModalClosed={() => setModalOpen(false)}
 *   onUserReviewed={() => handleReviewSubmission()}
 *   onFeedbackShown={() => markAsAsked()}
 * />
 *
 * @example
 * // Widget setup confirmation flow
 * <ModalFeedback
 *   isModalOpened={true}
 *   onModalClosed={() => setModalOpen(false)}
 *   onUserReviewed={() => handleReviewSubmission()}
 *   flowStep="ask-widget-setup"
 *   onFeedbackShown={() => markAsAsked()}
 * />
 */
const ModalFeedback: React.FC<{
  /** Callback fired when modal is closed */
  onModalClosed: () => void;
  /** Callback fired when user submits a review */
  onUserReviewed: () => void;
  /** Controls modal visibility */
  isModalOpened: boolean;
  /** Defines the flow step - defaults to 'default' if not provided */
  flowStep?: FlowStep;
  /** Callback fired when user actually sees the feedback content (to mark as "asked") */
  onFeedbackShown?: () => void;
}> = (props) => {
  // Intercom integration
  const { showNewMessage } = useIntercom();
  const openIntercomWithContent = useCallback(
    (message: string) => showNewMessage(message),
    [showNewMessage]
  );

  // State to track if user has clicked the "Post Review" button
  const [isUserClickPostBtn, setIsUserClickPostBtn] = useState(false);

  // State to track iframe loading status
  const [iframeLoading, setIframeLoading] = useState(true);

  // State to track if feedback content has been shown (to prevent multiple triggers)
  const [feedbackShown, setFeedbackShown] = useState(false);

  // State to control which content to show (question vs feedback form)
  // Defaults to true for 'default' flow, false for other flows like 'ask-widget-setup'
  const initialShowFeedback =
    props.flowStep === "ask-widget-setup" ? false : true;

  const [showFeedback, setShowFeedback] = useState(initialShowFeedback);

  // Update showFeedback when flowStep prop changes
  useEffect(() => {
    const newShowFeedback =
      props.flowStep === "ask-widget-setup" ? false : true;
    setShowFeedback(newShowFeedback);
  }, [props.flowStep]);

  // Track when feedback content is actually shown and trigger callback
  useEffect(() => {
    // Only trigger if:
    // 1. Modal is open
    // 2. We're showing feedback content
    // 3. We haven't already marked it as shown
    // 4. Callback is provided
    if (
      props.isModalOpened &&
      showFeedback &&
      !feedbackShown &&
      props.onFeedbackShown
    ) {
      setFeedbackShown(true);
      props.onFeedbackShown();
    }

    // Reset feedbackShown when modal closes
    if (!props.isModalOpened) {
      setFeedbackShown(false);
    }
  }, [props.isModalOpened, showFeedback, feedbackShown, props.onFeedbackShown]);

  const scrollableRef = useRef<HTMLDivElement | null>(null);

  /**
   * Callback ref to scroll to bottom when modal opens and ref is set
   * This ensures the iframe content is properly visible when loaded
   */
  const setScrollableRef = useCallback(
    (node: HTMLDivElement | null) => {
      scrollableRef.current = node;
      if (props.isModalOpened && node) {
        node.scrollTop = node.scrollHeight;
      }
    },
    [props.isModalOpened]
  );

  /**
   * Handles modal close request
   */
  const handleOnRequestClose = () => {
    props.onModalClosed();
  };

  /**
   * Handles when user clicks to mark review as submitted
   * This removes the overlay and triggers the onUserReviewed callback
   */
  const markAsReviewed = () => {
    setIsUserClickPostBtn(true);
    props.onUserReviewed();
  };

  /**
   * Handles when user indicates widget is not set up
   * Opens Intercom with a pre-filled message and closes the modal
   */
  const handleWidgetNotSetupStatus = () => {
    // Open Intercom with pre-filled message for setup help
    openIntercomWithContent("I couldn't setup my widget --> ");

    // Close the modal
    props.onModalClosed();
  };

  /**
   * Renders the main feedback content with iframe for Wix App Market review
   * Includes loading state, overlay for interaction tracking, and accessibility features
   */
  const renderFeedbackContent = () => {
    return (
      <CustomModalLayout
        onCloseButtonClick={handleOnRequestClose}
        removeContentPadding
        width="600px"
        content={
          <Box gap="8px" direction="vertical" flex={1}>
            <Box gap="24px" padding="32px 36px 12px 36px">
              <Box gap="12px" direction="vertical">
                <Box gap="24px">
                  <Box gap="6px" direction="vertical" flex={1}>
                    <Text size="medium">
                      We hope you've had a good experience with the app so far!
                      We would really appreciate it if you can add a review for{" "}
                      <Text weight="normal">{APP_NAME}</Text>.
                    </Text>
                    <Text size="medium">It helps immensely! ♥️</Text>
                  </Box>
                  <Image
                    width="120px"
                    height="120px"
                    src={imageUserFeedback}
                    transparent
                  />
                </Box>
              </Box>
            </Box>

            <div className={classes["frame-container"]} ref={setScrollableRef}>
              {/* Loading indicator shown while iframe is loading */}
              {iframeLoading && (
                <Box
                  position="absolute"
                  bottom="-77px"
                  left="0"
                  width="100%"
                  height={324}
                  align="center"
                  verticalAlign="middle"
                  direction="vertical"
                  gap={1}
                >
                  <Loader />
                </Box>
              )}

              {/* Wix App Market review iframe */}
              <iframe
                className={classes["feedback-iframe"]}
                src={`https://www.wix.com/app-market/add-review/${APP_ID}`}
                width="600px"
                height="572px"
                title="User Feedback Review"
                onLoad={() => {
                  // Delay hiding loader to ensure smooth transition
                  setTimeout(() => {
                    setIframeLoading(false);
                  }, 1000);
                }}
                style={iframeLoading ? { visibility: "hidden" } : {}}
              ></iframe>

              {/* Overlay button to track user interaction before they submit review */}
              {!isUserClickPostBtn && (
                <button
                  className={classes["overlay-container"]}
                  onClick={markAsReviewed}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      markAsReviewed();
                    }
                  }}
                  tabIndex={0}
                ></button>
              )}
            </div>
          </Box>
        }
      />
    );
  };

  /**
   * Renders the widget setup confirmation question
   * Used in 'ask-widget-setup' flow to confirm user has successfully set up the widget
   */
  const renderQuestionContent = () => {
    return (
      <Box gap="8px" direction="vertical" flex={1}>
        <Box gap="12px" direction="vertical" padding="32px 36px 28px 36px">
          <Box gap="4px" direction="vertical">
            <Text
              size="medium"
              weight="bold"
              className={classes["medium-hight"]}
            >
              Did you manage to set up the app?
            </Text>
            <Text size="medium">
              Please confirm that you saw the widget on your site and it works
              correctly!
            </Text>
          </Box>
          <Box gap="12px">
            {/* Yes button - proceeds to feedback form */}
            <Button
              prefixIcon={<Icons.Confirm />}
              onClick={() => {
                setShowFeedback(true);
              }}
            >
              Yes
            </Button>
            {/* No button - closes modal */}
            <Button priority="secondary" onClick={handleWidgetNotSetupStatus}>
              No
            </Button>
          </Box>
        </Box>
        {/* Widget preview image to help user identify if they've set up correctly */}
        <Image
          src={imageWidgetPreview}
          width="600px"
          height="400px"
          borderRadius={"0 0 8px 8px"}
        ></Image>
      </Box>
    );
  };

  /**
   * Renders the appropriate modal content based on the flow step
   *
   * Flow Logic:
   * - 'default' or undefined: Shows feedback content directly
   * - 'ask-widget-setup': Shows question first, then feedback after confirmation
   */
  const renderModalContent = () => {
    // For default flow or when flowStep is not provided, show feedback directly
    if (props.flowStep === "default" || !props.flowStep) {
      return renderFeedbackContent();
    }

    // For dynamic flows like 'ask-widget-setup'
    return (
      <CustomModalLayout
        onCloseButtonClick={handleOnRequestClose}
        removeContentPadding
        width="600px"
        content={
          <>
            {/* Show question content when showFeedback is false */}
            {!showFeedback && renderQuestionContent()}

            {/* Show feedback content only when showFeedback is true */}
            {showFeedback && renderFeedbackContent()}
          </>
        }
      />
    );
  };

  return (
    <Modal
      isOpen={props.isModalOpened}
      onRequestClose={handleOnRequestClose}
      shouldCloseOnOverlayClick={!showFeedback || isUserClickPostBtn}
      zIndex={9999999}
    >
      {renderModalContent()}
    </Modal>
  );
};

export default ModalFeedback;
