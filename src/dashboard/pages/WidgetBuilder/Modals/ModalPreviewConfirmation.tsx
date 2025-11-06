import React from "react";
import { MessageModalLayout, Modal, Loader, Text } from "@wix/design-system";

export type PreviewModalType = "notPublished" | "hidden" | "unpublishedChanges";

interface ModalPreviewConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  type: PreviewModalType;
  isPublishing?: boolean;
  onPublish?: () => void;
  onMakeVisible?: () => void;
  onPreviewAnyway?: () => void;
}

const getModalContent = (
  type: PreviewModalType,
  isPublishing?: boolean
): {
  title: string;
  content: React.ReactNode;
  primaryText: string;
  secondaryText: string;
  theme?: "standard" | "premium" | "destructive";
} => {
  switch (type) {
    case "notPublished":
      return {
        title: "Widget Not Published",
        content: (
          <Text>
            To preview your widget on the live site, you need to publish it
            first.
          </Text>
        ),
        primaryText: "Publish & Preview",
        secondaryText: "Cancel",
        theme: "standard" as const,
      };
    case "hidden":
      return {
        title: "Widget is Hidden",
        content: (
          <Text>
            Your widget is currently hidden and will not appear on your live
            site. Please make it visible to preview.
          </Text>
        ),
        primaryText: "Make Visible & Preview",
        secondaryText: "Cancel",
        theme: "standard" as const,
      };
    case "unpublishedChanges":
      return {
        title: "Unpublished Changes",
        content: (
          <Text>
            You have unpublished changes. To see them on your live site, publish
            first. Or, you can preview the currently published version (your
            changes will not be visible).
          </Text>
        ),
        primaryText: "Publish & Preview",
        secondaryText: "Preview Anyway",
        theme: "standard" as const,
      };
    default:
      return {
        title: "Preview Confirmation",
        content: <Text>Ready to preview?</Text>,
        primaryText: "OK",
        secondaryText: "Cancel",
        theme: "standard" as const,
      };
  }
};

const ModalPreviewConfirmation: React.FC<ModalPreviewConfirmationProps> = ({
  isOpen,
  onClose,
  type,
  isPublishing,
  onPublish,
  onMakeVisible,
  onPreviewAnyway,
}) => {
  const { title, content, primaryText, secondaryText, theme } = getModalContent(
    type,
    isPublishing
  );

  const handlePrimary = () => {
    if (type === "notPublished" || type === "unpublishedChanges") {
      onPublish && onPublish();
    } else if (type === "hidden") {
      onMakeVisible && onMakeVisible();
    }
  };

  const handleSecondary = () => {
    if (type === "unpublishedChanges") {
      onPreviewAnyway && onPreviewAnyway();
    } else {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose}>
      <MessageModalLayout
        title={title}
        content={content}
        primaryButtonText={
          isPublishing ? (
            <>
              <Loader size="tiny" /> {primaryText}
            </>
          ) : (
            primaryText
          )
        }
        secondaryButtonText={secondaryText}
        primaryButtonOnClick={handlePrimary}
        secondaryButtonOnClick={handleSecondary}
        onCloseButtonClick={onClose}
        theme={theme}
        primaryButtonProps={{ disabled: isPublishing }}
      />
    </Modal>
  );
};

export default ModalPreviewConfirmation;
