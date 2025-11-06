import React, { useEffect } from "react";
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
  
  useEffect(() => {
    console.log("options", options);
  }, [options]);


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
                <Dropdown 
                  size="small" 
                  selectedId={options.timerMode || "start-to-finish-timer"}
                  onSelect={(option) => onChange({ ...options, timerMode: option?.id as any })}
                  options={[
                    { id: 'start-to-finish-timer', value: 'Start to Finish Timer' },
                    { id: 'personal-countdown', value: 'Personal Countdown' },
                    { id: 'number-counter', value: 'Number Counter' },
                  ]} 
                />
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
                        value={options.timerConfig?.startDate || new Date("2025-01-01")}
                        onChange={(date) => onChange({ 
                          ...options, 
                          timerConfig: { 
                            ...options.timerConfig!,
                            startDate: (date as any)?.date || date || new Date("2025-01-01")
                          } 
                        })}
                      />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Input
                        size="small"
                        placeholder="00:00:00"
                        value={options.timerConfig?.startTime || "00:00:00"}
                        onChange={(e) => onChange({ 
                          ...options, 
                          timerConfig: { 
                            ...options.timerConfig!,
                            startTime: e.target.value
                          } 
                        })}
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
                        value={options.timerConfig?.endDate || new Date("2025-12-31")}
                        onChange={(date) => onChange({ 
                          ...options, 
                          timerConfig: { 
                            ...options.timerConfig!,
                            endDate: (date as any)?.date || date || new Date("2025-12-31")
                          } 
                        })}
                      />
                    </Box>
                    <Box style={{ flex: 1 }}>
                      <Input
                        size="small"
                        placeholder="23:59:59"
                        value={options.timerConfig?.endTime || "23:59:59"}
                        onChange={(e) => onChange({ 
                          ...options, 
                          timerConfig: { 
                            ...options.timerConfig!,
                            endTime: e.target.value
                          } 
                        })}
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
                  <Dropdown 
                    size="small" 
                    placeholder="Select Time Zone"
                    selectedId={options.timerConfig?.timeZone || "UTC"}
                    onSelect={(option) => onChange({ 
                      ...options, 
                      timerConfig: { 
                        ...options.timerConfig!,
                        timeZone: option?.id as string || "UTC"
                      } 
                    })}
                    options={[
                      { id: 'UTC', value: 'UTC' },
                      { id: 'America/New_York', value: 'America/New_York (EST)' },
                      { id: 'America/Los_Angeles', value: 'America/Los_Angeles (PST)' },
                      { id: 'Europe/London', value: 'Europe/London (GMT)' },
                      { id: 'Asia/Tokyo', value: 'Asia/Tokyo (JST)' },
                    ]} 
                  />
                </Layout>
              </Box>
            </FormField>
          </SidePanel.Field>
        </SidePanel.Section>

        <SidePanel.Section title={renderSectionTitle("Display Options")}>
          <SidePanel.Field>
            <FormField>
              <Layout cols={1} gap="12px">
                <Checkbox
                  checked={options.timerConfig?.displayOptions?.showDays ?? true}
                  onChange={(e) => onChange({ 
                    ...options, 
                    timerConfig: { 
                      ...options.timerConfig!,
                      displayOptions: {
                        ...options.timerConfig!.displayOptions!,
                        showDays: e.target.checked
                      }
                    } 
                  })}
                >
                  Days
                </Checkbox>
                <Checkbox
                  checked={options.timerConfig?.displayOptions?.showHours ?? true}
                  onChange={(e) => onChange({ 
                    ...options, 
                    timerConfig: { 
                      ...options.timerConfig!,
                      displayOptions: {
                        ...options.timerConfig!.displayOptions!,
                        showHours: e.target.checked
                      }
                    } 
                  })}
                >
                  Hours
                </Checkbox>
                <Checkbox
                  checked={options.timerConfig?.displayOptions?.showMinutes ?? true}
                  onChange={(e) => onChange({ 
                    ...options, 
                    timerConfig: { 
                      ...options.timerConfig!,
                      displayOptions: {
                        ...options.timerConfig!.displayOptions!,
                        showMinutes: e.target.checked
                      }
                    } 
                  })}
                >
                  Minutes
                </Checkbox>
                <Checkbox
                  checked={options.timerConfig?.displayOptions?.showSeconds ?? true}
                  onChange={(e) => onChange({ 
                    ...options, 
                    timerConfig: { 
                      ...options.timerConfig!,
                      displayOptions: {
                        ...options.timerConfig!.displayOptions!,
                        showSeconds: e.target.checked
                      }
                    } 
                  })}
                >
                  Seconds
                </Checkbox>
              </Layout>
            </FormField>
          </SidePanel.Field>
        </SidePanel.Section>

        <SidePanel.Section title={renderSectionTitle("Action After Timer Finishes", "Decide what happens when the timer reaches 0: hide the timer, show a message or redirect")}>
          <SidePanel.Field divider={false}>
            <FormField>
              <Box direction="vertical" gap="8px">
                <Text secondary size="small">Select Action</Text>
                <Layout cols={1} gap="12px">
                  <Dropdown 
                    size="small" 
                    selectedId={options.actionConfig?.action || "show-message"}
                    onSelect={(option) => onChange({ 
                      ...options, 
                      actionConfig: { 
                        ...options.actionConfig!,
                        action: option?.id as any || "show-message"
                      } 
                    })}
                    options={[
                      { id: 'hide', value: 'Hide Timer' },
                      { id: 'show-message', value: 'Show Message' },
                      { id: 'redirect', value: 'Redirect to URL' },
                    ]} 
                  />
                </Layout>
              </Box>
            </FormField>
          </SidePanel.Field>

          {options.actionConfig?.action === "show-message" && (
            <>
              <SidePanel.Field divider={false}>
                <FormField>
                  <Box direction="vertical" gap="8px">
                    <Text secondary size="small">Message</Text>
                    <Layout cols={1} gap="12px">
                      <Input 
                        size="small" 
                        placeholder="The sale has ended. Thank you for your interest!"
                        value={options.actionConfig?.message || ""}
                        onChange={(e) => onChange({ 
                          ...options, 
                          actionConfig: { 
                            ...options.actionConfig!,
                            message: e.target.value
                          } 
                        })}
                      />
                    </Layout>
                  </Box>
                </FormField>
              </SidePanel.Field>

              <SidePanel.Field divider={false}>
                <Box direction="vertical" gap="8px">
                  <FormField>
                    <Box direction="horizontal" style={{ justifyContent: "space-between" }}>
                      <Text secondary size="small">Show Countries</Text>
                      <ToggleSwitch 
                        size="small" 
                        checked={options.actionConfig?.showCountries ?? false}
                        onChange={(e) => onChange({ 
                          ...options, 
                          actionConfig: { 
                            ...options.actionConfig!,
                            showCountries: e.target.checked
                          } 
                        })}
                      />
                    </Box>
                  </FormField>
                  <FormField>
                    <Box direction="horizontal" style={{ justifyContent: "space-between" }}>
                      <Text secondary size="small">Show Button</Text>
                      <ToggleSwitch 
                        size="small" 
                        checked={options.actionConfig?.showButton ?? false}
                        onChange={(e) => onChange({ 
                          ...options, 
                          actionConfig: { 
                            ...options.actionConfig!,
                            showButton: e.target.checked
                          } 
                        })}
                      />
                    </Box>
                  </FormField>
                </Box>
              </SidePanel.Field>
            </>
          )}

          {options.actionConfig?.action === "redirect" && (
            <SidePanel.Field divider={false}>
              <FormField>
                <Box direction="vertical" gap="8px">
                  <Text secondary size="small">URL to Redirect</Text>
                  <Layout cols={1} gap="12px">
                    <Input 
                      size="small" 
                      placeholder="https://example.com"
                      value={options.actionConfig?.redirectUrl || ""}
                      onChange={(e) => onChange({ 
                        ...options, 
                        actionConfig: { 
                          ...options.actionConfig!,
                          redirectUrl: e.target.value
                        } 
                      })}
                    />
                  </Layout>
                </Box>
              </FormField>
            </SidePanel.Field>
          )}
        </SidePanel.Section>
      </SidePanel.Content>
    </SidePanel>
  );
};

export default PanelGeneral;
