import React from "react";
import { MessageModalLayout, Modal, Text } from "@wix/design-system";

interface ModalDiscardConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
  isDiscarding?: boolean;
}

const ModalDiscardConfirmation: React.FC<ModalDiscardConfirmationProps> = ({
  isOpen,
  onClose,
  onDiscard,
  isDiscarding,
}) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose}>
      <MessageModalLayout
        title="Discard Changes?"
        content={
          <Text>
            Are you sure you want to discard all draft changes? This will revert
            your widget to the last published version.
          </Text>
        }
        primaryButtonText={isDiscarding ? "Discarding..." : "Discard Changes"}
        secondaryButtonText="Cancel"
        primaryButtonOnClick={onDiscard}
        secondaryButtonOnClick={onClose}
        onCloseButtonClick={onClose}
        theme="destructive"
        primaryButtonProps={{ disabled: isDiscarding }}
      />
    </Modal>
  );
};

export default ModalDiscardConfirmation;
