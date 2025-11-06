import React from "react";
import { MessageModalLayout, Modal, Text } from "@wix/design-system";

interface ModalLeaveConfirmationProps {
  onLeavePageClicked: () => void;
  onModalClosed: () => void;
  isModalOpened: boolean;
  onSaveAndLeave?: () => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
}

const ModalLeaveConfirmation: React.FC<ModalLeaveConfirmationProps> = ({
  onLeavePageClicked,
  onModalClosed,
  isModalOpened,
  onSaveAndLeave,
  isSaving,
  hasUnsavedChanges = false,
}) => {
  const renderModalContent = () => {
    if (hasUnsavedChanges && onSaveAndLeave) {
      // New version with Save & Leave option
      return (
        <MessageModalLayout
          onCloseButtonClick={onModalClosed}
          primaryButtonOnClick={onSaveAndLeave}
          secondaryButtonOnClick={onLeavePageClicked}
          primaryButtonText={isSaving ? "Saving..." : "Save & Leave"}
          secondaryButtonText="Leave Without Saving"
          title="Unsaved Changes"
          content={
            <Text>
              You have unsaved changes that will be lost if you leave now. Would
              you like to save your changes first?
            </Text>
          }
          theme="standard"
          primaryButtonProps={{ disabled: isSaving }}
        />
      );
    } else {
      // Original version for backward compatibility
      return (
        <MessageModalLayout
          onCloseButtonClick={onModalClosed}
          primaryButtonOnClick={onLeavePageClicked}
          secondaryButtonOnClick={onModalClosed}
          primaryButtonText="Leave Page"
          secondaryButtonText="Cancel"
          title="Leave page?"
          content={
            <Text>When you leave this page, you'll lose unsaved changes.</Text>
          }
          theme="standard"
        />
      );
    }
  };

  return (
    <Modal isOpen={isModalOpened} onRequestClose={onModalClosed}>
      {renderModalContent()}
    </Modal>
  );
};

export default ModalLeaveConfirmation;
