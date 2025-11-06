import React from "react";
import { Box, Text, InfoIcon } from "@wix/design-system";

interface RenderSectionTitleProps {
  title: string;
  infoContent?: string;
}

/**
 * Renders a section title with optional info icon for SidePanel.Section components.
 * 
 * @param title - The title text to display
 * @param infoContent - Optional tooltip content for the info icon
 * @returns A React element that can be used as a title prop for SidePanel.Section
 * 
 * @example
 * ```tsx
 * <SidePanel.Section title={renderSectionTitle("My Section", "This is helpful info")}>
 *   ...
 * </SidePanel.Section>
 * ```
 */
export const renderSectionTitle = (
  title: string,
  infoContent?: string
): React.ReactElement => {
  return (
    <Box direction="horizontal" verticalAlign="middle" gap={0.5}>
      <Text size="small">{title}</Text>
      {infoContent && (
        <Box inline>
          <InfoIcon content={infoContent} size="small" />
        </Box>
      )}
    </Box>
  );
};

