import React from "react";
import { SidePanel, ColorInstance, FormField } from "@wix/design-system";
import { WidgetStyles } from "../../../../../interfaces";

import { ImagePicker } from "../../../../components/common/ui/FormInputs/ImagePicker";
import { InputColorOpacity } from "../../../../components/common/ui/FormInputs";

interface SubPanelThemesProps {
  options: WidgetStyles;
  onChange: (options: Record<string, any>) => void;
}

const SubPanelThemes: React.FC<SubPanelThemesProps> = ({
  options,
  onChange,
}) => {
  const onColorInput = (
    color: string | ColorInstance,
    key: keyof WidgetStyles
  ) => {
    const colorValue = typeof color === "string" ? color : color?.hex;
    onChange({
      ...options,
      [key]: colorValue,
    });
  };
  const legacyBadgeIndicatorColor =
    (options as any)?.D_Badge_StatusIndicatorColor || "#FF3B30";
  const badgeIndicatorColor =
    options.D_Badge_IndicatorColor ?? legacyBadgeIndicatorColor;

  return (
    <SidePanel.Content noPadding>
      <SidePanel.Section title="Badge Colors">
        <InputColorOpacity
          label="Badge Background Color"
          infoContent="This color is used for the badge background."
          value={options.D_Badge_BackgroundColor}
          onChange={(color) => onColorInput(color, "D_Badge_BackgroundColor")}
        />
        <InputColorOpacity
          label="Badge Text Color"
          infoContent="This color is used for the badge text."
          value={options.D_Badge_TextColor}
          onChange={(color) => onColorInput(color, "D_Badge_TextColor")}
        />
      </SidePanel.Section>
      <SidePanel.Section title="Indicator Color">
        <InputColorOpacity
          label="Notification Dot Color"
          infoContent="This color is used for the badge notification indicator."
          value={badgeIndicatorColor}
          onChange={(color) => onColorInput(color, "D_Badge_IndicatorColor")}
        />
      </SidePanel.Section>
      <SidePanel.Section title="Surface Colors">
        <InputColorOpacity
          label="Card Background Color"
          infoContent=""
          value={options.D_Card_BackgroundColor}
          onChange={(color) => onColorInput(color, "D_Card_BackgroundColor")}
        />
        <InputColorOpacity
          label="Content Background Color"
          infoContent=""
          value={options.D_Content_BackgroundColor}
          onChange={(color) => onColorInput(color, "D_Content_BackgroundColor")}
        />
        <InputColorOpacity
          label="Content Border Color"
          infoContent=""
          value={options.D_Content_BorderColor}
          onChange={(color) => onColorInput(color, "D_Content_BorderColor")}
        />
        <SidePanel.Field>
          <FormField
            label="Chat Background Image"
            infoContent="The image of the agent chat background. This image will be used as the background of the chat area."
          >
            <ImagePicker
              imageUrl={options.D_Content_BackgroundImage || ""}
              onChange={(imageUrl, imageTitle) => {
                onChange({ ...options, D_Content_BackgroundImage: imageUrl });
              }}
              frameWidth="100%"
              frameHeight="140px"
            />
          </FormField>
        </SidePanel.Field>
      </SidePanel.Section>
      <SidePanel.Section title="Text Colors">
        <InputColorOpacity
          label="Text High Emphasis Color"
          infoContent="This color is used for text that needs to stand out."
          value={options.D_Text_HighEmphasisColor}
          onChange={(color) => onColorInput(color, "D_Text_HighEmphasisColor")}
        />
        <InputColorOpacity
          label="Text Low Emphasis Color"
          infoContent="This color is used for text that is less important."
          value={options.D_Text_LowEmphasisColor}
          onChange={(color) => onColorInput(color, "D_Text_LowEmphasisColor")}
        />
      </SidePanel.Section>
      <SidePanel.Section title="Button Colors">
        <InputColorOpacity
          label="Button Background Color"
          infoContent="This color is used for the button background."
          value={options.D_Btn_BackgroundColor}
          onChange={(color) => onColorInput(color, "D_Btn_BackgroundColor")}
        />
        <InputColorOpacity
          label="Button Text Color"
          infoContent="This color is used for the button text."
          value={options.D_Btn_TextColor}
          onChange={(color) => onColorInput(color, "D_Btn_TextColor")}
        />
      </SidePanel.Section>
      <SidePanel.Section title="Header Colors">
        <InputColorOpacity
          label="Header Background Color"
          infoContent="This color is used for the header background."
          value={options.D_Header_BackgroundColor}
          onChange={(color) => onColorInput(color, "D_Header_BackgroundColor")}
        />
        <InputColorOpacity
          label="Header Text High Emphasis Color"
          infoContent="This color is used for the header text that needs to stand out."
          value={options.D_Header_Text_HighEmphasisColor}
          onChange={(color) =>
            onColorInput(color, "D_Header_Text_HighEmphasisColor")
          }
        />
        <InputColorOpacity
          label="Header Text Low Emphasis Color"
          infoContent="This color is used for the header text that is less important."
          value={options.D_Header_Text_LowEmphasisColor}
          onChange={(color) =>
            onColorInput(color, "D_Header_Text_LowEmphasisColor")
          }
        />
      </SidePanel.Section>
      <SidePanel.Section title="Avatar Indicator">
        <InputColorOpacity
          label="Avatar Indicator Active Color"
          infoContent="This color is used to indicate the active state of the avatar."
          value={options.D_Avatar_IndicatorActiveColor}
          onChange={(color) =>
            onColorInput(color, "D_Avatar_IndicatorActiveColor")
          }
        />
        <InputColorOpacity
          label="Avatar Indicator Disabled Color"
          infoContent="This color is used to indicate the disabled state of the avatar."
          value={options.D_Avatar_IndicatorDisabledColor}
          onChange={(color) =>
            onColorInput(color, "D_Avatar_IndicatorDisabledColor")
          }
        />
      </SidePanel.Section>
      <SidePanel.Section title="Footer Colors">
        <InputColorOpacity
          label="Footer Background Color"
          infoContent="This color is used for the footer background."
          value={options.D_Footer_BackgroundColor}
          onChange={(color) => onColorInput(color, "D_Footer_BackgroundColor")}
        />
        <InputColorOpacity
          label="Footer Text Color"
          infoContent="This color is used for the footer text."
          value={options.D_Text_DisabledColor}
          onChange={(color) => onColorInput(color, "D_Text_DisabledColor")}
        />
      </SidePanel.Section>
    </SidePanel.Content>
  );
};

export default SubPanelThemes;
