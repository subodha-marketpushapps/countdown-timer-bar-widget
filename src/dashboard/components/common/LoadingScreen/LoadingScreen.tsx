import React from "react";
import { Modal, Box, Text, Image } from "@wix/design-system";
import "@wix/design-system/styles.global.css";
import { LoadingScreenProps } from "./types";
import { ProgressBar } from "./ProgressBar";
import { ImageSlider } from "./ImageSlider";
import { useLoadingSteps } from "./hooks";
import { FEATURE_SLIDES } from "../../../../constants";
import "./LoadingScreen.css";
import inline_logo from "../../../../assets/mkp-logo.svg";

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isOpen,
  onRequestClose,
  showCloseButton = false,
  currentStep = 1,
  totalSteps = 4,
}) => {
  const { loadingSteps, getCurrentStepInfo, calculateProgressPercentage } =
    useLoadingSteps();

  const handleRequestClose = () => {
    if (showCloseButton && onRequestClose) {
      onRequestClose();
    }
    // If showCloseButton is false, don't allow closing
  };

  const progressPercentage = calculateProgressPercentage(
    currentStep,
    totalSteps
  );
  const currentStepInfo = getCurrentStepInfo(currentStep);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleRequestClose}
      screen="full"
      shouldCloseOnOverlayClick={showCloseButton}
    >
      <Box
        height="100dvh"
        width="100dvw"
        display="grid"
        gridTemplateColumns="5fr 6fr"
        gap={0}
      >
        {/* Left Side - Progress */}
        <Box
          height="100dvh"
          backgroundColor="D80"
          padding={6}
          display="flex"
          direction="vertical"
          align="center"
          verticalAlign="middle"
          gap={4}
          className="loading-screen-left"
        >
          <div className="loading-screen-progress-section">
            <Box
              direction="vertical"
              gap={4}
              align="center"
              verticalAlign="middle"
            >
              <Image
                src={inline_logo}
                alt={"MarketPush Apps Inline Logo"}
                width={"180px"}
                height={"auto"}
                className="mkp-logo"
                transparent={true}
                borderRadius={0}
              />
              <ProgressBar progressPercentage={progressPercentage} />
              <Box
                style={{
                  letterSpacing: "6px",
                }}
              >
                <Text size="tiny" secondary>
                  LOADING
                </Text>
              </Box>
            </Box>
          </div>
        </Box>

        {/* Right Side - Feature Preview */}
        <Box
          height="100dvh"
          backgroundColor="#14171D"
          padding={6}
          display="flex"
          direction="vertical"
          align="center"
          verticalAlign="middle"
          gap={4}
          className="loading-screen-right"
        >
          {/* Image Slider */}
          <ImageSlider slides={FEATURE_SLIDES} />
        </Box>
      </Box>
    </Modal>
  );
};

export default LoadingScreen;
