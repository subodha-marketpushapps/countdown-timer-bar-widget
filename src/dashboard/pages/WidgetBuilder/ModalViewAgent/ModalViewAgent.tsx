import React, { useState, useEffect, useCallback } from "react";
import * as Yup from "yup";

import {
  Card,
  Modal,
  CustomModalLayout,
  Box,
  Layout,
  Cell,
  FormField,
  Input,
  ToggleSwitch,
  InputArea,
  SegmentedToggle,
  SectionHelper,
} from "@wix/design-system";
import { ImagePicker } from "../../../../dashboard/components/ui/FormInputs/ImagePicker";
import { WhatsAppAgent } from "../../../../interfaces";
import InputAvailableTime from "./InputAvailableTime";
import InputAvailableWeekDays from "./InputAvailableWeekDays";
import { InputMobileNumber } from "../../../../dashboard/components/ui/FormInputs";
import MemberChat from "../../../../components/WidgetWhatsappChat/MemberChat";
import { useRecoilState } from "recoil";
import { draftWidgetState } from "../../../../dashboard/services/state";
import ChatContent from "../../../../components/WidgetWhatsappChat/ChatContent/ChatContent";
import { ChatHeader } from "../../../../components/WidgetWhatsappChat/ChatHeader";
import MemberDetails from "../../../../components/WidgetWhatsappChat/MemberDetails";


interface ModalViewAgentProps {
  isModalOpened: boolean;
  selectedAgent: WhatsAppAgent;
  onSave: (agent: WhatsAppAgent) => void;
  onModalClosed: () => void;
}

