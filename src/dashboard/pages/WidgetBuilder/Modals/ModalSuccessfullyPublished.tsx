import React from "react";
import {
  Modal,
  AnnouncementModalLayout,
  Box,
  Text,
  Input,
  TextButton,
  CopyClipboard,
} from "@wix/design-system";
import * as Icons from "@wix/wix-ui-icons-common";

interface ModalSuccessfullyPublishedProps {
  isOpen: boolean;
  onClose: () => void;
  onPreview: () => void;
  siteUrl?: string;
}

const ModalSuccessfullyPublished: React.FC<ModalSuccessfullyPublishedProps> = ({
  isOpen,
  onClose,
  onPreview,
  siteUrl,
}) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} shouldCloseOnOverlayClick>
      <AnnouncementModalLayout
        title="🎉 Congratulations!"
        primaryButtonText="Preview on Live Site"
        primaryButtonOnClick={onPreview}
        primaryButtonProps={{
          prefixIcon: <Icons.ExternalLink />,
        }}
        secondaryButtonText="Continue Editing"
        secondaryButtonOnClick={onClose}
        onCloseButtonClick={onClose}
      >
        <Box direction="vertical" gap={3}>
          <Text>
            Your widget is now live on your website and ready for your visitors
            to interact with.
          </Text>

          {/* Site URL display (if available) */}
          {siteUrl && (
            <Box direction="vertical" gap={1}>
              <Text size="small" secondary>
                Your widget is now live on:
              </Text>
              <CopyClipboard value={siteUrl} resetTimeout={1500}>
                {({ isCopied, copyToClipboard }) => (
                  <Input
                    readOnly
                    value={siteUrl}
                    size="small"
                    suffix={
                      <Box verticalAlign="middle" marginRight="SP1">
                        <TextButton
                          onClick={() => copyToClipboard()}
                          size="small"
                          prefixIcon={<Icons.DuplicateSmall />}
                        >
                          {!isCopied ? "Copy" : "Copied!"}
                        </TextButton>
                      </Box>
                    }
                  />
                )}
              </CopyClipboard>
            </Box>
          )}
        </Box>
      </AnnouncementModalLayout>
    </Modal>
  );
};

export default ModalSuccessfullyPublished;
