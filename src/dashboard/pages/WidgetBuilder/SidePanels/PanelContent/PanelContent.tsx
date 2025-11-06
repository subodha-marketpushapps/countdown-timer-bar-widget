import React, { useState, useEffect } from "react";
import { Layout, FormField, SidePanel, Input, Box, Text, ToggleSwitch } from "@wix/design-system";

import { WidgetContent } from "../../../../../interfaces";
import { renderSectionTitle } from "../utils";
import { DEFAULT_PANEL_WIDTH } from "../SidePanelContainer";

interface Props {
  options: WidgetContent;
  onChange: (options: WidgetContent) => void;
  onCloseButtonClick: () => void;
  previewControl?: any; // Preview control from parent
  onWelcomeMessagePreview?: () => void; // Welcome message preview callback
  forceWelcomeTab?: boolean; // Force opening welcome tab
}

const PanelContent: React.FC<Props> = ({
  onCloseButtonClick,
  options,
  onChange,
  previewControl,
  onWelcomeMessagePreview,
  forceWelcomeTab = false,
}) => {


  const handleCloseSidePanel = () => {
    onCloseButtonClick();
  };


  const [isEditingWelcomeMessage, setIsEditingWelcomeMessage] = useState(false);

  return (
    <SidePanel
      onCloseButtonClick={handleCloseSidePanel}
      width={DEFAULT_PANEL_WIDTH}
    >
      <SidePanel.Header title="Message" showDivider={true}></SidePanel.Header>

      <SidePanel.Content noPadding>
        <SidePanel.Section title={renderSectionTitle("Timer Mode", "Set the title and subtitle text that will appear inside your countdown bar.")}>
          <SidePanel.Field divider={false}>
            <FormField>
              <Box direction="vertical" gap="8px">
                <Text secondary size="small">Title</Text>
                <Layout cols={1} gap="12px">
                  <Input 
                    size="small" 
                    placeholder="Limited Time Offer"
                    value={options.title || ""}
                    onChange={(e) => onChange({ ...options, title: e.target.value })}
                  />
                </Layout>
              </Box>
            </FormField>
          </SidePanel.Field>
          <SidePanel.Field divider={false}>
            <FormField>
              <Box direction="vertical" gap="8px">
                <Text secondary size="small">Subtitle</Text>
                <Layout cols={1} gap="12px">
                  <Input 
                    size="small" 
                    placeholder="Up to 50% Off"
                    value={options.subtitle || ""}
                    onChange={(e) => onChange({ ...options, subtitle: e.target.value })}
                  />
                </Layout>
              </Box>
            </FormField>
          </SidePanel.Field>
        </SidePanel.Section>

        <SidePanel.Section title={renderSectionTitle("Button")}>
          <SidePanel.Field divider={false}>
            <FormField>
              <Box direction="horizontal" style={{ justifyContent: "space-between" }}>
                <Text secondary size="small">Show Button</Text>
                <ToggleSwitch 
                  size="small" 
                  checked={options.showButton ?? true}
                  onChange={(e) => onChange({ ...options, showButton: e.target.checked })}
                />
              </Box>
            </FormField>
          </SidePanel.Field>
          <SidePanel.Field divider={false}>
            <FormField>
              <Box direction="vertical" gap="8px">
                <Text secondary size="small">Button Text</Text>
                <Layout cols={1} gap="12px">
                  <Input 
                    size="small" 
                    placeholder="Shop Now"
                    value={options.buttonText || ""}
                    onChange={(e) => onChange({ ...options, buttonText: e.target.value })}
                  />
                </Layout>
              </Box>
            </FormField>
          </SidePanel.Field>
          <SidePanel.Field divider={false}>
            <FormField>
              <Box direction="vertical" gap="8px">
                <Text secondary size="small">Button Link</Text>
                <Layout cols={1} gap="12px">
                  <Input 
                    size="small" 
                    placeholder="https://example.com/shop"
                    value={options.buttonLink || ""}
                    onChange={(e) => onChange({ ...options, buttonLink: e.target.value })}
                  />
                </Layout>
              </Box>
            </FormField>
          </SidePanel.Field>

          <SidePanel.Field divider={false}>
            <Box direction="vertical" gap="8px">
              <FormField>
                <Box direction="horizontal" style={{ justifyContent: "space-between" }}>
                  <Text secondary size="small">Make the entire timer clickable</Text>
                  <ToggleSwitch 
                    size="small" 
                    checked={options.makeEntireTimerClickable ?? false}
                    onChange={(e) => onChange({ ...options, makeEntireTimerClickable: e.target.checked })}
                  />
                </Box>
              </FormField>
              <FormField>
                <Box direction="horizontal" style={{ justifyContent: "space-between" }}>
                  <Text secondary size="small">Open in New Tab</Text>
                  <ToggleSwitch 
                    size="small" 
                    checked={options.openInNewTab ?? true}
                    onChange={(e) => onChange({ ...options, openInNewTab: e.target.checked })}
                  />
                </Box>
              </FormField>
            </Box>
          </SidePanel.Field>
        </SidePanel.Section>

        <SidePanel.Section title={renderSectionTitle("Close Button")}>
          <SidePanel.Field divider={false}>
            <FormField>
              <Box direction="horizontal" style={{ justifyContent: "space-between" }}>
                <Text secondary size="small">Show Close Button</Text>
                <ToggleSwitch 
                  size="small" 
                  checked={options.showCloseButton ?? true}
                  onChange={(e) => onChange({ ...options, showCloseButton: e.target.checked })}
                />
              </Box>
            </FormField>
          </SidePanel.Field>
        </SidePanel.Section>
      </SidePanel.Content>

    </SidePanel>
  );
};

export default PanelContent;
