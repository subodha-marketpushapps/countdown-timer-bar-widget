import { v4 as uuidv4 } from "uuid";
import isEqual from "lodash/isEqual";
import merge from "lodash/merge"; // retained for other usages
import cloneDeep from "lodash/cloneDeep";
import {
  UpdateOperation,
  StateSnapshot,
  UpdateContext,
  UpdateResult,
  StateListener,
  WidgetStateManagerConfig,
} from "./types";
import { WidgetState } from "../../../interfaces/custom/widget-state-interface";
import { WidgetStateValidator } from "./validator";
import { debugLogger } from "../../utils/debug-logger";
import { generateUnicodeSafeChecksum } from "../../utils/unicode-utils";
import {
  createDefaultWidgetState,
  isValidWidgetState,
  ensureCompleteWidgetState,
  createEmbedScriptParameters,
} from "./default-state-factory";

export class WidgetStateManager {
  private publishedState: WidgetState;
  private draftState: WidgetState;
  private history: StateSnapshot[] = [];
  private future: StateSnapshot[] = [];
  private listeners: Map<string, StateListener> = new Map();
  private pendingOperations: UpdateOperation[] = [];
  private autoSaveTimer: number | null = null;
  private config: WidgetStateManagerConfig & {
    maxHistoryLength: number;
    autoSaveDelay: number;
    maxBatchSize: number;
    enableValidation: boolean;
    enableOptimisticUpdates: boolean;
  };
  private currentBatchId: string | null = null;
  private isUpdating = false;

  /**
   * Factory method to create WidgetStateManager with proper new user handling
   * This handles cases where no existing state is available (brand new users)
   */
  public static createWithDefaults(
    publishedState?: WidgetState | null,
    draftState?: WidgetState | null,
    config: WidgetStateManagerConfig = {}
  ): WidgetStateManager {
    const defaultState = createDefaultWidgetState();

    // Handle new user scenario - no existing states
    if (!publishedState && !draftState) {
      debugLogger.info(
        "WidgetStateManager",
        "Creating manager for new user with default states"
      );
      return new WidgetStateManager(defaultState, defaultState, config);
    }

    // Ensure states are valid and complete
    const validPublished = publishedState
      ? ensureCompleteWidgetState(publishedState)
      : defaultState;
    const validDraft = draftState
      ? ensureCompleteWidgetState(draftState)
      : validPublished;

    debugLogger.info(
      "WidgetStateManager",
      "Creating manager with existing states",
      {
        hasPublished: !!publishedState,
        hasDraft: !!draftState,
        publishedValid: isValidWidgetState(publishedState),
        draftValid: isValidWidgetState(draftState),
      }
    );

    return new WidgetStateManager(validPublished, validDraft, config);
  }

  constructor(
    initialPublished: WidgetState,
    initialDraft: WidgetState,
    config: WidgetStateManagerConfig = {}
  ) {
    this.config = {
      maxHistoryLength: 50,
      autoSaveDelay: 5000,
      maxBatchSize: 10,
      enableValidation: true,
      enableOptimisticUpdates: true,
      persistenceAdapter: config.persistenceAdapter,
      ...config,
    };

    this.publishedState = cloneDeep(initialPublished);
    this.draftState = cloneDeep(initialDraft);

    this.createSnapshot("INITIALIZATION");
    debugLogger.info(
      "WidgetStateManager",
      "Initialized with config",
      this.config
    );
  }

  // Public API Methods