const ModalViewAgent: React.FC<ModalViewAgentProps> = ({
  isModalOpened,
  selectedAgent,
  onSave,
  onModalClosed,
}) => {
  // Ensure statusIndicator is always present with proper defaults
  const defaultStatusIndicator = {
    indicator: "bulb" as const,
    textOnline: "Online",
    textOffline: "Offline",
  };

  const agentWithDefaults: WhatsAppAgent = {
    ...selectedAgent,
    statusIndicator: {
      ...defaultStatusIndicator,
      ...selectedAgent.statusIndicator,
    },
  };

  const [agent, setAgent] = useState<WhatsAppAgent>(agentWithDefaults);
  const [widgetState] = useRecoilState(draftWidgetState);
  const { styles: widgetStyles, content: widgetContent } = widgetState;

  const isAgentNew = agent.id.includes("new");

  const [errors, setErrors] = useState<{
    [key: string]: string;
  }>({});

  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [hasAttemptedSave, setHasAttemptedSave] = useState<boolean>(false);
  const [touched, setTouched] = useState<{
    [key: string]: boolean;
  }>({});
  const [isPhoneValid, setIsPhoneValid] = useState<boolean>(!!selectedAgent.phoneNumber);
  const [phoneError, setPhoneError] = useState<string>(
    selectedAgent.phoneNumber ? "" : "Phone number is required",
  );

  // Enhanced validation schema with better error messages following Wix guidelines
  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Please enter a member name")
      .max(80, "Member name can be up to 80 characters"),
    role: Yup.string().max(40, "Role can be up to 40 characters"),
    // phoneNumber validation removed - handled by InputMobileNumber component
    introMessage: Yup.string()
      .required("Please enter a hello message")
      .min(3, "Hello message must be at least 3 characters")
      .max(500, "Hello message can be up to 500 characters"),
    initialMessage: Yup.string().max(500, "Initial message can be up to 500 characters"),
    statusIndicator: Yup.object({
      textOnline: Yup.string().when("indicator", {
        is: (val: string) => val === "text" || val === "both",
        then: (schema) =>
          schema
            .required("Please enter text for online status")
            .max(32, "Online text can be up to 32 characters"),
        otherwise: (schema) => schema.notRequired(),
      }),
      textOffline: Yup.string().when("indicator", {
        is: (val: string) => val === "text" || val === "both",
        then: (schema) => schema.max(32, "Offline text can be up to 32 characters"),
        otherwise: (schema) => schema.notRequired(),
      }),
    }),
  });

  // Comprehensive form validation function
  const validateForm = useCallback(async (): Promise<boolean> => {
    try {
      await validationSchema.validate(agent, { abortEarly: false });
      setErrors({});
      // Form is valid only if both schema validation passes AND phone is valid AND has no phone errors
      const formIsValid = !!agent.phoneNumber && isPhoneValid && !phoneError;
      setIsFormValid(formIsValid);
      return formIsValid;
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors: { [key: string]: string } = {};
        err.inner.forEach((error) => {
          if (error.path) {
            // Handle nested paths like statusIndicator.textOnline
            const pathParts = error.path.split(".");
            if (pathParts.length > 1) {
              validationErrors[pathParts.join(".")] = error.message;
            } else {
              validationErrors[error.path] = error.message;
            }
          }
        });
        setErrors(validationErrors as any);
      }
      setIsFormValid(false);
      return false;
    }
  }, [agent, validationSchema, isPhoneValid, phoneError]);

  // Enhanced field validation with better UX
  const validateField = useCallback(
    async (fieldName: keyof WhatsAppAgent | string): Promise<void> => {
      try {
        // Handle nested validation for statusIndicator fields and flat fields
        await validationSchema.validateAt(fieldName, agent);

        // Clear error for this field
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      } catch (err) {
        if (err instanceof Yup.ValidationError) {
          setErrors((prev) => ({ ...prev, [fieldName]: err.message }));
        }
      }
    },
    [agent, validationSchema],
  );

  // Handle field blur with validation
  const handleFieldBlur = useCallback(
    (fieldName: keyof WhatsAppAgent | string, value?: any) => {
      setTouched((prev) => ({ ...prev, [fieldName]: true }));
      if (touched[fieldName as keyof WhatsAppAgent] || value) {
        validateField(fieldName);
      }
    },
    [touched, validateField],
  );

  // Initial phone validation is derived from initial state above; no mount-effect needed

  // Reset phone validation if phone number is cleared
  useEffect(() => {
    if (!agent.phoneNumber) {
      setIsPhoneValid(false);
      setPhoneError("Phone number is required");
    }
  }, [agent.phoneNumber]);

  // Validate form whenever agent data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateForm();
    }, 300); // Debounce validation

    return () => clearTimeout(timeoutId);
  }, [agent, validateForm]);

  // Enhanced save handler with validation
  const handleSave = useCallback(async () => {
    setHasAttemptedSave(true);
    
    const isValid = await validateForm();

    if (!isValid) {
      // Focus on first error field for better accessibility
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element =
          document.getElementById(firstErrorField) ||
          document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.focus();
        }
      }
      return;
    }

    onSave(agent);
  }, [agent, errors, onSave, validateForm]);

  return (
    <Modal isOpen={isModalOpened} onRequestClose={onModalClosed} screen="desktop" zIndex={99}>
      <CustomModalLayout
        primaryButtonText={isAgentNew ? "Create Member" : "Save Changes"}
        secondaryButtonText="Cancel"
        onCloseButtonClick={onModalClosed}
        secondaryButtonOnClick={onModalClosed}
        primaryButtonOnClick={handleSave}
        primaryButtonProps={{
          disabled: hasAttemptedSave && !isFormValid,
        }}
        removeContentPadding
        title={isAgentNew ? "Add new member" : "Edit member"}
        width={928}
        content={
          <Box display="block" backgroundColor="D70" padding="24px">
            <Layout>
              {!agent.isVisible && (
                <Cell>
                  <SectionHelper showPrefixIcon fullWidth>
                    This member is currently hidden from users in the widget. To make this member
                    visible, please enable the &quot;Visible&quot; toggle.
                  </SectionHelper>
                </Cell>
              )}

              {/* Card Member Details */}
              <Cell span={7}>
                <Card>
                  <Card.Header
                    title="Member Details"
                    suffix={
                      <FormField labelPlacement="left" label="Visible">
                        <ToggleSwitch
                          checked={agent.isVisible}
                          onChange={() => {
                            setAgent((prev) => ({
                              ...prev,
                              isVisible: !agent.isVisible,
                            }));
                          }}
                          size="medium"
                        />
                      </FormField>
                    }
                  />
                  <Card.Divider />
                  <Card.Content>
                    <Layout height={176}>
                      <Cell span={4}>
                        <FormField
                          label="Profile Image"
                          status={errors.imageUrl ? "error" : undefined}
                          statusMessage={errors.imageUrl}
                          infoContent="Upload an image that matches the member's WhatsApp profile photo."
                        >
                          <ImagePicker
                            imageUrl={agent.imageUrl || ""}
                            onChange={(imageUrl) => {
                              setAgent((prev) => ({
                                ...prev,
                                imageUrl,
                              }));
                            }}
                            frameWidth="100%"
                            frameHeight="140px"
                            requestOptions={{
                              width: 120,
                              height: 120,
                            }}
                          />
                        </FormField>
                      </Cell>
                      <Cell span={8}>
                        <Layout>
                          <Cell>
                            <FormField
                              label="Member Name"
                              required
                              charCount={80 - agent.name.length}
                              infoContent="Use the same name as the WhatsApp account for consistency."
                              status={errors.name ? "error" : undefined}
                              statusMessage={errors.name}
                            >
                              <Input
                                id="name"
                                name="name"
                                placeholder="Enter member name"
                                value={agent.name}
                                required
                                onChange={(e) =>
                                  setAgent((prev) => ({
                                    ...prev,
                                    name: e.currentTarget.value,
                                  }))
                                }
                                onBlur={() => handleFieldBlur("name")}
                                aria-describedby={errors.name ? "name-error" : undefined}
                              />
                            </FormField>
                          </Cell>
                          <Cell>
                            <FormField
                              label="Role (optional)"
                              charCount={40 - (agent.role?.length || 0)}
                              status={errors.role ? "error" : undefined}
                              statusMessage={errors.role}
                            >
                              <Input
                                id="role"
                                name="role"
                                placeholder="e.g., Support Team, Sales Agent"
                                value={agent.role}
                                onChange={(e) =>
                                  setAgent((prev) => ({
                                    ...prev,
                                    role: e.currentTarget.value,
                                  }))
                                }
                                onBlur={() => handleFieldBlur("role")}
                                aria-describedby={errors.role ? "role-error" : undefined}
                              />
                            </FormField>
                          </Cell>
                        </Layout>
                      </Cell>
                    </Layout>
                  </Card.Content>
                </Card>
              </Cell>

              {/* Card Availability */}
              <Cell span={5}>
                <Card>
                  <Card.Header title="Availability" />
                  <Card.Divider />
                  <Card.Content>
                    <Layout gap="24px" height={176}>
                      <Cell>
                        <InputAvailableWeekDays
                          agent={agent}
                          onChange={(weekDays) => {
                            setAgent((prev) => {
                              const newAvailableTime = {
                                ...prev.availableTime,
                                availableDays: weekDays,
                              };
                              return {
                                ...prev,
                                availableTime: newAvailableTime,
                              };
                            });
                          }}
                        />
                      </Cell>
                      <Cell>
                        <InputAvailableTime
                          agent={agent}
                          onStartHourChange={(startHour) => {
                            setAgent((prev) => {
                              const newAvailableTime = {
                                endHour: prev.availableTime?.endHour || 0,
                                startHour: startHour || 0,
                                availableDays: prev.availableTime?.availableDays || {},
                              };
                              return {
                                ...prev,
                                availableTime: newAvailableTime,
                              };
                            });
                          }}
                          onEndHourChange={(endHour) => {
                            setAgent((prev) => {
                              const newAvailableTime = {
                                startHour: prev.availableTime?.startHour || 0,
                                endHour: endHour || 0,
                                availableDays: prev.availableTime?.availableDays || {},
                              };
                              return {
                                ...prev,
                                availableTime: newAvailableTime,
                              };
                            });
                          }}
                        />
                      </Cell>
                    </Layout>
                  </Card.Content>
                </Card>
              </Cell>

              {/* Card Whatsapp Details */}
              <Cell span={12}>
                <Card hideOverflow>
                  <Card.Header
                    title="WhatsApp Details"
                    subtitle="Configure how users will connect with this member via WhatsApp."
                  />
                  <Card.Divider />
                  <Card.Content>
                    <Layout>
                      <Cell span={7}>
                        <Layout>
                          <Cell>
                            <InputMobileNumber
                              phoneLabel="WhatsApp number"
                              infoContent="This member's WhatsApp number will be used to connect with customers."
                              phoneNumber={agent.phoneNumber}
                              onValidNumber={(phoneNumber: string) => {
                                setAgent((prev) => ({
                                  ...prev,
                                  phoneNumber,
                                }));
                                setIsPhoneValid(true);
                                setPhoneError("");
                              }}
                              onError={(hasError: boolean, errorMessage?: string) => {
                                setIsPhoneValid(!hasError);
                                setPhoneError(hasError ? errorMessage || "Phone number is required" : "");
                              }}
                              required={true}
                              showValidationErrors={hasAttemptedSave}
                            />
                          </Cell>
                          <Cell>
                            <FormField
                              label="Hello Message"
                              infoContent="This message will be pre-filled when users start a chat with this member."
                              status={errors.introMessage ? "error" : undefined}
                              statusMessage={errors.introMessage}
                              required
                            >
                              <InputArea
                                id="introMessage"
                                name="introMessage"
                                placeholder="Hi! How can I help you today?"
                                value={agent.introMessage}
                                onChange={(e) =>
                                  setAgent((prev) => ({
                                    ...prev,
                                    introMessage: e.currentTarget.value,
                                  }))
                                }
                                onBlur={() => handleFieldBlur("introMessage")}
                                maxLength={500}
                                autoGrow={true}
                                minRowsAutoGrow={2}
                                aria-describedby={
                                  errors.introMessage ? "introMessage-error" : undefined
                                }
                                hasCounter
                              />
                            </FormField>
                          </Cell>
                          <Cell>
                            <FormField
                              label="Initial Message (optional)"
                              infoContent="An automated message that will be sent immediately when users first contact this member."
                              status={errors.initialMessage ? "error" : undefined}
                              statusMessage={errors.initialMessage}
                            >
                              <InputArea
                                id="initialMessage"
                                name="initialMessage"
                                placeholder="Thanks for reaching out! I'll get back to you shortly."
                                value={agent.initialMessage}
                                onChange={(e) =>
                                  setAgent((prev) => ({
                                    ...prev,
                                    initialMessage: e.currentTarget.value,
                                  }))
                                }
                                onBlur={() => handleFieldBlur("initialMessage")}
                                maxLength={500}
                                autoGrow={true}
                                minRowsAutoGrow={2}
                                aria-describedby={
                                  errors.initialMessage ? "initialMessage-error" : undefined
                                }
                                hasCounter
                              />
                            </FormField>
                          </Cell>
                        </Layout>
                      </Cell>
                      <Cell span={5}>
                        <Box
                          backgroundColor="#DFE5EB"
                          width="calc(100% + 24px)"
                          height="calc(100% + 48px)"
                          style={{
                            transform: "translateY(-24px)",
                          }}
                          borderEndEndRadius={8}
                          borderLeft={"1px solid #DFE5EB"}
                          direction="vertical"
                        >
                          <ChatContent {...widgetStyles} isChatView={!!agent}>
                            <MemberChat {...widgetStyles} {...widgetContent} {...agent} />
                          </ChatContent>
                        </Box>
                      </Cell>
                    </Layout>
                  </Card.Content>
                </Card>
              </Cell>

              {/* Card Online Indicator */}
              <Cell>
                <Card>
                  <Card.Header
                    title="Online Indicator"
                    subtitle="Configure how the member's availability status is displayed to users."
                  />
                  <Card.Divider />
                  <Card.Content>
                    <Layout>
                      <Cell span={7}>
                        <Layout>
                          <Cell>
                            <FormField label="Indicator Type">
                              <SegmentedToggle
                                defaultSelected={"bulb"}
                                onClick={(_, value: string) => {
                                  const selectedValue = value as "none" | "text" | "bulb" | "both";
                                  setAgent((prev) => ({
                                    ...prev,
                                    statusIndicator: {
                                      ...prev.statusIndicator,
                                      indicator: selectedValue,
                                    },
                                  }));
                                }}
                                size="small"
                                selected={agent.statusIndicator?.indicator}
                              >
                                <SegmentedToggle.Button value="none">None</SegmentedToggle.Button>
                                <SegmentedToggle.Button value="bulb">
                                  Bulb Only
                                </SegmentedToggle.Button>
                                <SegmentedToggle.Button value="text">
                                  Text Only
                                </SegmentedToggle.Button>
                                <SegmentedToggle.Button value="both">Both</SegmentedToggle.Button>
                              </SegmentedToggle>
                            </FormField>
                          </Cell>
                          {(agent.statusIndicator?.indicator == "text" ||
                            agent.statusIndicator?.indicator == "both") && (
                              <Cell>
                                <FormField
                                  label="Online Status Text"
                                  infoContent="Text shown when the member is available to chat."
                                  required
                                  charCount={32 - (agent?.statusIndicator?.textOnline?.length || 0)}
                                  status={errors["statusIndicator.textOnline"] ? "error" : undefined}
                                  statusMessage={errors["statusIndicator.textOnline"]}
                                >
                                  <Input
                                    id="statusIndicator.textOnline"
                                    name="statusIndicator.textOnline"
                                    placeholder="Online"
                                    value={agent.statusIndicator?.textOnline}
                                    required
                                    maxLength={32}
                                    onChange={(e) =>
                                      setAgent((prev) => ({
                                        ...prev,
                                        statusIndicator: {
                                          ...prev.statusIndicator,
                                          textOnline: e.currentTarget.value,
                                        },
                                      }))
                                    }
                                    onBlur={() => handleFieldBlur("statusIndicator.textOnline")}
                                    aria-describedby={
                                      errors["statusIndicator.textOnline"]
                                        ? "textOnline-error"
                                        : undefined
                                    }
                                  />
                                </FormField>
                              </Cell>
                            )}
                          {(agent.statusIndicator?.indicator == "text" ||
                            agent.statusIndicator?.indicator == "both") && (
                              <Cell>
                                <FormField
                                  label="Offline Status Text (optional)"
                                  infoContent="Text shown when the member is not available to chat."
                                  charCount={32 - (agent?.statusIndicator?.textOffline?.length || 0)}
                                  status={errors["statusIndicator.textOffline"] ? "error" : undefined}
                                  statusMessage={errors["statusIndicator.textOffline"]}
                                >
                                  <Input
                                    id="statusIndicator.textOffline"
                                    name="statusIndicator.textOffline"
                                    placeholder="Offline"
                                    value={agent.statusIndicator?.textOffline}
                                    maxLength={32}
                                    onChange={(e) =>
                                      setAgent((prev) => ({
                                        ...prev,
                                        statusIndicator: {
                                          ...prev.statusIndicator,
                                          textOffline: e.currentTarget.value,
                                        },
                                      }))
                                    }
                                    onBlur={() => handleFieldBlur("statusIndicator.textOffline")}
                                    aria-describedby={
                                      errors["statusIndicator.textOffline"]
                                        ? "textOffline-error"
                                        : undefined
                                    }
                                  />
                                </FormField>
                              </Cell>
                            )}
                        </Layout>
                      </Cell>
                      <Cell span={5}>
                        <Box
                          backgroundColor="#DFE5EB"
                          width="calc(100% + 24px)"
                          height="calc(100% + 48px)"
                          style={{
                            transform: "translateY(-24px)",
                          }}
                          borderEndEndRadius={8}
                          borderLeft={"1px solid #DFE5EB"}
                          direction="vertical"
                        >
                          <ChatHeader
                            {...widgetStyles}
                            onCloseClick={() => { }}
                            showBackBtn={false}
                            onBackClick={() => { }}
                          >
                            {selectedAgent && (
                              <MemberDetails {...agent} {...widgetStyles} parentWrapper="header" />
                            )}
                          </ChatHeader>
                        </Box>
                      </Cell>
                    </Layout>
                  </Card.Content>
                </Card>
              </Cell>
            </Layout>
          </Box>
        }
      />
    </Modal>
  );
};

export default ModalViewAgent;
