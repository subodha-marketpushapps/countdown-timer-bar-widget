import React from "react";
import { Box, Button, Text } from "@wix/design-system";
import Clock, { ClockProps } from "./Clock";
import "./CountDownTemplate.css";

export interface CountdownBannerProps {
  clockConfig: ClockProps;
  title: string;
  subTitle: string;
  buttonText: string;
  buttonLink: string; // Redirect URL
  scale?: number; // Zoom scale (e.g., 0.8 for 80% size)
}

const CountDownTemplate: React.FC<CountdownBannerProps> = ({
  clockConfig,
  title,
  subTitle,
  buttonText,
  buttonLink,
  scale = 1,
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
      style={{
        padding: "16px 20px",
        width: "100%",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        gap: "20px",
        alignItems: "center",
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "center",
      }}
    >
      {/* Left Section: Title and Subtitle */}
      <Box
        direction="vertical"
        style={{
          flex: "1",
          minWidth: 0,
          alignItems: "flex-start",
        }}
      >
        {title && (
          <Text size="medium" weight="bold" style={{ fontSize: "16px", marginBottom: "4px" }}>
            {title}
          </Text>
        )}
        {subTitle && (
          <Text size="small" secondary style={{ fontSize: "14px" }}>
            {subTitle}
          </Text>
        )}
      </Box>

      {/* Middle Section: Clock */}
      <Box
        align="center"
        style={{
          flexShrink: 0,
          padding: "0 10px",
        }}
      >
        <Clock {...clockConfig} />
      </Box>

      {/* Right Section: Button */}
      {buttonText && (
        <Box
          style={{
            flexShrink: 0,
          }}
        >
          <Button
            onClick={handleButtonClick}
            priority="primary"
            size="medium"
          >
            {buttonText}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default CountDownTemplate;

