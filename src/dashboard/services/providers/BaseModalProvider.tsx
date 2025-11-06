import React, {
  ReactNode,
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react";
import ModalFeedback, { FlowStep } from "../../components/common/ModalFeedback";
import { dashboard } from "@wix/dashboard";
import { useRecoilState } from "recoil";
import { settingsState } from "../../services/state";
import { updateSettings } from "../../services/api";
import { Settings } from "../../../interfaces";
import { APP_NAME } from "../../../constants";

type BaseModalContextType = {
  openFeedbackModal: (flowStep?: FlowStep) => void;
  checkAndDisplayFeedbackModal: (time?: number, flowStep?: FlowStep) => void;
};

const BaseModalContext = createContext<BaseModalContextType | undefined>(
  undefined
);

const useModalState = () => {
  const [modalState, setModalState] = useState({
    previewURL: undefined as string | undefined,
    isFeedbackModalOpen: false,
    feedbackFlowStep: "default" as FlowStep,
  });

  return {
    modalState,
    setModalState,
  };
};

export const BaseModalProvider = ({ children }: { children: ReactNode }) => {
  const { modalState, setModalState } = useModalState();
  const [settings, setSettings] = useRecoilState(settingsState);

  // Pure function for feedback check - only based on user review state
  const pureShouldShowFeedback = useCallback(
    (reviewState = settings?.isUserReviewed) => {
      // Never show if user already reviewed or said "never"
      if (reviewState === true || reviewState === "never") return false;

      // Show feedback for all other states when triggered by publishing flow
      return true;
    },
    [settings]
  );

  // Function to handle feedback modal display with session limiting
  const checkAndDisplayFeedbackModal = useCallback(
    (time: number = 10000, flowStep: FlowStep = "default") => {
      // Check session storage to prevent showing multiple times per session
      const sessionKey = generateSessionKey("feedback");
      const hasAlreadyShown = sessionStorage.getItem(sessionKey);

      // Don't show if already shown in this session
      if (hasAlreadyShown) {
        return;
      }

      // Check if we should show feedback based on the pure function
      if (pureShouldShowFeedback()) {
        setTimeout(() => {
          setModalState((prev) => ({
            ...prev,
            isFeedbackModalOpen: true,
            feedbackFlowStep: flowStep,
          }));
          // Mark as shown in this session
          sessionStorage.setItem(sessionKey, "true");
        }, time);
      }
    },
    [pureShouldShowFeedback, setModalState]
  );

  // Function to open the feedback modal
  const openFeedbackModal = useCallback(
    (flowStep: FlowStep = "default") => {
      // Check session storage to prevent showing multiple times per session
      const sessionKey = generateSessionKey("feedback");
      const hasAlreadyShown = sessionStorage.getItem(sessionKey);

      // Don't show if already shown in this session
      if (hasAlreadyShown) {
        return;
      }

      setModalState((prev) => ({
        ...prev,
        isFeedbackModalOpen: true,
        feedbackFlowStep: flowStep,
      }));
      // Mark as shown in this session
      sessionStorage.setItem(sessionKey, "true");
    },
    [setModalState]
  );

  // Update site settings
  const updateSiteSettings = useCallback(
    async (newSettings: Partial<Settings>) => {
      try {
        await updateSettings(newSettings);
        setSettings((prev) => ({ ...prev, ...newSettings }));
      } catch (error) {
        console.error("Failed to update settings", error);
        dashboard.showToast({
          message: "Failed to update settings. Please try again.",
          type: "error",
        });
      }
    },
    [setSettings]
  );

  // Feedback skip/submit logic for tracking user interaction
  const handleFeedbackShown = useCallback(() => {
    // Mark that user has been shown the feedback (to update the tracking logic)
    // This is called when the feedback content (iframe) is actually displayed to the user
    const { isUserReviewed } = settings || {};
    let nextState: any = "none";

    if (isUserReviewed === "none" || isUserReviewed === false) {
      nextState = "1st-time-asked";
    } else if (isUserReviewed === "1st-time-asked") {
      nextState = "2nd-time-asked";
    } else if (isUserReviewed === "2nd-time-asked") {
      nextState = "3rd-time-asked";
    } else if (isUserReviewed === "3rd-time-asked") {
      nextState = "never";
    }

    updateSiteSettings({ isUserReviewed: nextState });
  }, [settings, updateSiteSettings]);

  const contextValue = useMemo(
    () => ({
      openFeedbackModal,
      checkAndDisplayFeedbackModal,
    }),
    [openFeedbackModal, checkAndDisplayFeedbackModal]
  );

  return (
    <BaseModalContext.Provider value={contextValue}>
      {children}
      <ModalFeedback
        isModalOpened={modalState.isFeedbackModalOpen}
        flowStep={modalState.feedbackFlowStep}
        onModalClosed={() =>
          setModalState((prev) => ({
            ...prev,
            isFeedbackModalOpen: false,
            feedbackFlowStep: "default", // Reset to default when closed
          }))
        }
        onUserReviewed={() => {
          updateSiteSettings({ isUserReviewed: true });
        }}
        onFeedbackShown={handleFeedbackShown}
      />
    </BaseModalContext.Provider>
  );
};

export const useBaseModal = () => {
  const context = useContext(BaseModalContext);
  if (!context) {
    throw new Error("useBaseModal must be used within a BaseModalProvider");
  }
  return context;
};

function generateSessionKey(
  feedbackType: string,
  appName = APP_NAME,
  widgetType = "plugin"
) {
  const convertToCamelCase = (str: string) =>
    str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, "");

  const appNamePrefix = convertToCamelCase(appName);
  const feedbackTypeSuffix =
    feedbackType.charAt(0).toUpperCase() + feedbackType.slice(1);

  return `${appNamePrefix}${widgetType}FeedbackModalShown${feedbackTypeSuffix}`;
}
