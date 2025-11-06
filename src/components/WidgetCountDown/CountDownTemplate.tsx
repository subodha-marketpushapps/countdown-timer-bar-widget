import React from "react";
import { Box, Button, Text, IconButton } from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import Clock, { ClockProps } from "./Clock";
import "./CountDownTemplate.css";

export interface CountdownBannerProps {
  clockConfig: ClockProps;
  title: string;
  subTitle: string;
  buttonText: string;
  buttonLink: string; // Redirect URL
  scale?: number; // Zoom scale (e.g., 0.8 for 80% size)
  backgroundColor?: string;
  textColor?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  backgroundImage?: string;
  borderRadius?: number;
  showCloseButton?: boolean;
  onClose?: () => void;
}

const CountDownTemplate: React.FC<CountdownBannerProps> = ({
  clockConfig,
  title,
  subTitle,
  buttonText,
  buttonLink,
  scale = 1,
  backgroundColor = "#ffffff",
  textColor = "#272727",
  buttonBackgroundColor,
  buttonTextColor,
  backgroundImage,
  borderRadius = 8,
  showCloseButton = false,
  onClose,
}) => {
  const handleButtonClick = () => {
    if (buttonLink) {
      window.open(buttonLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Box
      className="countdown-banner"
      direction="horizontal"
      padding={"16px"}
      style={{
        backgroundColor: backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: backgroundImage ? "cover" : undefined,
        backgroundPosition: backgroundImage ? "center" : undefined,
        backgroundRepeat: backgroundImage ? "no-repeat" : undefined,
        borderRadius: `${borderRadius}px`,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        gap: "20px",
        alignItems: "center",
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "center",
        position: "relative",
      }}
    >
      {/* Close Button */}
      {showCloseButton && onClose && (
        <IconButton
          size="tiny"
          priority="secondary"
          skin="light"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          style={{
            position: "absolute",
            top: "6px",
            right: "6px",
            zIndex: 100001,
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            color: "#272727",
          }}
        >
          <Icons.X />
        </IconButton>
      )}
      {/* Left Section: Title and Subtitle */}
      <Box
        direction="vertical"
        padding="0 10px"
        style={{
          flex: "1",
          minWidth: 0,
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {title && (
          <Text size="medium" weight="bold" style={{ fontSize: "16px", marginBottom: "4px", color: textColor }}>
            {title}
          </Text>
        )}
        {subTitle && (
          <Text size="small" secondary style={{ fontSize: "14px", color: textColor }}>
            {subTitle}
          </Text>
        )}
      </Box>

      {/* Middle Section: Clock */}
      <Box
        align="center"
        style={{
          flex: "1",
          padding: "0 10px",
        }}
      >
        <Clock {...clockConfig} />
      </Box>

      {/* Right Section: Button */}
      {buttonText && (
        <Box
          style={{
            flex: "1",
          }}
        >
          <Button
            onClick={handleButtonClick}
            priority="primary"
            size="medium"
            style={{
              backgroundColor: buttonBackgroundColor,
              color: buttonTextColor,
            }}
          >
            {buttonText}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CountDownTemplate;

