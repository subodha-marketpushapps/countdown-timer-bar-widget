import React from "react";
import { SidePanel, Tabs } from "@wix/design-system";

import { WidgetStyles } from "../../../../../interfaces";
import SubPanelLayoutDesktop from "./SubPanelLayoutDesktop";
import SubPanelLayoutMobile from "./SubPanelLayoutMobile";
import { DEFAULT_PANEL_WIDTH } from "../SidePanelContainer";
import { useRecoilState } from "recoil";
import { editorState } from "../../../../services/state";

interface Props {
  options: WidgetStyles;
  onChange: (options: WidgetStyles) => void;
  onCloseButtonClick: () => void;
}

const PanelLayout: React.FC<Props> = ({
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
      <SidePanel.Header title="Layout settings" showDivider={false}>
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
        <SubPanelLayoutDesktop
          options={options}
          onChange={(changedOptions) =>
            onChange({
              ...options,
              ...changedOptions,
            })
          }
        />
      )}
      {editorStateData.viewType === "mobileView" && (
        <SubPanelLayoutMobile
          options={options}
          onChange={(changedOptions) =>
            onChange({
              ...options,
              ...changedOptions,
            })
          }
        />
      )}
    </SidePanel>
  );

  return <>{renderSettingsPanel()}</>;
};

export default PanelLayout;
