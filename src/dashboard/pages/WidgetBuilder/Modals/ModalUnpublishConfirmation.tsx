import React from "react";
import { MessageModalLayout, Modal, Text } from "@wix/design-system";

interface ModalUnpublishConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onUnpublish: () => void;
  isUnpublishing?: boolean;
}

const ModalUnpublishConfirmation: React.FC<ModalUnpublishConfirmationProps> = ({
  isOpen,
  onClose,
  onUnpublish,
  isUnpublishing,
}) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose}>
      <MessageModalLayout
        title="Unpublish Widget?"
        content={
          <Text>
            Are you sure you want to unpublish this widget? It will be hidden
            from your live site, but you can publish it again at any time.
          </Text>
        }
        primaryButtonText={isUnpublishing ? "Unpublishing..." : "Unpublish"}
        secondaryButtonText="Cancel"
        primaryButtonOnClick={onUnpublish}
        secondaryButtonOnClick={onClose}
        onCloseButtonClick={onClose}
        primaryButtonProps={{ disabled: isUnpublishing }}
      />
    </Modal>
  );
};

export default ModalUnpublishConfirmation;
