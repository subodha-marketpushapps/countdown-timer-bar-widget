import React from "react";
import { Box, FormField, SidePanel, RadioGroup } from "@wix/design-system";

import { WidgetStyles } from "../../../../../interfaces";
import { DEFAULT_PANEL_WIDTH } from "../SidePanelContainer";
import { useRecoilState } from "recoil";
import { editorState } from "../../../../services/state";
import { renderSectionTitle } from "../utils";

interface Props {
  options: WidgetStyles;
  onChange: (options: WidgetStyles) => void;
  onCloseButtonClick: () => void;
}

const PanelPosition: React.FC<Props> = ({
  onCloseButtonClick,
  options,
  onChange,
}) => {
  const [editorStateData, setEditorStateData] = useRecoilState(editorState);

  const handleCloseSidePanel = () => {
    onCloseButtonClick();
  };

  const handleTabChange = (value: string | number) => {
    setEditorStateData((prevState) => ({
      ...prevState,
      viewType: String(value),
    }));
  };



  return (
    <SidePanel
      onCloseButtonClick={handleCloseSidePanel}
      width={DEFAULT_PANEL_WIDTH}
      maxHeight="100%"
    >
      <SidePanel.Header title="Position" showDivider={false}>
    
      </SidePanel.Header>
      <SidePanel.Section title={renderSectionTitle("Position")}>
          <SidePanel.Field divider={false}>
            <FormField>
              <RadioGroup
                value={options.L_Widget_Position || "floating_top"}
                onChange={(value) => onChange({ ...options, L_Widget_Position: value as any })}
                display="vertical"
              >
                <RadioGroup.Radio value="centered_overlay">
                  Centered Overlay Banner
                </RadioGroup.Radio>
                <RadioGroup.Radio value="static_top">
                  Static Top Banner
                </RadioGroup.Radio>
                <RadioGroup.Radio value="floating_top">
                  Floating Top Banner
                </RadioGroup.Radio>
                <RadioGroup.Radio value="floating_bottom">
                  Floating Bottom Banner
                </RadioGroup.Radio>
              </RadioGroup>
            </FormField>
          </SidePanel.Field>
        </SidePanel.Section>
      
    </SidePanel>
  );
};

export default PanelPosition;
