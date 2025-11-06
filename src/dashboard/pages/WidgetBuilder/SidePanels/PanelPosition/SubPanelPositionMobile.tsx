import React from "react";
import {
  FieldSet,
  Input,
  NumberInput,
  SidePanel,
  Slider,
  Thumbnail,
  Text,
  Box,
} from "@wix/design-system";

import * as Icons from "@wix/wix-ui-icons-common";

import { WidgetStyles } from "../../../../../interfaces";

interface Props {
  options: WidgetStyles;
  onChange: (options: WidgetStyles) => void;
}

const PanelPositionMobile: React.FC<Props> = ({ options, onChange }) => {
  return (
    <SidePanel.Content noPadding>
      <SidePanel.Section title="Widget Position" />
      <SidePanel.Field>
        <FieldSet
          legend="Badge Alignment"
          direction="horizontal"
          columns="1fr 1fr"
        >
          <Thumbnail
            size="tiny"
            selected={options.L_Widget_PositionAlign_Mobile === "left"}
            onClick={() =>
              onChange({ ...options, L_Widget_PositionAlign_Mobile: "left" })
            }
            hideSelectedIcon
            height={56}
            image={
              <Box
                width="100%"
                height={56}
                align="center"
                verticalAlign="middle"
              >
                <Text skin="primary">
                  <Icons.AlignLeft size={28} />
                </Text>
              </Box>
            }
            textPosition="outside"
            title="Left"
          />
          <Thumbnail
            size="tiny"
            selected={options.L_Widget_PositionAlign_Mobile === "right"}
            onClick={() =>
              onChange({ ...options, L_Widget_PositionAlign_Mobile: "right" })
            }
            hideSelectedIcon
            height={56}
            image={
              <Box
                width="100%"
                height={56}
                align="center"
                verticalAlign="middle"
              >
                <Text skin="primary">
                  <Icons.AlignRight size={28} />
                </Text>
              </Box>
            }
            textPosition="outside"
            title="Right"
          />
        </FieldSet>
      </SidePanel.Field>
      <SidePanel.Field>
        <FieldSet gap="small" legend="Margin Bottom" columns="auto 72px">
          <Slider
            onChange={(value) => {
              onChange({
                ...options,
                L_Widget_Position_Mobile: {
                  ...options.L_Widget_Position_Mobile,
                  bottom: Array.isArray(value) ? value[0] : value,
                },
              });
            }}
            min={0}
            max={200}
            step={1}
            value={options.L_Widget_Position_Mobile?.bottom ?? 0}
            displayMarks={false}
          />
          <NumberInput
            size="small"
            min={0}
            max={200}
            step={1}
            value={options.L_Widget_Position_Mobile?.bottom ?? 0}
            onChange={(value) =>
              onChange({
                ...options,
                L_Widget_Position_Mobile: {
                  ...options.L_Widget_Position_Mobile,
                  bottom: Number(value),
                },
              })
            }
            suffix={<Input.Affix>px</Input.Affix>}
            hideStepper
          />
        </FieldSet>
      </SidePanel.Field>
      {options.L_Widget_PositionAlign_Mobile == "right" && (
        <SidePanel.Field>
          <FieldSet gap="small" legend="Margin Right" columns="auto 72px">
            <Slider
              onChange={(value) => {
                onChange({
                  ...options,
                  L_Widget_Position_Mobile: {
                    ...options.L_Widget_Position_Mobile,
                    right: Array.isArray(value) ? value[0] : value,
                  },
                });
              }}
              min={0}
              max={200}
              step={1}
              value={options.L_Widget_Position_Mobile?.right ?? 0}
              displayMarks={false}
            />
            <NumberInput
              size="small"
              min={0}
              max={200}
              step={1}
              value={options.L_Widget_Position_Mobile?.right ?? 0}
              onChange={(value) =>
                onChange({
                  ...options,
                  L_Widget_Position_Mobile: {
                    ...options.L_Widget_Position_Mobile,
                    right: Number(value),
                  },
                })
              }
              suffix={<Input.Affix>px</Input.Affix>}
              hideStepper
            />
          </FieldSet>
        </SidePanel.Field>
      )}
      {options.L_Widget_PositionAlign_Mobile == "left" && (
        <SidePanel.Field>
          <FieldSet gap="small" legend="Margin Left" columns="auto 72px">
            <Slider
              onChange={(value) => {
                onChange({
                  ...options,
                  L_Widget_Position_Mobile: {
                    ...options.L_Widget_Position_Mobile,
                    left: Array.isArray(value) ? value[0] : value,
                  },
                });
              }}
              min={0}
              max={200}
              step={1}
              value={options.L_Widget_Position_Mobile?.left ?? 0}
              displayMarks={false}
            />
            <NumberInput
              size="small"
              min={0}
              max={200}
              step={1}
              value={options.L_Widget_Position_Mobile?.left ?? 0}
              onChange={(value) =>
                onChange({
                  ...options,
                  L_Widget_Position_Mobile: {
                    ...options.L_Widget_Position_Mobile,
                    left: Number(value),
                  },
                })
              }
              suffix={<Input.Affix>px</Input.Affix>}
              hideStepper
            />
          </FieldSet>
        </SidePanel.Field>
      )}
    </SidePanel.Content>
  );
};

export default PanelPositionMobile;
