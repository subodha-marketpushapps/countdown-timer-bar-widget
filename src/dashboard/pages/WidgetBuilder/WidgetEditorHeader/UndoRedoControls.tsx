import React, { useEffect } from "react";
import { ToggleButton } from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";
import { useRecoilState } from "recoil";
import { draftWidgetState } from "../../../services/state";
import { useHistoryState } from "../../../hooks/useHistoryState";
import { isMacOS } from "../../../utils/helpers";

const UndoRedoControls: React.FC = () => {
  const [draft, setDraft] = useRecoilState(draftWidgetState);
  const { undo, redo, canUndo, canRedo } = useHistoryState(draft, setDraft);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = isMacOS();
      const isUndo =
        (isMac && event.metaKey && event.key === "z") ||
        (!isMac && event.ctrlKey && event.key === "z");
      const isRedo =
        (isMac && event.metaKey && event.shiftKey && event.key === "z") ||
        (!isMac && event.ctrlKey && event.key === "y");

      if (isUndo && canUndo) {
        event.preventDefault();
        undo();
      }

      if (isRedo && canRedo) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo, canUndo, canRedo]);

  return (
    <>
      <ToggleButton labelValue="Undo" onClick={undo} disabled={!canUndo}>
        <Icons.Undo />
      </ToggleButton>
      <ToggleButton labelValue="Redo" onClick={redo} disabled={!canRedo}>
        <Icons.Redo />
      </ToggleButton>
    </>
  );
};

export default UndoRedoControls;
