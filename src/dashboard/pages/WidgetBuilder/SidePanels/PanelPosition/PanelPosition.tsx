import React from "react";
import { Box, FormField, SidePanel, Radio } from "@wix/design-system";

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
              <Box direction="vertical" gap="8px">
                <Radio label="Centered Overlay Banner" value="centered_overlay" />
                <Radio label="Static Top Banner" value="static_top" />
                <Radio label="Floating Top Banner" value="floating_top" />
                <Radio label="Floating Bottom Banner" value="floating_bottom" />
              </Box>
            </FormField>
          </SidePanel.Field>
        </SidePanel.Section>
      
    </SidePanel>
  );
};

export default PanelPosition;
