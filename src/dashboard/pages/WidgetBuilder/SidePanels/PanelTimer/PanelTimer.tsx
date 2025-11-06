import React from "react";
import {
  Box,
  Text,
  FormField,
  SidePanel,
  Thumbnail,
  Layout,
  ToggleSwitch,
  RadioGroup,
  Collapse,
  TextButton,
  SegmentedToggle,
  Dropdown,
  DatePicker,
  TimeInput,
  Checkbox,
  Input
} from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";

import { WidgetContent } from "../../../../../interfaces";
import { DEFAULT_PANEL_WIDTH } from "../SidePanelContainer";
import { renderSectionTitle } from "../utils";

interface Props {
  options: WidgetContent;
  onChange: (options: WidgetContent) => void;
  onCloseButtonClick: () => void;
  onBehaviorChange?: (
    behavior: "direct" | "single-chat" | "multi-chat"
  ) => void;
  onWelcomeMessagePreview?: () => void;
  onOpenWelcomeContent?: () => void; // Callback to open Content tab → Welcome subtab
  onIndicatorPreviewReset?: () => void;
  onIndicatorSmartPreview?: () => void;
}

const PanelGeneral: React.FC<Props> = ({
  onCloseButtonClick,
  options,
  onChange,
  onBehaviorChange,
  onWelcomeMessagePreview,
  onOpenWelcomeContent,
  onIndicatorPreviewReset,
  onIndicatorSmartPreview,
}) => {
  const handleCloseSidePanel = () => {
    onCloseButtonClick();
  };


  return (
    <SidePanel
      onCloseButtonClick={handleCloseSidePanel}
      width={DEFAULT_PANEL_WIDTH}
    >
      <SidePanel.Header title="Timer" showDivider={true} />
      <SidePanel.Content noPadding>
        <SidePanel.Section title={renderSectionTitle("Timer Mode", "Choose how the timer works: run between fixed dates, show a unique countdown per visitor, or display a number-based counter.")}>
          <SidePanel.Field>
            <FormField>
              <Layout cols={1} gap="12px">
                <Dropdown size="small" placeholder="Medium" options={[
                  { id: 0, value: 'Option 1' },
                  { id: 1, value: 'Option 2' },
                  { id: 2, value: 'Option 3' },
                ]} />
              </Layout>
            </FormField>
          </SidePanel.Field>
        </SidePanel.Section>

        <SidePanel.Section title={renderSectionTitle("Set Timer", "Define the start and end time for your countdown timer.")}>
          <SidePanel.Field divider={false}>
            <Box direction="vertical" gap="16px">
              <FormField>
                <Box direction="vertical" gap="8px">
                  <Text secondary size="small">Start Date</Text>
                  <Box direction="horizontal">
                    <Box style={{ flex: 2 }}>
                      <DatePicker
                        size="small"
                        onChange={() => { }}
                      />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <TimeInput
                        size="small"
                        placeholder="Small"
                        onChange={() => { }}
                      />
                    </Box>
                  </Box>
                </Box>
              </FormField>

              <FormField>
                <Box direction="vertical" gap="8px">
                  <Text secondary size="small">End Date</Text>
                  <Box direction="horizontal">
                    <Box style={{ flex: 2 }}>
                      <DatePicker
                        size="small"
                        onChange={() => { }}
                      />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <TimeInput
                        size="small"
                        placeholder="Small"
                        onChange={() => { }}
                      />
                    </Box>
                  </Box>
                </Box>
              </FormField>
            </Box>
          </SidePanel.Field>
          <SidePanel.Field divider={false}>
            <FormField>
              <Box direction="vertical" gap="8px">
                <Text secondary size="small">Time Zone</Text>
                <Layout cols={1} gap="12px">
                  <Dropdown size="small" placeholder="Medium" options={[
                    { id: 0, value: 'Option 1' },
                    { id: 1, value: 'Option 2' },
                    { id: 2, value: 'Option 3' },
                  ]} />
                </Layout>
              </Box>
            </FormField>
          </SidePanel.Field>
        </SidePanel.Section>

        <SidePanel.Section title={renderSectionTitle("Display Options")}>
          <SidePanel.Field>
            <FormField>
              <Layout cols={1} gap="12px">
                <Checkbox>Days</Checkbox>
                <Checkbox>Horus</Checkbox>
                <Checkbox>Minutes</Checkbox>
                <Checkbox>Hours</Checkbox>
              </Layout>

            </FormField>
          </SidePanel.Field>
        </SidePanel.Section>

        <SidePanel.Section title={renderSectionTitle("Action After Timer Finishes", "Decide what happens when the timer reaches 0: hide the timershow a message or redirect")}>
          <SidePanel.Field divider={false}>
            <FormField>
              <Box direction="vertical" gap="8px">
                <Text secondary size="small">Select Action</Text>
                <Layout cols={1} gap="12px">
                  <Dropdown size="small" options={[
                    { id: 0, value: 'Hide Timer' },
                    { id: 1, value: 'Show Message' },
                    { id: 2, value: 'Redirect to URL' },
                  ]} />
                </Layout>
              </Box>
            </FormField>
          </SidePanel.Field>

          {/* TODO: Show this field id "Show Message" option selected */}
          <SidePanel.Field divider={false}>
            <FormField>
              <Box direction="vertical" gap="8px">
                <Text secondary size="small">Message</Text>
                <Layout cols={1} gap="12px">
                  <Input size="small" placeholder="" />
                </Layout>
              </Box>
            </FormField>
          </SidePanel.Field>

          {/* TODO: Show this field id "Show Message" option selected */}
          <SidePanel.Field divider={false}>
            <Box direction="vertical" gap="8px">
              <FormField>
                <Box direction="horizontal" style={{ justifyContent: "space-between" }}>
                  <Text secondary size="small">Show Countries</Text>
                  <ToggleSwitch size="small" />
                </Box>
              </FormField>


              <FormField>
                <Box direction="horizontal" style={{ justifyContent: "space-between" }}>
                  <Text secondary size="small">Show Button</Text>
                  <ToggleSwitch size="small" />
                </Box>
              </FormField>
            </Box>
          </SidePanel.Field>

          {/* TODO: Show this field id "Redirect to URL" option selected */}
          <SidePanel.Field divider={false}>
            <FormField>
              <Box direction="vertical" gap="8px">
                <Text secondary size="small">URL to Redirect</Text>
                <Layout cols={1} gap="12px">
                  <Input size="small" placeholder="" />
                </Layout>
              </Box>
            </FormField>
          </SidePanel.Field>
        </SidePanel.Section>
      </SidePanel.Content>
    </SidePanel>
  );
};

export default PanelGeneral;
