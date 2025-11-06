import React, { useState, useCallback, useEffect, useMemo } from "react";
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
import { debounce } from "lodash";

import * as Icons from "@wix/wix-ui-icons-common";

import { WidgetStyles } from "../../../../../interfaces";

interface Props {
  options: WidgetStyles;
  onChange: (options: WidgetStyles) => void;
}

const PanelPositionDesktop: React.FC<Props> = ({ options, onChange }) => {
  // Debounced handler for z-index changes
  const [zIndexValue, setZIndexValue] = useState(options.L_Widget_ZIndex ?? 0);

  // Update local state when options change
  useEffect(() => {
    setZIndexValue(options.L_Widget_ZIndex ?? 0);
  }, [options.L_Widget_ZIndex]);

    // Debounced onChange handler using lodash
  const debouncedZIndexChange = useCallback(
    (value: number | null) => {
      const numValue = value ?? 0;
      setZIndexValue(numValue);
      
      // Use lodash debounce for reliable debouncing
      debouncedOnChange(numValue);
    },
    []
  );

  // Create debounced function for actual onChange
  const debouncedOnChange = useMemo(
    () => debounce((value: number) => {
      onChange({
        ...options,
        L_Widget_ZIndex: value,
      });
    }, 300),
    [onChange, options]
  );

  return (
    <SidePanel.Content noPadding>
      <SidePanel.Section title="Widget Position" />
      <SidePanel.Field>
        <FieldSet legend="Alignment" direction="horizontal" columns="1fr 1fr">
          <Thumbnail
            size="tiny"
            selected={options.L_Widget_PositionAlign === "left"}
            onClick={() =>
              onChange({ ...options, L_Widget_PositionAlign: "left" })
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
            selected={options.L_Widget_PositionAlign === "right"}
            onClick={() =>
              onChange({ ...options, L_Widget_PositionAlign: "right" })
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
                L_Widget_Position: {
                  ...options.L_Widget_Position,
                  bottom: Array.isArray(value) ? value[0] : value,
                },
              });
            }}
            min={0}
            max={200}
            step={1}
            value={options.L_Widget_Position?.bottom ?? 0}
            displayMarks={false}
          />
          <NumberInput
            size="small"
            min={0}
            max={200}
            step={1}
            value={options.L_Widget_Position?.bottom ?? 0}
            onChange={(value) =>
              onChange({
                ...options,
                L_Widget_Position: {
                  ...options.L_Widget_Position,
                  bottom: Number(value),
                },
              })
            }
            suffix={<Input.Affix>px</Input.Affix>}
            hideStepper
          />
        </FieldSet>
      </SidePanel.Field>
      {options.L_Widget_PositionAlign == "right" && (
        <SidePanel.Field>
          <FieldSet gap="small" legend="Margin Right" columns="auto 72px">
            <Slider
              onChange={(value) => {
                onChange({
                  ...options,
                  L_Widget_Position: {
                    ...options.L_Widget_Position,
                    right: Array.isArray(value) ? value[0] : value,
                  },
                });
              }}
              min={0}
              max={200}
              step={1}
              value={options.L_Widget_Position?.right ?? 0}
              displayMarks={false}
            />
            <NumberInput
              size="small"
              min={0}
              max={200}
              step={1}
              value={options.L_Widget_Position?.right ?? 0}
              onChange={(value) =>
                onChange({
                  ...options,
                  L_Widget_Position: {
                    ...options.L_Widget_Position,
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
      {options.L_Widget_PositionAlign == "left" && (
        <SidePanel.Field>
          <FieldSet gap="small" legend="Margin Left" columns="auto 72px">
            <Slider
              onChange={(value) => {
                onChange({
                  ...options,
                  L_Widget_Position: {
                    ...options.L_Widget_Position,
                    left: Array.isArray(value) ? value[0] : value,
                  },
                });
              }}
              min={0}
              max={200}
              step={1}
              value={options.L_Widget_Position?.left ?? 0}
              displayMarks={false}
            />
            <NumberInput
              size="small"
              min={0}
              max={200}
              step={1}
              value={options.L_Widget_Position?.left ?? 0}
              onChange={(value) =>
                onChange({
                  ...options,
                  L_Widget_Position: {
                    ...options.L_Widget_Position,
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
      <SidePanel.Section title="Widget Z-Index" />
      <SidePanel.Field>
        <FieldSet
          gap="small"
          legend="Z-Index"
          infoContent="This is the z-index of the widget."
          columns="auto 80px"
        >
          <Slider
            onChange={(value) => {
              const numValue = Array.isArray(value) ? value[0] : value;
              setZIndexValue(numValue);
              debouncedOnChange(numValue);
            }}
            min={0}
            max={100000}
            step={10}
            value={zIndexValue}
            displayMarks={false}
          />
          <NumberInput
            size="small"
            min={0}
            max={100000}
            step={1}
            value={zIndexValue}
            onChange={debouncedZIndexChange}
            hideStepper
          />
        </FieldSet>
      </SidePanel.Field>
    </SidePanel.Content>
  );
};

export default PanelPositionDesktop;
