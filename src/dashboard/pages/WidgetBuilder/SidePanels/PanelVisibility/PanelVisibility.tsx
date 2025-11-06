import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Text,
  FormField,
  SidePanel,
  RadioGroup,
  InfoIcon,
  Collapse,
} from "@wix/design-system";

import { WidgetVisibilityData } from "../../../../../interfaces";
import { DEFAULT_PANEL_WIDTH } from "../SidePanelContainer";
import { useSitePages } from "../../../../hooks/useSitePages";
import { debugLogger } from "../../../../utils/debug-logger";
import PageSelector from "./PageSelector";

interface Props {
  options: WidgetVisibilityData;
  onChange: (options: WidgetVisibilityData) => void;
  onCloseButtonClick: () => void;
}

const PanelVisibility: React.FC<Props> = ({
  onCloseButtonClick,
  options,
  onChange,
}) => {
  // Follow the same pattern as other API hooks for status information
  const {
    data: pages = [],
    isLoading,
    error,
  } = useSitePages({
    enabled: true,
    onSuccess: () => {},
    onError: (err) => {
      debugLogger.error("panel-visibility", "Failed to load site pages", err);
    },
  });
  // Removed verbose component state / prop change logging

  const handleCloseSidePanel = () => {
    onCloseButtonClick();
  };

  const handleVisibilityOptionChange = (value: string | number | undefined) => {
    if (typeof value === "string") {
      const visibilityOption = value as "all-pages" | "special-pages";
      const newOptions = {
        ...options,
        visibilityOption,
        // Clear paths when switching to all pages
        visibilityPagePaths:
          visibilityOption === "all-pages" ? [] : options.visibilityPagePaths,
      };
      onChange(newOptions);
    }
  };

  const handlePagePathsChange = (paths: string[]) => {
    const newOptions = {
      ...options,
      visibilityPagePaths: paths,
    };
    onChange(newOptions);
  };

  return (
    <SidePanel
      closeButtonProps={{ onClick: handleCloseSidePanel }}
      width={DEFAULT_PANEL_WIDTH}
    >
      <SidePanel.Header
        title="Visibility settings"
        showDivider={true}
        subtitle="Control on which pages your widget will be displayed."
      />

      <SidePanel.Content noPadding>
        <SidePanel.Section title="Visibility Options" />

        <SidePanel.Field>
          <FormField
            label="Widget Display"
            infoContent="Choose where you want your widget to appear on your website."
          >
            <RadioGroup
              value={options.visibilityOption || "all-pages"}
              onChange={handleVisibilityOptionChange}
              size="small"
            >
              <RadioGroup.Radio value="all-pages">
                <Box direction="horizontal" verticalAlign="middle" gap={0.5}>
                  Display on all pages
                  <Box inline>
                    <InfoIcon
                      content="Widget will be displayed on all pages of your website"
                      size="small"
                    />
                  </Box>
                </Box>
              </RadioGroup.Radio>

              <RadioGroup.Radio value="special-pages">
                <Box direction="horizontal" verticalAlign="middle" gap={0.5}>
                  Display only on some page(s)
                  <Box inline>
                    <InfoIcon
                      content="Configure the widget to appear exclusively on selected pages, ensuring they're visible to the right audience."
                      size="small"
                    />
                  </Box>
                </Box>
              </RadioGroup.Radio>
            </RadioGroup>
          </FormField>
        </SidePanel.Field>

        <Collapse open={options.visibilityOption === "special-pages"}>
          <SidePanel.Field divider={false}>
            <PageSelector
              key={`page-selector-${
                options.visibilityPagePaths?.length || 0
              }-${JSON.stringify(options.visibilityPagePaths)}`}
              selectedPaths={options.visibilityPagePaths || []}
              onPathsChange={handlePagePathsChange}
            />
          </SidePanel.Field>
        </Collapse>
      </SidePanel.Content>
    </SidePanel>
  );
};

export default PanelVisibility;