  /**
   * Checks if this appears to be a new user (no changes from defaults)
   * Useful for determining if we need to embed default script parameters
   * More robust check that handles backward compatibility
   */
  public isNewUser(): boolean {
    // If we have more than minimal history, definitely not new
    if (this.history.length > 2) {
      return false;
    }

    // Check if states look like defaults (ignoring legacy enabled/published fields for backward compatibility)
    const defaultState = createDefaultWidgetState();

    // Compare without legacy fields for backward compatibility
    const publishedWithoutLegacy = { ...this.publishedState };
    const draftWithoutLegacy = { ...this.draftState };
    const defaultWithoutLegacy = { ...defaultState };

    delete (publishedWithoutLegacy as any).enabled;
    delete (draftWithoutLegacy as any).published;
    delete (defaultWithoutLegacy as any).enabled;
    delete (defaultWithoutLegacy as any).published;

    const isPublishedDefault =
      JSON.stringify(publishedWithoutLegacy) ===
      JSON.stringify(defaultWithoutLegacy);
    const isDraftDefault =
      JSON.stringify(draftWithoutLegacy) ===
      JSON.stringify(defaultWithoutLegacy);

    return isPublishedDefault && isDraftDefault && this.history.length <= 1;
  }

  /**
   * Gets the current state in format suitable for Wix embedded scripts
   * Returns both published and draft state parameters
   */
  public getEmbedScriptParameters(): Record<string, string> {
    return createEmbedScriptParameters(
      this.publishedState,
      this.draftState,
      this.hasUnsavedChanges()
    );
  }
  public updateDraft(
    update: Partial<WidgetState> | ((state: WidgetState) => WidgetState),
    context: UpdateContext = {}
  ): UpdateResult {
    try {
      this.isUpdating = true;

      const operation = this.createOperation(update, context);
      const newState = this.applyUpdate(this.draftState, update);

      // Validate if enabled
      if (this.config.enableValidation && !context.skipValidation) {
        const errors = WidgetStateValidator.validateWidgetState(newState);
        const criticalErrors = errors.filter((e) => e.severity === "error");

        if (criticalErrors.length > 0) {
          debugLogger.error(
            "WidgetStateManager",
            "Validation failed",
            criticalErrors
          );
          return {
            success: false,
            state: this.draftState,
            errors: criticalErrors,
            operation,
          };
        }
      }

      // Apply update
      this.draftState = newState;

      // Handle history
      if (!context.skipHistory) {
        debugLogger.info("WidgetStateManager", "Adding to history", {
          operationType: operation.type,
          source: context.source,
          skipHistory: context.skipHistory,
        });
        this.addToHistory(operation, context);
      } else {
        debugLogger.info("WidgetStateManager", "Skipping history", {
          operationType: operation.type,
          source: context.source,
          reason: "skipHistory is true",
        });
      }

      // Handle auto-save
      if (!context.skipAutoSave) {
        this.scheduleAutoSave();
      }

      // Notify listeners
      if (!context.silent) {
        this.notifyListeners(newState, operation);
      }

      debugLogger.info("WidgetStateManager", "Draft updated successfully", {
        operation: operation.type,
        batchId: context.batchId,
      });

      return {
        success: true,
        state: newState,
        operation,
      };
    } catch (error) {
      debugLogger.error("WidgetStateManager", "Update failed", error);
      return {
        success: false,
        state: this.draftState,
        errors: [
          { field: "general", message: "Update failed", severity: "error" },
        ],
        operation: this.createOperation(update, context),
      };
    } finally {
      this.isUpdating = false;
    }
  }

  public async publishDraft(
    context: UpdateContext = {}
  ): Promise<UpdateResult> {
    try {
      // Enable widget and set visible when publishing (key business logic)
      const publishableState = {
        ...this.draftState,
        isVisible: true, // Ensure widget is visible after publish
        enabled: true,   // (optional, for legacy/compat)
      };

      const operation = this.createOperation(publishableState, {
        ...context,
        source: "publish",
      });

      if (this.config.enableValidation) {
        const errors =
          WidgetStateValidator.validateWidgetState(publishableState);
        const criticalErrors = errors.filter((e) => e.severity === "error");

        if (criticalErrors.length > 0) {
          return {
            success: false,
            state: this.publishedState,
            errors: criticalErrors,
            operation,
          };
        }
      }

      // Persist if adapter is available
      if (this.config.persistenceAdapter) {
        await this.config.persistenceAdapter.publish(publishableState);
      }

      this.publishedState = cloneDeep(publishableState);
      this.draftState = cloneDeep(publishableState); // Sync draft with published
      this.createSnapshot("PUBLISH");

      this.notifyListeners(this.publishedState, operation);

      debugLogger.info(
        "WidgetStateManager",
        "Published successfully - widget enabled"
      );

      return {
        success: true,
        state: this.publishedState,
        operation,
      };
    } catch (error) {
      debugLogger.error("WidgetStateManager", "Publish failed", error);
      return {
        success: false,
        state: this.publishedState,
        errors: [
          { field: "general", message: "Publish failed", severity: "error" },
        ],
        operation: this.createOperation(this.draftState, context),
      };
    }
  }

