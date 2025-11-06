import { useMemo, useCallback, useEffect, useRef, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  WidgetStateManager,
  WixPersistenceAdapter,
  UpdateContext,
  UpdateResult,
  ValidationError,
} from "../services/widget-state-manager";
import {
  publishedWidgetState,
  draftWidgetState,
  settingsState,
} from "../services/state";
import { WidgetState } from "../../interfaces/custom/widget-state-interface";
import { useStatusToast } from "../services/providers/StatusToastProvider";
import { debugLogger } from "../utils/debug-logger";
import { useEmbeds } from "./wix-embeds";
import {
  parseEmbedScriptParameters,
  isValidWidgetState,
} from "../services/widget-state-manager/default-state-factory";
import { base64ToObject } from "../utils/base64-utils";
// import { checkAgentAvailability } from "../../components/WidgetWhatsappChat/utils";

// Configuration constants for autosave system
const AUTOSAVE_CONFIG = {
  DEBOUNCE_DELAY: 3000, // 3 seconds - wait time after user stops editing
  MIN_EMBED_INTERVAL: 3000, // 3 seconds - minimum time between embed operations
  SAVE_ANIMATION_DURATION: 2000, // 2 seconds - how long to show "Saved" state
} as const;

interface UseWidgetStateManagerOptions {
  autoSave?: boolean;
  autoSaveDelay?: number;
  enableValidation?: boolean;
  enableOptimisticUpdates?: boolean;
}

interface UseWidgetStateManagerReturn {
  // State access
  draftState: WidgetState;
  publishedState: WidgetState;

  // Update methods
  updateDraft: (
    update: Partial<WidgetState> | ((state: WidgetState) => WidgetState),
    context?: UpdateContext
  ) => Promise<UpdateResult>;

  updateStyles: (
    styles: Partial<WidgetState["styles"]>,
    context?: UpdateContext
  ) => Promise<UpdateResult>;
  updateContent: (
    content: Partial<WidgetState["content"]>,
    context?: UpdateContext
  ) => Promise<UpdateResult>;
  updateAgents: (
    agents: WidgetState["content"]["members"],
    context?: UpdateContext
  ) => Promise<UpdateResult>;

  // Persistence methods
  save: () => Promise<UpdateResult>;
  publish: () => Promise<UpdateResult>;
  unpublish: () => Promise<UpdateResult>; // New unpublish method
  discard: () => void;

  // History methods
  undo: () => boolean;
  redo: () => boolean;
  clearHistory: () => void;

  // State flags
  hasUnsavedChanges: boolean;
  hasUnpublishedChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isEmbedding: boolean;
  isNewUser: boolean;

  // Validation
  validationErrors: ValidationError[];
  validationWarnings: ValidationError[];

  // Batch operations
  startBatch: () => string;
  endBatch: (batchId: string) => void;

  // Debug utilities
  debugEmbed: (force?: boolean) => Promise<void>;
  getHistoryState: () => {
    historyLength: number;
    futureLength: number;
    pendingOperationsLength: number;
    currentBatchId: string | null;
    maxHistoryLength: number;
    maxBatchSize: number;
  };

  // Circuit breaker status
  embedOperationInProgress: boolean;
  lastEmbedTimestamp: number;
}

