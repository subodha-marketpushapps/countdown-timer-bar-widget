import React, { useState, useEffect, useMemo } from "react";
import { debounce } from "lodash";
import { CornerRadiusInput } from "@wix/design-system";
import { CornerRadius } from "../../../../interfaces";

interface InputCornerRadiusProps {
  value: CornerRadius;
  onChange: (updatedOptions: CornerRadius) => void;
}

const InputCornerRadius: React.FC<InputCornerRadiusProps> = ({
  value = {
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0,
    linked: true,
  },
  onChange,
}) => {
  const [cornerRadius, setCornerRadius] = useState<CornerRadius>(value);

  // Memoize debounced function to prevent recreation on every render
  const debouncedUpdate = useMemo(
    () => debounce((updatedOptions: CornerRadius) => {
      onChange(updatedOptions);
    }, 100),
    [onChange]
  );

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedUpdate.cancel();
    };
  }, [debouncedUpdate]);

  useEffect(() => {
    debouncedUpdate(cornerRadius);
  }, [cornerRadius, debouncedUpdate]);

  const handleCornerChange = (corner: keyof CornerRadius, newValue: number) => {
    const updatedOptions = {
      ...cornerRadius,
      [corner]: newValue,
    };

    if (cornerRadius.linked) {
      updatedOptions.topLeft = newValue;
      updatedOptions.topRight = newValue;
      updatedOptions.bottomLeft = newValue;
      updatedOptions.bottomRight = newValue;
    }

    setCornerRadius(updatedOptions);
  };

  return (
    <CornerRadiusInput
      size="small"
      linkingButtonLabels={{
        pressed: "Edit individually",
        unpressed: "Apply to all corners",
      }}
      linked={cornerRadius.linked}
      topLeft={{
        value: cornerRadius.topLeft,
        ariaLabel: "Top left corner",
        onChange: (e) => handleCornerChange("topLeft", e ?? 0),
      }}
      topRight={{
        value: cornerRadius.topRight,
        ariaLabel: "Top right corner",
        onChange: (e) => handleCornerChange("topRight", e ?? 0),
      }}
      bottomLeft={{
        value: cornerRadius.bottomLeft,
        ariaLabel: "Bottom left corner",
        onChange: (e) => handleCornerChange("bottomLeft", e ?? 0),
      }}
      bottomRight={{
        value: cornerRadius.bottomRight,
        ariaLabel: "Bottom right corner",
        onChange: (e) => handleCornerChange("bottomRight", e ?? 0),
      }}
      onLinkedToggle={(isLinked) => {
        setCornerRadius({
          ...cornerRadius,
          linked: isLinked,
          topLeft: isLinked ? cornerRadius.topLeft : 0,
          topRight: isLinked ? cornerRadius.topRight : 0,
        });
      }}
    />
  );
};

export default InputCornerRadius;
