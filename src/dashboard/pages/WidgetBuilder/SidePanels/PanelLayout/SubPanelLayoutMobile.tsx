import React from "react";
import {
  FieldSet,
  Input,
  NumberInput,
  SidePanel,
  Slider,
} from "@wix/design-system";

// import InputCornerRadius from "../../../../components/ui/FormInputs/InputCornerRadius";

import { WidgetStyles } from "../../../../../interfaces";
import { InputCornerRadius } from "../../../../components/common/ui/FormInputs";

interface Props {
  options: WidgetStyles;
  onChange: (options: WidgetStyles) => void;
}

const PanelPositionDesktop: React.FC<Props> = ({ options, onChange }) => {
  return (
    <SidePanel.Content noPadding>
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
                L_Badge_Size_Mobile: Array.isArray(value) ? value[0] : value,
              });
            }}
            min={1}
            max={5}
            step={0.2}
            value={options.L_Badge_Size_Mobile}
            displayMarks={false}
          />
          <NumberInput
            size="small"
            min={1}
            max={5}
            step={0.2}
            value={options.L_Badge_Size_Mobile}
            onChange={(value) =>
              onChange({
                ...options,
                L_Badge_Size_Mobile: Number(value),
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
            value={options.L_Badge_CornerRounding_Mobile}
            onChange={(value) =>
              onChange({
                ...options,
                L_Badge_CornerRounding_Mobile: value,
              })
            }
          />
        </FieldSet>
      </SidePanel.Field>
    </SidePanel.Content>
  );
};

export default PanelPositionDesktop;