export const useWidgetStateManager = (
  options: UseWidgetStateManagerOptions = {}
): UseWidgetStateManagerReturn => {
  const {
    autoSave = true,
    autoSaveDelay = 5000,
    enableValidation = true,
    enableOptimisticUpdates = true,
  } = options;

  // Recoil state
  const [publishedRecoilState, setPublishedRecoilState] =
    useRecoilState(publishedWidgetState);
  const [draftRecoilState, setDraftRecoilState] =
    useRecoilState(draftWidgetState);
  const settings = useRecoilValue(settingsState);

  // Wix embeds integration for new user handling
  const { getEmbeddedScript, embedScript, isLoadingScript, isEmbedding } =
    useEmbeds<Record<string, string>>();

  // Local state
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );
  const [validationWarnings, setValidationWarnings] = useState<
    ValidationError[]
  >([]);
  const [isNewUser, setIsNewUser] = useState(false);

  // Refs
  const stateManagerRef = useRef<WidgetStateManager | null>(null);
  const initializationCompleteRef = useRef(false);
  const embedOperationInProgressRef = useRef(false);
  const lastEmbedTimestampRef = useRef<number>(0);
  const lastStateUpdateTimestampRef = useRef<number>(0); // Track when we last updated state
  const embedDebounceTimerRef = useRef<number | null>(null);
  const autosaveDebounceTimerRef = useRef<number | null>(null);
  const { addToast, clearToasts } = useStatusToast();

  // Controlled embed function with circuit breaker
  const controlledEmbed = useCallback(
    async (reason: string, force: boolean = false): Promise<boolean> => {
      const now = Date.now();

      // Circuit breaker: prevent too frequent embeds
      if (
        !force &&
        now - lastEmbedTimestampRef.current < AUTOSAVE_CONFIG.MIN_EMBED_INTERVAL
      ) {
        debugLogger.warn(
          "useWidgetStateManager",
          `Embed blocked - too frequent. Last embed: ${
            now - lastEmbedTimestampRef.current
          }ms ago`,
          { reason }
        );
        return false;
      }

      // Prevent concurrent embeds
      if (embedOperationInProgressRef.current) {
        debugLogger.warn(
          "useWidgetStateManager",
          "Embed blocked - operation in progress",
          { reason }
        );
        return false;
      }

      if (!stateManagerRef.current) {
        debugLogger.error(
          "useWidgetStateManager",
          "Embed blocked - no state manager",
          { reason }
        );
        return false;
      }

      try {
        embedOperationInProgressRef.current = true;
        lastEmbedTimestampRef.current = now;

        const embedParameters =
          stateManagerRef.current.getEmbedScriptParameters();

        await embedScript.mutateAsync(embedParameters);
        return true;
      } catch (error) {
        debugLogger.error(
          "useWidgetStateManager",
          `Controlled embed failed: ${reason}`,
          error
        );
        return false;
      } finally {
        embedOperationInProgressRef.current = false;
      }
    },
    [embedScript]
  );

  // Debounced autosave function
  const debouncedAutosave = useCallback(
    (hasUnpublishedChanges: boolean) => {
      // Clear existing autosave timer
      if (autosaveDebounceTimerRef.current) {
        clearTimeout(autosaveDebounceTimerRef.current);
      }

      // Check if autosave is enabled in settings
  if (!settings.isAutoSaveEnabled || !hasUnpublishedChanges) return;

      // Schedule debounced autosave
      autosaveDebounceTimerRef.current = setTimeout(async () => {
        // Set isSaving to true for autosave animation
        setIsSaving(true);
        try {
          await controlledEmbed("debounced-autosave");
        } catch (error) {
          debugLogger.error(
            "useWidgetStateManager",
            "Debounced autosave failed",
            error
          );
        } finally {
          // Set isSaving back to false after autosave completes
          setIsSaving(false);
        }
      }, AUTOSAVE_CONFIG.DEBOUNCE_DELAY);
    },
    [controlledEmbed, setIsSaving, settings.isAutoSaveEnabled]
  );

  // Cleanup function
  useEffect(() => {
    return () => {
      if (embedDebounceTimerRef.current) {
        clearTimeout(embedDebounceTimerRef.current);
      }
      if (autosaveDebounceTimerRef.current) {
        clearTimeout(autosaveDebounceTimerRef.current);
      }
      stateManagerRef.current?.dispose();
    };
  }, []);

  // Initialize state manager with proper embedded data handling
  const stateManager = useMemo(() => {
    if (!stateManagerRef.current) {
      // Create state manager with default initial data
      const manager = WidgetStateManager.createWithDefaults(
        publishedRecoilState,
        draftRecoilState,
        {
          autoSaveDelay,
          enableValidation,
          enableOptimisticUpdates,
          persistenceAdapter: new WixPersistenceAdapter(),
        }
      );

      // DO NOT add reactive listeners that could cause infinite loops
      // State synchronization will be handled manually in update operations

      stateManagerRef.current = manager;
    }

    return stateManagerRef.current;
  }, []); // Only initialize once - no dependencies to prevent recreation

  // Handle embedded script data loading separately
  useEffect(() => {
    // Calculate timing values
    const timeSinceLastUpdate = Date.now() - lastStateUpdateTimestampRef.current;
    const isRecentUpdate = timeSinceLastUpdate < 5000; // 5 seconds grace period
    
    // 🔥 CRITICAL FIX: Only process embedded data during initial load
    // Don't overwrite state if we're in the middle of embed operations or already initialized
    // Also don't overwrite if we've made recent state updates (within last 5 seconds)
    if (
      !initializationCompleteRef.current &&
      getEmbeddedScript.data &&
      stateManagerRef.current &&
      !embedOperationInProgressRef.current && // Prevent state overwrite during our own embeds
      !isRecentUpdate // Prevent overwrite if we just made changes
    ) {
  // Removed verbose console debug for embedded script key count
      let hasExistingData = false;

      // Process embedded script data
      if (Object.keys(getEmbeddedScript.data).length > 0) {
        try {
          const embeddedState = parseEmbedScriptParameters(
            getEmbeddedScript.data
          );
          // Removed verbose console debug for parsed embedded state

          if (embeddedState) {
            // Update the state manager internal state
            stateManagerRef.current.updateDraft(embeddedState);

            // 🔥 CRITICAL: Update Recoil state with fetched data
            setPublishedRecoilState(embeddedState);
            setDraftRecoilState(embeddedState);


            hasExistingData = true;

            // Handle separate draft state if available
            if (getEmbeddedScript.data.draftWidgetState) {
              try {
                const draftFromParams = base64ToObject(
                  getEmbeddedScript.data.draftWidgetState
                );
                if (isValidWidgetState(draftFromParams)) {
                  const validDraftState = draftFromParams as WidgetState;
                  stateManagerRef.current.updateDraft(validDraftState);

                  // 🔥 CRITICAL: Update draft Recoil state with separate draft data
                  setDraftRecoilState(validDraftState);

                }
              } catch (error) {
                debugLogger.warn(
                  "useWidgetStateManager",
                  "Failed to parse draft state from parameters",
                  error
                );
              }
            }
          } else {
      // parsing produced no state
          }
        } catch (error) {
          debugLogger.error(
            "useWidgetStateManager",
            "Failed to process embedded script data",
            error
          );
        }
      } else {
    // No embedded data found – likely new user
      }

      // Update new user status based on embedded data
      const isActuallyNewUser =
        !hasExistingData && stateManagerRef.current.isNewUser();
      setIsNewUser(isActuallyNewUser);
      initializationCompleteRef.current = true;

    } else {
      // Log why we're skipping embedded data processing
      if (initializationCompleteRef.current) {
      } else if (embedOperationInProgressRef.current) {
      } else if (isRecentUpdate) {
      }
    }
  }, [
    getEmbeddedScript.data,
    setPublishedRecoilState,
    setDraftRecoilState,
    publishedRecoilState,
    draftRecoilState,
  ]);

  // Handle new user initialization - simplified since we now detect properly
  useEffect(() => {
    const handleNewUserInitialization = async () => {
      if (isNewUser && stateManager && !isEmbedding) {
        try {
          // Use controlled embed for new user initialization
          const success = await controlledEmbed(
            "new-user-initialization",
            true
          );

          if (success) {
            addToast({
              content:
                "Welcome! Your WhatsApp widget has been initialized with default settings.",
              status: "info",
            });

          } else {
            throw new Error("Controlled embed failed");
          }
        } catch (error) {
          debugLogger.error(
            "useWidgetStateManager",
            "Failed to initialize new user",
            error
          );

          addToast({
            content:
              "There was an issue initializing your widget. Please refresh the page.",
            status: "warning",
          });
        }
      }
    };

    // Only run after component has mounted and we have the state manager
    if (stateManager) {
      handleNewUserInitialization();
    }
  }, [isNewUser, stateManager, isEmbedding, addToast, controlledEmbed]);

  // Update methods
  const updateDraft = useCallback(
    async (
      update: Partial<WidgetState> | ((state: WidgetState) => WidgetState),
      context: UpdateContext = {}
    ): Promise<UpdateResult> => {
      const result = stateManager.updateDraft(update, {
        skipAutoSave: !autoSave || context.skipAutoSave, // Respect auto-save setting unless explicitly skipped
        ...context,
      });

      // Manual state synchronization - update Recoil state
      if (result.success && result.state) {
        // 🔥 CRITICAL: Track when we make state updates to prevent overwrites
        lastStateUpdateTimestampRef.current = Date.now();
        
        // Skip if no actual state change (deep equality) to avoid redundant renders
        if (isEqual(draftRecoilState, result.state)) {
        } else {
          setDraftRecoilState(result.state);
        }

        // Update published state if this was a publish operation
        if (context.source === "publish") {
          setPublishedRecoilState(result.state);
        }

        // Trigger debounced autosave for unpublished changes (instead of immediate autosave)
        if (autoSave && !context.skipAutoSave && !context.skipHistory) {
          const hasUnpublishedChanges = !isEqual(
            publishedRecoilState,
            result.state
          );
          // Use debounced autosave instead of immediate autosave
          debouncedAutosave(hasUnpublishedChanges);
        }
      }

      // Handle validation results
      if (result.errors) {
        setValidationErrors(
          result.errors.filter((e) => e.severity === "error")
        );
        if (result.errors.some((e) => e.severity === "error")) {

          // Get error messages for the toast
          const errorMessages = result.errors
            .filter((e) => e.severity === "error")
            .map((e) => e.message);

          const errorMessage =
            errorMessages.length > 0
              ? errorMessages.length === 1
                ? errorMessages[0]
                : `${errorMessages.length} validation errors found. Please check the form.`
              : "Validation errors found. Please fix them before saving.";

          addToast({
            content: errorMessage,
            status: "error",
          });
        }
      }

      if (result.warnings) {
        setValidationWarnings(result.warnings);
      }

      // Check agent availability and show warnings
      const currentState = await stateManager.getDraftState();
      const { content } = currentState;

      const isMultiChat = content.mainBehavior === "multi-chat";
      const isOfflineAgentsShouldBeHidden =
        content.unavailableAgentBehavior === "hide";

      const agents = isMultiChat ? content.members : [content.members[0]];

      const onlineAgents = agents;

      // const onlineAgents = agents.filter((agent) =>
      //   // checkAgentAvailability(agent)
      // );
      const availableAgents = agents.filter((agent) => agent?.isVisible);

      // Clear existing agent availability warnings
      clearToasts("widget-offline-warning");

      if (!isMultiChat && availableAgents.length < 1) {
        addToast({
          content: `The first agent "${
            agents[0]?.name || "unknown"
          }" is currently hidden. Please make this agent visible or set another agent as the first in the list to ensure availability.`,
          status: "warning",
          customId: "widget-offline-warning",
          dismissible: false,
        });
      } else if (isMultiChat && availableAgents.length < 1) {
        addToast({
          content: `All agents are currently hidden. Please make at least one agent visible to ensure availability.`,
          status: "warning",
          customId: "widget-offline-warning",
          dismissible: false,
        });
      } else if (isOfflineAgentsShouldBeHidden && onlineAgents.length < 1) {
        addToast({
          content:
            "This is a development preview. On your live site, the widget will be hidden when all agents are offline.",
          status: "info",
          customId: "widget-offline-warning",
          duration: 20000,
        });
      }

      return result;
    },
    [
      stateManager,
      autoSave,
      addToast,
      clearToasts,
      controlledEmbed,
      publishedRecoilState,
      setDraftRecoilState,
      setPublishedRecoilState,
      isSaving,
      setIsSaving,
      debouncedAutosave,
    ]
  );

  const updateStyles = useCallback(
    async (
      styles: Partial<WidgetState["styles"]>,
      context: UpdateContext = {}
    ): Promise<UpdateResult> => {
      const currentState = await stateManager.getDraftState();
      const mergedStyles = { ...currentState.styles, ...styles };
      return updateDraft(
        { styles: mergedStyles },
        { ...context, source: "styles-panel" }
      );
    },
    [updateDraft, stateManager]
  );

  const updateContent = useCallback(
    async (
      content: Partial<WidgetState["content"]>,
      context: UpdateContext = {}
    ): Promise<UpdateResult> => {
      const currentState = await stateManager.getDraftState();
      const mergedContent = { ...currentState.content, ...content };
      return updateDraft(
        { content: mergedContent },
        { ...context, source: "content-panel" }
      );
    },
    [updateDraft, stateManager]
  );

  const updateAgents = useCallback(
    async (
      agents: WidgetState["content"]["members"],
      context: UpdateContext = {}
    ): Promise<UpdateResult> => {
      return updateDraft(
        (state) => ({
          ...state,
          content: { ...state.content, members: agents },
        }),
        { ...context, source: "agents-panel" }
      );
    },
    [updateDraft]
  );

  // Persistence methods
  const save = useCallback(async (): Promise<UpdateResult> => {
    setIsSaving(true);
    try {
      const result = await stateManager.save();

      if (result.success) {
        // Use controlled embed after successful save
        await controlledEmbed("manual-save");

        addToast({
          content: "Draft saved successfully",
          status: "success",
        });
      } else {
        addToast({
          content: "Failed to save draft",
          status: "error",
        });
      }

      return result;
    } finally {
      setIsSaving(false);
    }
  }, [stateManager, addToast, controlledEmbed]);

  const publish = useCallback(async (): Promise<UpdateResult> => {
    setIsPublishing(true);
    try {
      const result = await stateManager.publishDraft();

      if (result.success) {
        // Mark as visible when publishing
        const currentDraft = await stateManager.getDraftState();
        const publishedState = {
          ...currentDraft,
          isVisible: true,
        };

        // Manual state synchronization for publish with published flag
        setPublishedRecoilState(publishedState);
        setDraftRecoilState(publishedState);

        // Use controlled embed after successful publish
        await controlledEmbed("publish");

        addToast({
          content: "Widget published successfully",
          status: "success",
        });
      } else {
        addToast({
          content: "Failed to publish widget",
          status: "error",
        });
      }

      return result;
    } finally {
      setIsPublishing(false);
    }
  }, [
    stateManager,
    addToast,
    controlledEmbed,
    setPublishedRecoilState,
    setDraftRecoilState,
  ]);

  const unpublish = useCallback(async (): Promise<UpdateResult> => {
    setIsPublishing(true);
    try {
      const result = await stateManager.unpublish();

      if (result.success) {
        // Mark as not visible when unpublishing
        const currentDraft = await stateManager.getDraftState();
        const unpublishedState = {
          ...currentDraft,
          isVisible: false,
        };

        // Manual state synchronization for unpublish with unpublished flag
        setPublishedRecoilState(unpublishedState);
        setDraftRecoilState(unpublishedState);

        // Use controlled embed after successful unpublish
        await controlledEmbed("unpublish");

        addToast({
          content:
            "Widget unpublished successfully - no longer visible on your site",
          status: "success",
        });
      } else {
        addToast({
          content: "Failed to unpublish widget",
          status: "error",
        });
      }

      return result;
    } finally {
      setIsPublishing(false);
    }
  }, [
    stateManager,
    addToast,
    controlledEmbed,
    setPublishedRecoilState,
    setDraftRecoilState,
  ]);

  const discard = useCallback(() => {
    const publishedState = stateManager.getPublishedState();
    updateDraft(publishedState, {
      skipHistory: true,
      skipAutoSave: true,
      source: "discard",
    });

    addToast({
      content: "Changes discarded",
      status: "info",
    });
  }, [stateManager, updateDraft, addToast]);

  // History methods
  const undo = useCallback((): boolean => {
    const success = stateManager.undo();
    if (success) {
      addToast({
        content: "Undo performed",
        status: "info",
      });
    }
    return success;
  }, [stateManager, addToast]);

  const redo = useCallback((): boolean => {
    const success = stateManager.redo();
    if (success) {
      addToast({
        content: "Redo performed",
        status: "info",
      });
    }
    return success;
  }, [stateManager, addToast]);

  const clearHistory = useCallback(() => {
    stateManager.clearHistory();
    addToast({
      content: "History cleared",
      status: "info",
    });
  }, [stateManager, addToast]);

  // Batch operations
  const startBatch = useCallback(() => {
    return stateManager.startBatch();
  }, [stateManager]);

  const endBatch = useCallback(
    (batchId: string) => {
      stateManager.endBatch(batchId);
    },
    [stateManager]
  );

  // Debug function for manual embed testing
  const debugEmbed = useCallback(
    async (force = false): Promise<void> => {
  await controlledEmbed("debug-manual-trigger", force);
    },
    [controlledEmbed]
  );

  // Computed values
  const hasUnsavedChanges = stateManager.hasUnsavedChanges();
  const hasUnpublishedChanges = !isEqual(
    publishedRecoilState,
    draftRecoilState
  );
  const canUndo = stateManager.canUndo();
  const canRedo = stateManager.canRedo();

  return {
    // State access
    draftState: draftRecoilState,
    publishedState: publishedRecoilState,

    // Update methods
    updateDraft,
    updateStyles,
    updateContent,
    updateAgents,

    // Persistence methods
    save,
    publish,
    unpublish,
    discard,

    // History methods
    undo,
    redo,
    clearHistory,

    // State flags
    hasUnsavedChanges,
    hasUnpublishedChanges,
    canUndo,
    canRedo,
  isLoading: isLoadingScript,
    isSaving,
    isPublishing,
    isEmbedding: isEmbedding || embedOperationInProgressRef.current,
    isNewUser,

    // Validation
    validationErrors,
    validationWarnings,

    // Batch operations
    startBatch,
    endBatch,

    // Debug utilities
    debugEmbed,
    getHistoryState: () => stateManager.getHistoryState(),

    // Circuit breaker status
    embedOperationInProgress: embedOperationInProgressRef.current,
    lastEmbedTimestamp: lastEmbedTimestampRef.current,
  };
};

// Helper function for backward compatibility
function isEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