  /**
   * Unpublishes the widget (disables it on live site)
   * Keeps all settings but sets isVisible to false
   */
  public async unpublish(context: UpdateContext = {}): Promise<UpdateResult> {
    try {
      const unpublishedState = {
        ...this.publishedState,
        isVisible: false,
      };

      const operation = this.createOperation(unpublishedState, {
        ...context,
        source: "unpublish",
      });

      // Persist if adapter is available
      if (this.config.persistenceAdapter) {
        await this.config.persistenceAdapter.publish(unpublishedState);
      }

      this.publishedState = cloneDeep(unpublishedState);
      this.draftState = cloneDeep(unpublishedState); // Sync draft with published
      this.createSnapshot("UNPUBLISH");

      this.notifyListeners(this.publishedState, operation);

      debugLogger.info(
        "WidgetStateManager",
        "Unpublished successfully - widget disabled"
      );

      return {
        success: true,
        state: this.publishedState,
        operation,
      };
    } catch (error) {
      debugLogger.error("WidgetStateManager", "Failed to unpublish", error);

      return {
        success: false,
        state: this.publishedState,
        errors: [
          {
            field: "system",
            message: "Failed to unpublish widget",
            severity: "error" as const,
          },
        ],
        operation: this.createOperation(this.publishedState, context),
      };
    }
  }

  public async save(): Promise<UpdateResult> {
    try {
      if (this.config.persistenceAdapter) {
        await this.config.persistenceAdapter.save(
          this.publishedState,
          this.draftState
        );
      }

      const operation: UpdateOperation = {
        id: uuidv4(),
        type: "FULL_UPDATE",
        payload: this.draftState,
        timestamp: Date.now(),
        metadata: { source: "manual_save" },
      };

      debugLogger.info("WidgetStateManager", "Saved successfully");

      return {
        success: true,
        state: this.draftState,
        operation,
      };
    } catch (error) {
      debugLogger.error("WidgetStateManager", "Save failed", error);
      return {
        success: false,
        state: this.draftState,
        errors: [
          { field: "general", message: "Save failed", severity: "error" },
        ],
        operation: {
          id: uuidv4(),
          type: "FULL_UPDATE",
          payload: this.draftState,
          timestamp: Date.now(),
        },
      };
    }
  }

  // Batch Operations
  public startBatch(): string {
    this.currentBatchId = uuidv4();
    debugLogger.info(
      "WidgetStateManager",
      "Started batch",
      {
        batchId: this.currentBatchId,
        previousBatchId: this.currentBatchId,
      }
    );
    return this.currentBatchId;
  }

  public endBatch(batchId: string): void {
    if (this.currentBatchId === batchId) {
      debugLogger.info("WidgetStateManager", "Ending batch", {
        batchId,
        pendingOperationsCount: this.pendingOperations.length,
      });
      this.currentBatchId = null;
      this.processPendingOperations();
      debugLogger.info("WidgetStateManager", "Ended batch", batchId);
    } else {
      debugLogger.warn("WidgetStateManager", "Batch ID mismatch", {
        expectedBatchId: batchId,
        currentBatchId: this.currentBatchId,
      });
    }
  }

