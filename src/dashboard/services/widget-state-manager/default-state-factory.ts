import { WidgetState } from "../../../interfaces/custom/widget-state-interface";
import {
  DEFAULT_WIDGET_CONTENT,
  DEFAULT_WIDGET_STYLES,
  DEFAULT_VISIBILITY_DATA,
} from "../../../constants/data";
import { debugLogger } from "../../utils/debug-logger";
import { objectToBase64, base64ToObject } from "../../utils/base64-utils";

/**
 * Creates a default widget state for new users
 * This provides a complete, functional widget configuration out of the box
 */
export function createDefaultWidgetState(): WidgetState {
  const defaultState: WidgetState = {
    content: { ...DEFAULT_WIDGET_CONTENT },
    styles: { ...DEFAULT_WIDGET_STYLES },
    isVisible: false, // New widgets start not visible
    visibilityData: { ...DEFAULT_VISIBILITY_DATA },
  };

  debugLogger.info("DefaultStateFactory", "Created default widget state", {
    agentCount: defaultState.content.members.length,
    theme: defaultState.styles.D_Widget_Theme,
    isVisible: defaultState.isVisible,
  });

  return defaultState;
}

/**
 * Validates if a state object is a complete WidgetState
 * Returns true if the state has all required properties
 * NOTE: enabled field is optional for backward compatibility
 */
export function isValidWidgetState(state: any): state is WidgetState {
  if (!state || typeof state !== "object") {
    return false;
  }

  // Check for required top-level properties
  // enabled field is optional for backward compatibility with existing data
  if (!state.content || !state.styles) {
    return false;
  }

  // Basic content validation
  const hasRequiredContent =
    typeof state.content.headerTitle === "string" &&
    Array.isArray(state.content.members) &&
    state.content.members.length > 0;

  // Basic styles validation
  const hasRequiredStyles =
    typeof state.styles.D_Avatar_IndicatorActiveColor === "string" &&
    typeof state.styles.D_Card_BackgroundColor === "string";

  return hasRequiredContent && hasRequiredStyles;
}

/**
 * Merges partial state with defaults to ensure complete state
 * Useful when API returns incomplete data or legacy data without enabled field
 */
export function ensureCompleteWidgetState(partialState: any): WidgetState {
  const defaultState = createDefaultWidgetState();

  if (!partialState || !isValidWidgetState(partialState)) {
    debugLogger.warn(
      "DefaultStateFactory",
      "Invalid state provided, using defaults",
      partialState
    );
    return defaultState;
  }

  // Merge with defaults to ensure no missing properties
  // Handle backward compatibility for isVisible field (migrate from old enabled/published fields)
  const legacyEnabled = (partialState as any).enabled; // Safe access for migration
  const legacyPublished = (partialState as any).published; // Safe access for migration
  return {
    content: { ...defaultState.content, ...partialState.content },
    styles: { ...defaultState.styles, ...partialState.styles },
    isVisible:
      partialState.isVisible ?? legacyPublished ?? legacyEnabled ?? false, // Migrate enabled/published->isVisible for backward compatibility
    visibilityData: partialState.visibilityData
      ? { ...defaultState.visibilityData, ...partialState.visibilityData }
      : defaultState.visibilityData, // Ensure visibility data is preserved
  };
}

/**
 * Creates widget state parameters for Wix embedded scripts
 * Transforms WidgetState into the format expected by Wix embedded script
 * Must match ALL dynamic parameters defined in embedded.html
 */
export function createEmbedScriptParameters(
  publishedState: WidgetState,
  draftState?: WidgetState | null,
  hasUnsavedChanges: boolean = false
): Record<string, string> {
  console.log("🚀 ~ draftState:", draftState);
  try {
    const currentTime = Date.now().toString();

    // Create parameters that match embedded.html dynamic parameters exactly
    const parameters = {
      // Main widget states - matches {{widgetState}} and {{draftWidgetState}} in embedded.html
      widgetState: objectToBase64(publishedState),
      draftWidgetState: draftState
        ? objectToBase64(draftState)
        : objectToBase64(publishedState),

      // Metadata parameters - must match embedded.html dynamic parameters
      version: "2.1.0",
      timestamp: currentTime,
      checksum: generateStateChecksum(publishedState),
      lastModified: currentTime,
      hasUnsavedChanges: hasUnsavedChanges.toString(),
    };

    debugLogger.info("DefaultStateFactory", "Created embed script parameters", {
      parameterKeys: Object.keys(parameters),
      publishedStateSize: parameters.widgetState.length,
      draftStateSize: parameters.draftWidgetState.length,
      hasUnsavedChanges,
      version: parameters.version,
    });

    return parameters;
  } catch (error) {
    debugLogger.error(
      "DefaultStateFactory",
      "Failed to create embed parameters",
      error
    );
    throw new Error("Failed to create embed script parameters");
  }
}

/**
 * Parses widget state from Wix embedded script parameters
 * Handles the reverse operation of createEmbedScriptParameters
 * Matches the parameter format used by embedded.html
 */
export function parseEmbedScriptParameters(
  parameters: Record<string, string>
): WidgetState | null {
  try {
    if (!parameters.widgetState) {
      debugLogger.warn(
        "DefaultStateFactory",
        "No widgetState found in parameters"
      );
      return null;
    }

    // Decode the base64-encoded widget state
    const parsedState = base64ToObject(parameters.widgetState) as WidgetState;

    if (!isValidWidgetState(parsedState)) {
      debugLogger.warn(
        "DefaultStateFactory",
        "Invalid widget state in parameters"
      );
      return null;
    }

    debugLogger.info(
      "DefaultStateFactory",
      "Successfully parsed widget state from parameters",
      {
        hasStyles: !!parsedState.styles,
        hasContent: !!parsedState.content,
        agentCount: parsedState.content.members?.length || 0,
        version: parameters.version,
      }
    );

    return parsedState;
  } catch (error) {
    debugLogger.error(
      "DefaultStateFactory",
      "Failed to parse embed parameters",
      error
    );
    return null;
  }
}

/**
 * Generates a simple checksum for state verification
 * Used to verify state integrity in embed parameters
 */
function generateStateChecksum(state: WidgetState): string {
  try {
    const stateString = JSON.stringify(state);
    // Simple hash function for checksum
    let hash = 0;
    for (let i = 0; i < stateString.length; i++) {
      const char = stateString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  } catch (error) {
    debugLogger.error(
      "DefaultStateFactory",
      "Failed to generate checksum",
      error
    );
    return Date.now().toString(16);
  }
}
