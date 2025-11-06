import { useState, useCallback, useEffect } from "react";
import { WhatsAppAgent, WidgetContent, WidgetStyles } from "../../interfaces";

export interface WidgetPreviewState {
  forceModalOpen: boolean | null; // null = auto, true = force open, false = force closed
  forceSelectedAgent: WhatsAppAgent | null | "auto"; // "auto" = use widget logic
  previewMode: "badge-only" | "modal-only" | "full";
  previewAgent: WhatsAppAgent | null; // For previewing specific agent
  // Step-specific controls
  forceStep: "badge" | "welcome-popup" | "agent-list" | "agent-chat" | "auto";
}

export interface WidgetPreviewControls {
  state: WidgetPreviewState;

  // Control functions
  openModal: () => void;
  closeModal: () => void;
  autoModal: () => void;

  showBadgeOnly: () => void;
  showModalOnly: () => void;
  showFullWidget: () => void;

  selectAgent: (agent: WhatsAppAgent | null) => void;
  previewAgent: (agent: WhatsAppAgent | null) => void;
  autoAgentSelection: () => void;

  // Step-specific navigation
  goToBadgeStep: () => void;
  goToWelcomePopupStep: () => void;
  goToAgentListStep: () => void;
  goToAgentChatStep: (agent?: WhatsAppAgent) => void;
  autoStep: () => void;

  // Special utility functions
  refreshWelcomePopup: () => void; // Simulate natural welcome popup refresh

  // Utility functions
  simulateUserClick: () => void;
  simulateDirectLink: (url: string) => void;
  simulateBehaviorChange: (
    behavior: "direct" | "single-chat" | "multi-chat"
  ) => void;
  reset: () => void;
}

const initialState: WidgetPreviewState = {
  forceModalOpen: null,
  forceSelectedAgent: "auto",
  previewMode: "full",
  previewAgent: null,
  forceStep: "auto",
};