  // History Management
  public undo(): boolean {
    if (this.history.length <= 1) return false;

    const currentSnapshot = this.history.pop()!;
    this.future.unshift(currentSnapshot);

    const previousSnapshot = this.history[this.history.length - 1];
    this.draftState = cloneDeep(previousSnapshot.state);

    this.notifyListeners(this.draftState, {
      id: uuidv4(),
      type: "FULL_UPDATE",
      payload: this.draftState,
      timestamp: Date.now(),
      metadata: { source: "undo" },
    });

    debugLogger.info("WidgetStateManager", "Undo performed");
    return true;
  }

  public redo(): boolean {
    if (this.future.length === 0) return false;

    const nextSnapshot = this.future.shift()!;
    this.history.push(nextSnapshot);
    this.draftState = cloneDeep(nextSnapshot.state);

    this.notifyListeners(this.draftState, {
      id: uuidv4(),
      type: "FULL_UPDATE",
      payload: this.draftState,
      timestamp: Date.now(),
      metadata: { source: "redo" },
    });

    debugLogger.info("WidgetStateManager", "Redo performed");
    return true;
  }

  public clearHistory(): void {
    this.history = [];
    this.future = [];
    this.createSnapshot("CLEAR_HISTORY");
    debugLogger.info("WidgetStateManager", "History cleared");
  }

  // State Access
  public getDraftState(): WidgetState {
    return cloneDeep(this.draftState);
  }

  public getPublishedState(): WidgetState {
    return cloneDeep(this.publishedState);
  }

  public hasUnsavedChanges(): boolean {
    return !isEqual(this.publishedState, this.draftState);
  }

  public canUndo(): boolean {
    return this.history.length > 1;
  }

  public canRedo(): boolean {
    return this.future.length > 0;
  }

  // Debug method to check history state
  public getHistoryState(): {
    historyLength: number;
    futureLength: number;
    pendingOperationsLength: number;
    currentBatchId: string | null;
    maxHistoryLength: number;
    maxBatchSize: number;
  } {
    return {
      historyLength: this.history.length,
      futureLength: this.future.length,
      pendingOperationsLength: this.pendingOperations.length,
      currentBatchId: this.currentBatchId,
      maxHistoryLength: this.config.maxHistoryLength,
      maxBatchSize: this.config.maxBatchSize,
    };
  }

  // Listeners
  public addListener(id: string, listener: StateListener): void {
    this.listeners.set(id, listener);
  }

  public removeListener(id: string): void {
    this.listeners.delete(id);
  }

  // Utility Methods
  public getStateChecksum(state: WidgetState = this.draftState): string {
    try {
      return generateUnicodeSafeChecksum(state, 16);
    } catch (error) {
      debugLogger.error(
        "WidgetStateManager",
        "Failed to generate checksum",
        error
      );
      // Return a fallback checksum based on timestamp
      return Date.now().toString(36).slice(-16).padEnd(16, "0");
    }
  }

  public dispose(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    this.listeners.clear();
    debugLogger.info("WidgetStateManager", "Disposed");
  }

  // Private Methods
  private createOperation(
    update: Partial<WidgetState> | ((state: WidgetState) => WidgetState),
    context: UpdateContext
  ): UpdateOperation {
    return {
      id: uuidv4(),
      type: this.inferOperationType(update),
      payload: typeof update === "function" ? update(this.draftState) : update,
      timestamp: Date.now(),
      metadata: {
        source: context.source || "user",
        batchId: context.batchId || this.currentBatchId || undefined,
        reason: context.source,
      },
    };
  }

  private inferOperationType(update: any): UpdateOperation["type"] {
    if (typeof update === "function") return "FULL_UPDATE";
    if (update.styles && !update.content) return "UPDATE_STYLES";
    if (update.content && !update.styles) return "UPDATE_CONTENT";
    if (update.content?.members) return "UPDATE_AGENTS";
    return "FULL_UPDATE";
  }

