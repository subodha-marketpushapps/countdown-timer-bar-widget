import React from "react";
import {
  FieldSet,
  Input,
  NumberInput,
  SidePanel,
  Slider,
} from "@wix/design-system";

import InputCornerRadius from "../../../../components/common/ui/FormInputs/InputCornerRadius";

import { WidgetStyles } from "../../../../../interfaces";

interface Props {
  options: WidgetStyles;
  onChange: (options: WidgetStyles) => void;
}

const PanelPositionDesktop: React.FC<Props> = ({ options, onChange }) => {
  const getOrReceiveRealFontValue = (
    action: "GET" | "RECEIVE",
    keyOrValue: number
  ) => {
    const fontValueMap: Record<number, number> = {
      1: 1.6,
      2: 1.8,
      3: 2,
      4: 2.2,
      5: 2.4,
    };

    if (action === "GET") {
      return fontValueMap[keyOrValue] || 12;
    }

    if (action === "RECEIVE") {
      const reverseMap = Object.entries(fontValueMap).reduce<
        Record<number, number>
      >((acc, [key, value]) => {
        acc[Number(value)] = Number(key);
        return acc;
      }, {});

      return reverseMap[keyOrValue] || 1;
    }

    return 2;
  };

  return (
    <SidePanel.Content noPadding>
      <SidePanel.Section title="General Layout" />
      <SidePanel.Field>
        <FieldSet
          gap="small"
          legend="Widget Max Width"
          infoContent="This is the maximum width of the chat widget container. When the screen is smaller than this value, the chat widget will be adjusted to fit the screen automatically."
          columns="auto 72px"
        >
          <Slider
            onChange={(value) => {
              onChange({
                ...options,
                L_Widget_MaxWidth: Array.isArray(value) ? value[0] : value,
              });
            }}
            min={120}
            max={960}
            step={10}
            value={options.L_Widget_MaxWidth}
            displayMarks={false}
          />
          <NumberInput
            size="small"
            min={120}
            max={960}
            step={10}
            value={options.L_Widget_MaxWidth}
            onChange={(value) =>
              onChange({
                ...options,
                L_Widget_MaxWidth: Number(value),
              })
            }
            suffix={<Input.Affix>px</Input.Affix>}
            hideStepper
          />
        </FieldSet>
      </SidePanel.Field>
      <SidePanel.Field>
        <FieldSet
          gap="small"
          legend="Element Gap"
          infoContent="This is the gap between chat container and the badge."
          columns="auto 72px"
        >
          <Slider
            onChange={(value) => {
              onChange({
                ...options,
                L_Widget_ElementGap: Array.isArray(value) ? value[0] : value,
              });
            }}
            min={0}
            max={60}
            step={1}
            value={options.L_Widget_ElementGap}
            displayMarks={false}
          />
          <NumberInput
            size="small"
            min={0}
            max={60}
            step={1}
            value={options.L_Widget_ElementGap}
            onChange={(value) =>
              onChange({
                ...options,
                L_Widget_ElementGap: Number(value),
              })
            }
            suffix={<Input.Affix>px</Input.Affix>}
            hideStepper
          />
        </FieldSet>
      </SidePanel.Field>
      <SidePanel.Section title="Chat Layout" />

      <SidePanel.Field>
        <FieldSet
          gap="small"
          legend="Font Size"
          infoContent="This is the font size of the chat widget container inside all the text elements."
          columns="auto 72px"
        >
          <Slider
            onChange={(value) => {
              onChange({
                ...options,
                L_Widget_FontSize: Array.isArray(value)
                  ? getOrReceiveRealFontValue("GET", value[0])
                  : getOrReceiveRealFontValue("GET", value),
              });
            }}
            min={1}
            max={5}
            step={1}
            value={getOrReceiveRealFontValue(
              "RECEIVE",
              options.L_Widget_FontSize
            )}
            displayMarks={false}
          />
          <NumberInput
            size="small"
            min={1}
            max={5}
            step={1}
            value={getOrReceiveRealFontValue(
              "RECEIVE",
              options.L_Widget_FontSize
            )}
            onChange={(value) =>
              onChange({
                ...options,
                L_Widget_FontSize: getOrReceiveRealFontValue(
                  "GET",
                  Number(value)
                ),
              })
            }
            suffix={<Input.Affix>*</Input.Affix>}
            hideStepper
          />
        </FieldSet>
      </SidePanel.Field>
      <SidePanel.Field>
        <FieldSet
          gap="small"
          legend="Chat Border radius"
          infoContent="This is the border radius of the chat widget container and the agent preview card."
          columns="auto 72px"
        >
          <Slider
            onChange={(value) => {
              onChange({
                ...options,
                L_Widget_CornerRounding: Array.isArray(value)
                  ? value[0]
                  : value,
              });
            }}
            min={0}
            max={10}
            step={0.5}
            value={options.L_Widget_CornerRounding}
            displayMarks={false}
          />
          <NumberInput
            size="small"
            min={0}
            max={10}
            step={0.5}
            value={options.L_Widget_CornerRounding}
            onChange={(value) =>
              onChange({
                ...options,
                L_Widget_CornerRounding: Number(value),
              })
            }
            suffix={<Input.Affix>*</Input.Affix>}
            hideStepper
          />
        </FieldSet>
      </SidePanel.Field>

      <SidePanel.Section title="Badge Layout" />
      <SidePanel.Field>
        <FieldSet
          gap="small"
          legend="Badge Font Size"
          infoContent="This is the size of the badge."
          columns="auto 72px"
        >
          <Slider
            onChange={(value) => {
              onChange({
                ...options,
                L_Badge_Size: Array.isArray(value) ? value[0] : value,
              });
            }}
            min={1}
            max={5}
            step={0.2}
            value={options.L_Badge_Size}
            displayMarks={false}
          />
          <NumberInput
            size="small"
            min={1}
            max={5}
            step={0.2}
            value={options.L_Badge_Size}
            onChange={(value) =>
              onChange({
                ...options,
                L_Badge_Size: Number(value),
              })
            }
            suffix={<Input.Affix>*</Input.Affix>}
            hideStepper
          />
        </FieldSet>
      </SidePanel.Field>
      <SidePanel.Field>
        <FieldSet legend="Badge Border radius">
          <InputCornerRadius
            value={options.L_Badge_CornerRounding}
            onChange={(value) =>
              onChange({
                ...options,
                L_Badge_CornerRounding: value,
              })
            }
          />
        </FieldSet>
      </SidePanel.Field>
    </SidePanel.Content>
  );
};

export default PanelPositionDesktop;
