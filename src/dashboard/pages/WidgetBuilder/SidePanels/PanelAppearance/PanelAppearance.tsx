import React, { useState, useEffect } from "react";
import { Layout, FormField, SidePanel, Input, Box, Text, ToggleSwitch } from "@wix/design-system";

import { site } from "@wix/site-site";
import { WidgetContent } from "../../../../../interfaces";
import { renderSectionTitle } from "../utils";
import { DEFAULT_PANEL_WIDTH } from "../SidePanelContainer";
import ClockCarousel, { ClockConfig } from "../../../../../components/WidgetCountDown/ClockCarousel";

interface Props {
    options: WidgetContent;
    onChange: (options: WidgetContent) => void;
    onCloseButtonClick: () => void;
    previewControl?: any; // Preview control from parent
}

const PanelAppearance: React.FC<Props> = ({
    options,
    onChange,
    onCloseButtonClick,
    previewControl,
}) => {
    const [fontList, setFontList] = useState<string | null>(null);
    const [isEditingWelcomeMessage, setIsEditingWelcomeMessage] = useState(false);

    // Clock configurations for the carousel
    const clockConfigs: ClockConfig[] = [
        {
            id: "1",
            label: "Fill Each Digit",
            labelPosition: "top",
            numberStyle: "fillEachDigit",
            endDate: new Date("2025-12-31"),
            endTime: "23:59:59",
            backgroundColor: "#2563eb",
            textColor: "#ffffff",
        },
        {
            id: "2",
            label: "Outline Each Digit",
            labelPosition: "bottom",
            numberStyle: "outlineEachDigit",
            endDate: new Date("2025-12-31"),
            endTime: "23:59:59",
            backgroundColor: "#2563eb",
            textColor: "#2563eb",
        },
        {
            id: "3",
            label: "Filled Box",
            labelPosition: "bottom",
            numberStyle: "filled",
            endDate: new Date("2025-12-31"),
            endTime: "23:59:59",
            backgroundColor: "#10b981",
            textColor: "#ffffff",
        },
        {
            id: "4",
            label: "Outline Box",
            labelPosition: "bottom",
            numberStyle: "outline",
            endDate: new Date("2025-12-31"),
            endTime: "23:59:59",
            backgroundColor: "#f59e0b",
            textColor: "#f59e0b",
        },
        {
            id: "5",
            label: "Minimal Style",
            labelPosition: "bottom",
            numberStyle: "none",
            endDate: new Date("2025-12-31"),
            endTime: "23:59:59",
            backgroundColor: "#6366f1",
            textColor: "#6366f1",
        },
    ];

    useEffect(() => {
        const fetchFonts = async () => {
            const fonts = await site.getFontsHtml([]);
            console.log("fonts =====>>>", fonts);
            setFontList(fonts);
        };
        fetchFonts();
    }, []);

    const handleCloseSidePanel = () => {
        onCloseButtonClick();
    };

    return (
        <SidePanel
            onCloseButtonClick={handleCloseSidePanel}
            width={DEFAULT_PANEL_WIDTH}
        >
            <SidePanel.Header title="Appearance" showDivider={true}></SidePanel.Header>

            <SidePanel.Content noPadding>
                <SidePanel.Section title={renderSectionTitle("Template", "Chose a layout style for your countdown bar. each template changes how the text, timer and button are arranged.")}>
                    <SidePanel.Field divider={false}>
                        <FormField>
                            <Box direction="horizontal" style={{ justifyContent: "space-between" }}>
                                <Text secondary size="small">Content Here</Text>
                            </Box>
                        </FormField>
                    </SidePanel.Field>
                </SidePanel.Section>

                <SidePanel.Section title={renderSectionTitle("Clock Style", "Select the visual style of your countdown (Ex: box style, minimal, inline). Only the timer design changes.")}>
                    <SidePanel.Field divider={false}>
                        <FormField>
                            <Box width="100%" direction="vertical" style={{ padding: "16px 0" }}>
                                <ClockCarousel
                                    clocks={clockConfigs}
                                    autoSlide={false}
                                    showNavigation={true}
                                    showDots={true}
                                    navigationPosition="bottom"
                                />
                            </Box>
                        </FormField>
                    </SidePanel.Field>
                </SidePanel.Section>

                <SidePanel.Section title={renderSectionTitle("Theme", "Select the visual style of your countdown (Ex: box style, minimal, inline). Only the timer design changes.")}>
                    <SidePanel.Field divider={false}>
                        <FormField>
                            <Box direction="horizontal" style={{ justifyContent: "space-between" }}>
                                <Text secondary size="small">Content Here</Text>
                            </Box>
                        </FormField>
                    </SidePanel.Field>
                </SidePanel.Section>

                <SidePanel.Section title={renderSectionTitle("Font", "Chose the font style for your countdown text to align with your website's branding")}>
                    <SidePanel.Field divider={false}>
                        <FormField>

                        </FormField>
                    </SidePanel.Field>
                </SidePanel.Section>
            </SidePanel.Content>

        </SidePanel>
    );
};

export default PanelAppearance;
