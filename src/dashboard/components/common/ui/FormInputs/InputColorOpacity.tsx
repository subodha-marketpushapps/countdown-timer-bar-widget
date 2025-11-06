import React, { useState, useCallback } from "react";
import {
  SidePanel,
  FieldSet,
  Popover,
  FillPreview,
  ColorPicker,
  Swatches,
  Box,
  Slider,
  NumberInput,
  Input,
} from "@wix/design-system";

interface InputColorOpacityProps {
  label: string;
  infoContent: string;
  value: string;
  onChange: (color: string | object) => void;
}

const InputColorOpacity: React.FC<InputColorOpacityProps> = ({
  label,
  infoContent,
  value,
  onChange,
}) => {
  const colorHex = value.slice(0, 7);
  const [isPopoverShown, setIsPopoverShown] = useState(false);
  const [previousColor, setPreviousColor] = useState(colorHex);
  const [opacity, setOpacity] = useState(() => {
    // Only extract opacity if the value is exactly 9 characters (#RRGGBBAA)
    if (value.length === 9) {
      const opacityHex = value.slice(7, 9);
      const opacityValue = parseInt(opacityHex, 16);
      return isNaN(opacityValue) ? 100 : Math.round((opacityValue / 255) * 100);
    }
    return 100; // Default to 100% opacity
  });
  const [currentColor, setCurrentColor] = useState(colorHex);

  const presets = ["#008069", "#24D366", "#113E2D", "#E5DDD5"];

  // Helper function to combine color and opacity into a single hex value
  const combineColorAndOpacity = useCallback(
    (color: string, opacity: number) => {
      const baseColor = color.slice(0, 7).toUpperCase();
      const alphaHex = Math.round((opacity / 100) * 255)
        .toString(16)
        .padStart(2, "0")
        .toUpperCase();
      return `#${baseColor.replace("#", "")}${alphaHex}`;
    },
    []
  );

  // Handle color and opacity changes
  const handleColorChange = useCallback(
    (color: string, newOpacity: number = opacity) => {
      const updatedColor = combineColorAndOpacity(color, newOpacity);
      onChange(updatedColor);
      setCurrentColor(updatedColor);
    },
    [combineColorAndOpacity, onChange, opacity]
  );

  // Revert to the previous color and opacity
  const revertToPreviousColor = useCallback(() => {
    const opacityHex =
      previousColor.length === 9 ? previousColor.slice(7, 9) : "FF";
    const opacityValue = parseInt(opacityHex, 16);
    const previousOpacity = isNaN(opacityValue) 
      ? 100 
      : Math.round((opacityValue / 255) * 100);
    setOpacity(previousOpacity);
    handleColorChange(previousColor.slice(0, 7), previousOpacity);
  }, [previousColor, handleColorChange]);

  return (
    <SidePanel.Field>
      <FieldSet
        legend={label}
        legendSize="small"
        legendPlacement="top"
        alignment="center"
        columns="30px auto 67px"
        infoContent={infoContent}
      >
        {/* Color Picker Popover */}
        <Popover
          showArrow
          shown={isPopoverShown}
          appendTo="window"
          onClick={() => {
            setIsPopoverShown(!isPopoverShown);
            setPreviousColor(currentColor);
          }}
          onClickOutside={() => setIsPopoverShown(false)}
        >
          <Popover.Element>
            <FillPreview fill={currentColor} aspectRatio={1} />
          </Popover.Element>
          <Popover.Content>
            <ColorPicker
              value={currentColor.slice(0, 7)}
              onCancel={() => {
                setIsPopoverShown(false);
                revertToPreviousColor();
              }}
              onConfirm={(value) => {
                setIsPopoverShown(false);
                handleColorChange(value.hex());
              }}
              onChange={(value) => {
                handleColorChange(value.hex());
              }}
            >
              {({ changeColor }: { changeColor: (color: string) => void }) => (
                <Swatches
                  colors={presets}
                  onClick={(presetColor: string) => {
                    changeColor(presetColor);
                  }}
                />
              )}
            </ColorPicker>
          </Popover.Content>
        </Popover>

        {/* Opacity Slider */}
        <Box margin="0 8px">
          <Slider
            gradientColor={currentColor.slice(0, 7)}
            min={0}
            max={100}
            displayMarks={false}
            onChange={(newOpacity) => {
              const opacityValue = Array.isArray(newOpacity)
                ? newOpacity[0]
                : newOpacity;
              setOpacity(opacityValue);
              handleColorChange(currentColor.slice(0, 7), opacityValue);
            }}
            value={opacity}
          />
        </Box>

        {/* Opacity Number Input */}
        <NumberInput
          value={opacity}
          min={0}
          max={100}
          onChange={(newOpacity) => {
            const opacityValue = newOpacity ?? 0;
            setOpacity(opacityValue);
            handleColorChange(currentColor.slice(0, 7), opacityValue);
          }}
          suffix={<Input.Affix>%</Input.Affix>}
          size="small"
          hideStepper
        />
      </FieldSet>
    </SidePanel.Field>
  );
};

export default InputColorOpacity;
