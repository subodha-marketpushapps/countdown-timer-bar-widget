import React from "react";
import { Box } from "@wix/design-system";

interface SidePanelContainerProps {
  children: React.ReactNode;
  isShowing: boolean;
}

export const DEFAULT_PANEL_WIDTH = 300;

const SidePanelContainer: React.FC<SidePanelContainerProps> = ({
  children,
  isShowing,
}) => {
  if (!isShowing) {
    return null;
  }
  return (
    <Box width={`${DEFAULT_PANEL_WIDTH}px`} height="100%" backgroundColor="D80">
      {/* <Transition
        show={isShowing}
        enterAnimation={{
          moveIn: {
            direction: "leftToRight",
            distance: "20px",
            duration: "slow02",
            easing: "enterEasing",
          },
        }}
        exitAnimation={{
          moveOut: {
            direction: "rightToLeft",
            distance: "50px",
            duration: "slow02",
            easing: "exitEasing",
          },
        }}
      > */}
      {children}
      {/* </Transition> */}
    </Box>
  );
};

export default SidePanelContainer;
