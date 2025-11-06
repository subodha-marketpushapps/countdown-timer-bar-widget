import React, { useState } from "react";
import { SidePanel, Tabs } from "@wix/design-system";

import { WidgetStyles } from "../../../../../interfaces";
import SubPanelThemes from "./SubPanelThemes.js";
import SubPanelAdvance from "./SubPanelAdvance.js";
import { DEFAULT_PANEL_WIDTH } from "../SidePanelContainer";

interface Props {
  options: WidgetStyles;
  onChange: (options: WidgetStyles) => void;
  onCloseButtonClick: () => void;
}

const PanelDesign: React.FC<Props> = ({
  onCloseButtonClick,
  options,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleCloseSidePanel = () => {
    onCloseButtonClick();
  };

  const renderSettingsPanel = () => (
    <SidePanel
      onCloseButtonClick={handleCloseSidePanel}
      width={DEFAULT_PANEL_WIDTH}
      maxHeight="100%"
    >
      <SidePanel.Header title="Design settings" showDivider={false}>
        <Tabs
          items={[
            { id: 0, title: "General" },
            { id: 1, title: "Advanced" },
          ]}
          activeId={activeTab}
          type="uniformSide"
          width="114px"
          onClick={(value) => setActiveTab(Number(value.id))}
        />
      </SidePanel.Header>
      {activeTab === 0 && (
        <SidePanel.Content>
          <SubPanelThemes
            options={options}
            onChange={(themeOptions) =>
              onChange({
                ...options,
                ...themeOptions,
              })
            }
          />
        </SidePanel.Content>
      )}
      {activeTab === 1 && (
        <SubPanelAdvance
          options={options}
          onChange={(colors) =>
            onChange({
              ...options,
              ...colors,
            })
          }
        />
      )}
    </SidePanel>
  );

  return <>{renderSettingsPanel()}</>;
};

export default PanelDesign;
