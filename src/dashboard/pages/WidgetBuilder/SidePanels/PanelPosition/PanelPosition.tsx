import React from "react";
import { SidePanel, Tabs } from "@wix/design-system";

import { WidgetStyles } from "../../../../../interfaces";
import SubPanelPositionDesktop from "./SubPanelPositionDesktop";
import SubPanelPositionMobile from "./SubPanelPositionMobile";
import { DEFAULT_PANEL_WIDTH } from "../SidePanelContainer";
import { useRecoilState } from "recoil";
import { editorState } from "../../../../services/state";

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

  const renderSettingsPanel = () => (
    <SidePanel
      onCloseButtonClick={handleCloseSidePanel}
      width={DEFAULT_PANEL_WIDTH}
      maxHeight="100%"
    >
      <SidePanel.Header title="Position settings" showDivider={false}>
        <Tabs
          items={[
            { id: "desktopView", title: "Desktop" },
            { id: "mobileView", title: "Mobile" },
          ]}
          activeId={editorStateData.viewType}
          type="uniformSide"
          width="114px"
          onClick={(value) => handleTabChange(value.id)}
        />
      </SidePanel.Header>
      {editorStateData.viewType === "desktopView" && (
        <SubPanelPositionDesktop
          options={options}
          onChange={(positionOptions) =>
            onChange({
              ...options,
              ...positionOptions,
            })
          }
        />
      )}
      {editorStateData.viewType === "mobileView" && (
        <SubPanelPositionMobile
          options={options}
          onChange={(positionOptions) =>
            onChange({
              ...options,
              ...positionOptions,
            })
          }
        />
      )}
    </SidePanel>
  );

  return <>{renderSettingsPanel()}</>;
};

export default PanelPosition;