export const useWidgetPreviewControl = (
  widgetContent: WidgetContent,
  styles: WidgetStyles,
  onContentChange?: (content: WidgetContent) => void
): WidgetPreviewControls => {
  const [state, setState] = useState<WidgetPreviewState>(initialState);

  // Reset state when main behavior changes
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      forceModalOpen: null,
      forceSelectedAgent: "auto",
      forceStep: "auto",
    }));
  }, [widgetContent.mainBehavior]);

  const openModal = useCallback(() => {
    setState((prev) => ({ ...prev, forceModalOpen: true }));
  }, []);

  const closeModal = useCallback(() => {
    setState((prev) => ({ ...prev, forceModalOpen: false }));
  }, []);

  const autoModal = useCallback(() => {
    // When switching to auto, we need to be smarter about preserving user state
    setState((prev) => {
      // Simply set to null - the widget controller will handle the transition
      // The key is that the WidgetController should sync its internal state
      return { ...prev, forceModalOpen: null };
    });
  }, []);

  const showBadgeOnly = useCallback(() => {
    setState((prev) => ({ ...prev, previewMode: "badge-only" }));
  }, []);

  const showModalOnly = useCallback(() => {
    setState((prev) => ({ ...prev, previewMode: "modal-only" }));
  }, []);

  const showFullWidget = useCallback(() => {
    setState((prev) => ({ ...prev, previewMode: "full" }));
  }, []);

  const selectAgent = useCallback((agent: WhatsAppAgent | null) => {
    setState((prev) => ({
      ...prev,
      forceSelectedAgent: agent,
      // If we're in step navigation mode and an agent is selected, go to agent chat
      forceStep:
        agent && prev.forceStep !== "auto" ? "agent-chat" : prev.forceStep,
    }));
  }, []);

  const previewAgent = useCallback((agent: WhatsAppAgent | null) => {
    setState((prev) => {
      const newState = {
        ...prev,
        previewAgent: agent,
        // When previewing an agent, force agent-chat step to show the preview
        // When clearing preview agent, return to auto mode
        forceStep: (agent ? "agent-chat" : "auto") as "badge" | "welcome-popup" | "agent-list" | "agent-chat" | "auto",
        // If we set a preview agent, also set it as the selected agent
        forceSelectedAgent: agent || prev.forceSelectedAgent,
      };
      
      return newState;
    });
  }, []);

  const autoAgentSelection = useCallback(() => {
    setState((prev) => ({ ...prev, forceSelectedAgent: "auto" }));
  }, []);

  // Step-specific navigation functions
  const goToBadgeStep = useCallback(() => {
    setState((prev) => ({ ...prev, forceStep: "badge" }));
  }, []);

  const goToWelcomePopupStep = useCallback(() => {
    setState((prev) => ({ ...prev, forceStep: "welcome-popup" }));
  }, []);

  const goToAgentListStep = useCallback(() => {
    setState((prev) => ({ ...prev, forceStep: "agent-list" }));
  }, []);

  const goToAgentChatStep = useCallback(
    (agent?: WhatsAppAgent) => {
      const targetAgent = agent || widgetContent.members[0] || null;
      setState((prev) => ({
        ...prev,
        forceStep: "agent-chat",
        previewAgent: targetAgent,
        forceSelectedAgent: targetAgent, // Ensure the agent is actually selected
      }));
    },
    [widgetContent.members]
  );

  const autoStep = useCallback(() => {
    setState((prev) => ({ ...prev, forceStep: "auto" }));
  }, []);

  const refreshWelcomePopup = useCallback(() => {
    // Simulate a widget refresh to trigger natural welcome popup flow
    // This mimics what happens when a widget first loads

    // Step 1: Reset to a clean state (briefly)
    setState((prev) => ({
      ...prev,
      forceStep: "badge",
      forceModalOpen: false,
    }));

    // Step 2: After a very brief moment, return to auto mode to trigger natural flow
    // This delay is crucial to ensure the widget resets properly
    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        forceStep: "auto",
        forceModalOpen: null,
      }));
    }, 100); // Increased delay for better reliability
  }, []);

  const simulateUserClick = useCallback(() => {
    if (widgetContent.mainBehavior === "direct") {
      // Direct link behavior - opens WhatsApp
      const firstAgent = widgetContent.members[0];
      if (firstAgent) {
        const { initialMessage = "", phoneNumber } = firstAgent;
        const encodedMessage = initialMessage
          ? encodeURIComponent(initialMessage.trim())
          : "";
        const url = `https://wa.me/${phoneNumber}${
          encodedMessage ? `?text=${encodedMessage}` : ""
        }`;
      }
    } else {
      // Toggle modal
      setState((prev) => ({
        ...prev,
        forceModalOpen:
          prev.forceModalOpen === null ? true : !prev.forceModalOpen,
      }));
    }
  }, [widgetContent.mainBehavior, widgetContent.members]);

  const simulateDirectLink = useCallback((url: string) => {
    // Simulate opening a direct link
    window.open(url, "_blank");
  }, []);

  const simulateBehaviorChange = useCallback(
    (behavior: "direct" | "single-chat" | "multi-chat") => {
      if (onContentChange) {
        onContentChange({
          ...widgetContent,
          mainBehavior: behavior,
        });
      }

      // Auto-adjust preview based on behavior
      if (behavior === "direct") {
        setState((prev) => ({
          ...prev,
          forceModalOpen: false,
          forceSelectedAgent: "auto",
          forceStep: "badge",
        }));
      } else if (behavior === "single-chat") {
        setState((prev) => ({
          ...prev,
          forceModalOpen: true,
          forceSelectedAgent: widgetContent.members[0] || null,
          forceStep: "agent-chat",
        }));
      } else if (behavior === "multi-chat") {
        setState((prev) => ({
          ...prev,
          forceModalOpen: true,
          forceSelectedAgent: null,
          forceStep: "agent-list",
        }));
      }
    },
    [widgetContent, onContentChange]
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    openModal,
    closeModal,
    autoModal,
    showBadgeOnly,
    showModalOnly,
    showFullWidget,
    selectAgent,
    previewAgent,
    autoAgentSelection,
    goToBadgeStep,
    goToWelcomePopupStep,
    goToAgentListStep,
    goToAgentChatStep,
    autoStep,
    refreshWelcomePopup,
    simulateUserClick,
    simulateDirectLink,
    simulateBehaviorChange,
    reset,
  };
};
