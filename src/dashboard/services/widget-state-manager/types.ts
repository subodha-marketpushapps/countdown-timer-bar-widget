import { WidgetState } from "../../../interfaces/custom/widget-state-interface";

export interface UpdateOperation {
  id: string;
  type: 'UPDATE_STYLES' | 'UPDATE_CONTENT' | 'UPDATE_AGENTS' | 'FULL_UPDATE';
  payload: Partial<WidgetState>;
  timestamp: number;
  metadata?: {
    source?: string;
    batchId?: string;
    reason?: string;
  };
}

export interface StateSnapshot {
  id: string;
  state: WidgetState;
  timestamp: number;
  operations: UpdateOperation[];
  checksum: string;
}

export interface UpdateContext {
  batchId?: string;
  skipHistory?: boolean;
  skipValidation?: boolean;
  skipAutoSave?: boolean;
  silent?: boolean;
  source?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface UpdateResult {
  success: boolean;
  state: WidgetState;
  errors?: ValidationError[];
  warnings?: ValidationError[];
  operation: UpdateOperation;
}

export type StateListener = (state: WidgetState, operation: UpdateOperation) => void;

export interface WidgetStateManagerConfig {
  maxHistoryLength?: number;
  autoSaveDelay?: number;
  maxBatchSize?: number;
  enableValidation?: boolean;
  enableOptimisticUpdates?: boolean;
  persistenceAdapter?: PersistenceAdapter | undefined;
}

export interface PersistenceAdapter {
  save(published: WidgetState, draft: WidgetState): Promise<void>;
  load(): Promise<{ published: WidgetState; draft: WidgetState } | null>;
  publish(state: WidgetState): Promise<void>;
}