  private applyUpdate(
    state: WidgetState,
    update: Partial<WidgetState> | ((state: WidgetState) => WidgetState)
  ): WidgetState {
    if (typeof update === "function") {
      return update(cloneDeep(state));
    }
    // IMPORTANT: Use custom merge behavior so array fields (like visibilityPagePaths)
    // are REPLACED instead of deeply merged (lodash.merge concatenates nested arrays)
    // which caused removed items to reappear.
    const base = cloneDeep(state);
    const patch = cloneDeep(update);

    // Shallow assign top-level primitives/objects
    Object.keys(patch).forEach((key) => {
      const k = key as keyof WidgetState;
      const incoming: any = (patch as any)[k];
      if (Array.isArray(incoming)) {
        // Replace arrays entirely
        (base as any)[k] = [...incoming];
      } else if (
        incoming &&
        typeof incoming === "object" &&
        !Array.isArray(incoming)
      ) {
        // For nested objects (content, styles, visibilityData) merge shallowly, but replace any arrays inside
        const target = (base as any)[k] || {};
        Object.keys(incoming).forEach((nestedKey) => {
          const nestedVal = (incoming as any)[nestedKey];
          if (Array.isArray(nestedVal)) {
            target[nestedKey] = [...nestedVal];
          } else if (
            nestedVal &&
            typeof nestedVal === "object" &&
            !Array.isArray(nestedVal)
          ) {
            target[nestedKey] = { ...(target[nestedKey] || {}), ...nestedVal };
          } else {
            target[nestedKey] = nestedVal;
          }
        });
        (base as any)[k] = target;
      } else {
        (base as any)[k] = incoming;
      }
    });
    // Debug diff specifically for visibilityData path changes
  // Removed verbose visibilityData diff logging
    return base;
  }

  private addToHistory(
    operation: UpdateOperation,
    context: UpdateContext
  ): void {
    // Skip history if explicitly requested
    if (context.skipHistory) {
      return;
    }

    // Only batch operations if we're in an active batch and haven't exceeded batch size
    if (
      this.currentBatchId &&
      this.pendingOperations.length < this.config.maxBatchSize
    ) {
      this.pendingOperations.push(operation);
      debugLogger.info("WidgetStateManager", "Operation added to pending batch", {
        operationType: operation.type,
        pendingCount: this.pendingOperations.length,
        batchId: this.currentBatchId,
      });
      return;
    }

    // Create immediate snapshot for non-batched operations
    this.createSnapshot(operation.type, [operation]);
    debugLogger.info("WidgetStateManager", "Created history snapshot", {
      operationType: operation.type,
      historyLength: this.history.length,
    });
  }

  private createSnapshot(
    type: string,
    operations: UpdateOperation[] = []
  ): void {
    const snapshot: StateSnapshot = {
      id: uuidv4(),
      state: cloneDeep(this.draftState),
      timestamp: Date.now(),
      operations,
      checksum: this.getStateChecksum(),
    };

    this.history.push(snapshot);
    this.future = []; // Clear future when new snapshot is created

    // Maintain max history length
    if (this.history.length > this.config.maxHistoryLength) {
      this.history.shift();
    }

    debugLogger.info("WidgetStateManager", "Snapshot created", {
      snapshotId: snapshot.id,
      type,
      operationsCount: operations.length,
      historyLength: this.history.length,
      agentCount: snapshot.state.content?.members?.length || 0,
    });
  }

  private processPendingOperations(): void {
    if (this.pendingOperations.length > 0) {
      debugLogger.info("WidgetStateManager", "Processing pending operations", {
        pendingCount: this.pendingOperations.length,
        operations: this.pendingOperations.map(op => op.type),
      });
      this.createSnapshot("BATCH_UPDATE", [...this.pendingOperations]);
      this.pendingOperations = [];
    }
  }

  private scheduleAutoSave(): void {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }

    this.autoSaveTimer = setTimeout(async () => {
      if (!this.isUpdating && this.hasUnsavedChanges()) {
        await this.save();
      }
    }, this.config.autoSaveDelay);
  }

  private notifyListeners(
    state: WidgetState,
    operation: UpdateOperation
  ): void {
    this.listeners.forEach((listener) => {
      try {
        listener(state, operation);
      } catch (error) {
        debugLogger.error("WidgetStateManager", "Listener error", error);
      }
    });
  }
}
