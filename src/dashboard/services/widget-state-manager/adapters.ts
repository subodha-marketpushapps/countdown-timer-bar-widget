import { PersistenceAdapter } from './types';
import { WidgetState } from '../../../interfaces/custom/widget-state-interface';
import { objectToBase64, base64ToObject } from '../../utils/base64-utils';
import { embeddedScripts } from '@wix/app-management';
import { debugLogger } from '../../utils/debug-logger';

export class WixPersistenceAdapter implements PersistenceAdapter {
  async save(published: WidgetState, draft: WidgetState): Promise<void> {
    try {
      debugLogger.info('WixPersistenceAdapter', 'Saving states to Wix');
      
      await embeddedScripts.embedScript({
        parameters: {
          widgetState: objectToBase64(published),
          draftWidgetState: objectToBase64(draft),
        }
      });

      debugLogger.info('WixPersistenceAdapter', 'States saved successfully');
    } catch (error) {
      debugLogger.error('WixPersistenceAdapter', 'Save failed', error);
      throw new Error(`Failed to save widget states: ${error}`);
    }
  }

  async load(): Promise<{ published: WidgetState; draft: WidgetState } | null> {
    try {
      debugLogger.info('WixPersistenceAdapter', 'Loading states from Wix');
      
      const embeddedScript = await embeddedScripts.getEmbeddedScript();
      const parameters = embeddedScript.parameters || {};

      if (!parameters.widgetState && !parameters.draftWidgetState) {
        debugLogger.info('WixPersistenceAdapter', 'No existing states found');
        return null;
      }

      const published = parameters.widgetState 
        ? base64ToObject(parameters.widgetState) as WidgetState
        : null;
      
      const draft = parameters.draftWidgetState 
        ? base64ToObject(parameters.draftWidgetState) as WidgetState
        : null;

      if (!published || !draft) {
        debugLogger.warn('WixPersistenceAdapter', 'Incomplete state data found');
        return null;
      }

      debugLogger.info('WixPersistenceAdapter', 'States loaded successfully');
      return { published, draft };

    } catch (error) {
      debugLogger.error('WixPersistenceAdapter', 'Load failed', error);
      throw new Error(`Failed to load widget states: ${error}`);
    }
  }

  async publish(state: WidgetState): Promise<void> {
    try {
      debugLogger.info('WixPersistenceAdapter', 'Publishing state to Wix');
      
      const encodedState = objectToBase64(state);
      await embeddedScripts.embedScript({
        parameters: {
          widgetState: encodedState,
          draftWidgetState: encodedState, // Published state becomes the new draft
        }
      });

      debugLogger.info('WixPersistenceAdapter', 'State published successfully');
    } catch (error) {
      debugLogger.error('WixPersistenceAdapter', 'Publish failed', error);
      throw new Error(`Failed to publish widget state: ${error}`);
    }
  }
}

// In-memory adapter for testing/development
export class MemoryPersistenceAdapter implements PersistenceAdapter {
  private storage: { published?: WidgetState; draft?: WidgetState } = {};

  async save(published: WidgetState, draft: WidgetState): Promise<void> {
    this.storage = { published, draft };
    debugLogger.info('MemoryPersistenceAdapter', 'States saved to memory');
  }

  async load(): Promise<{ published: WidgetState; draft: WidgetState } | null> {
    if (!this.storage.published || !this.storage.draft) {
      return null;
    }
    debugLogger.info('MemoryPersistenceAdapter', 'States loaded from memory');
    return { 
      published: this.storage.published, 
      draft: this.storage.draft 
    };
  }

  async publish(state: WidgetState): Promise<void> {
    this.storage.published = state;
    this.storage.draft = state;
    debugLogger.info('MemoryPersistenceAdapter', 'State published to memory');
  }

  clear(): void {
    this.storage = {};
  }
}
