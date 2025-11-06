import { Howl } from "howler";

/**
 * WhatsApp Widget Notification Sound System
 *
 * This module provides a unified sound system for the WhatsApp widget that:
 * - Handles browser audio policies and user interaction requirements
 * - Prevents duplicate sounds through session-level controls
 * - Provides fallback mechanisms for failed audio playback
 * - Integrates with the welcome popup system for coordinated audio/visual experience
 *
 * @version 2.31 - Unified Popup + Sound Experience
 * @author MKP Apps
 */

export interface SoundPreferences {
  enabled: boolean;
  soundType: string;
  volume: number;
}

// Session-level control to prevent duplicate welcome sounds
let hasPlayedWelcomeSound = false;
let currentSessionId = Date.now().toString();

/**
 * HowlerNotificationSound - Core audio management class
 *
 * Handles all aspects of notification sound playback including:
 * - User interaction detection and audio context unlocking
 * - Sound preloading and fallback mechanisms
 * - Session-based duplicate prevention
 * - Welcome popup coordination
 */
class HowlerNotificationSound {
  // Core state
  private sounds: Map<string, Howl> = new Map();
  private currentPreferences: SoundPreferences = {
    enabled: true,
    soundType:
      "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/sounds/notification-sound-pop.mp3",
    volume: 0.8,
  };

  // User interaction tracking
  private userInteracted: boolean = false;
  private interactionPromise: Promise<void>;
  private interactionResolve?: () => void;

  // Fallback system for failed audio attempts
  private fallbackHandler?: () => void;
  private triggerHandler?: (event: Event) => void;

  // Performance optimizations
  private lastCanPlayLog: number = 0;
  private canPlayLogThrottle: number = 30000; // Log every 30 seconds when not ready
  private isWaitingForInteraction: boolean = false;

  constructor() {
    // Create a promise that resolves when user interacts
    this.interactionPromise = new Promise((resolve) => {
      this.interactionResolve = resolve;
    });

    this.setupUserInteraction();
    this.preloadSounds();
  }

  // Cleanup method for proper resource management
  cleanup(): void {
    this.removeFallbackListeners();

    // Clean up trigger handlers
    if (this.triggerHandler) {
      this.removeTriggerListeners(this.triggerHandler);
      this.triggerHandler = undefined;
    }

    // Reset waiting flag
    this.isWaitingForInteraction = false;

    // Don't unload sounds immediately - just remove event listeners
    // Sounds will be reused on next initialization
  }

  // Method to force reload sounds if needed
  reloadSounds(): void {
    // Clear existing sounds
    this.sounds.forEach((howl) => {
      howl.unload();
    });
    this.sounds.clear();

    // Reload them
    this.preloadSounds();
  }

  // New method: Wait for user interaction and trigger callback when ready
  waitForInteractionAndTrigger(
    callback: () => void,
    soundPreferences?: SoundPreferences
  ): void {
    // SESSION-LEVEL PROTECTION: Prevent duplicate welcome sounds per session
    if (hasPlayedWelcomeSound) {
      callback();
      return;
    }

    // Clean up any existing fallback handlers first to prevent conflicts
    this.removeFallbackListeners();

    if (this.userInteracted) {
      // User has already interacted, trigger immediately
      hasPlayedWelcomeSound = true; // Mark as played
      if (soundPreferences) {
        this.updatePreferences(soundPreferences);
        this.play();
      }
      callback();
      return;
    }

    // Prevent multiple simultaneous setups
    if (this.isWaitingForInteraction) {
      return;
    }

    this.isWaitingForInteraction = true;

    // Set up one-time listener for user interaction
    let triggered = false;
    const triggerCallback = (event: Event) => {
      if (triggered) return;
      triggered = true;

      // Mark welcome sound as played for this session
      hasPlayedWelcomeSound = true;

      // Clean up listeners
      this.removeTriggerListeners(triggerCallback);

      // Also clean up any fallback handlers to prevent conflicts
      this.removeFallbackListeners();

      // Reset the waiting flag
      this.isWaitingForInteraction = false;

      // Update user interaction state
      if (!this.userInteracted) {
        this.userInteracted = true;
        if (this.interactionResolve) {
          this.interactionResolve();
        }
      }

      // Play sound if preferences provided
      if (soundPreferences) {
        this.updatePreferences(soundPreferences);
        this.play();
      }

      // Trigger the callback (show popup)
      callback();
    };

    // Store the handler for cleanup
    this.triggerHandler = triggerCallback;

    // Add event listeners for user gestures
    const events = ["click", "touchstart", "keydown", "mousedown"];
    events.forEach((event) => {
      document.addEventListener(event, triggerCallback, {
        once: true,
        passive: true,
      });
    });
  }

  private removeTriggerListeners(handler: (event: Event) => void): void {
    const events = ["click", "touchstart", "keydown", "mousedown"];
    events.forEach((event) => {
      document.removeEventListener(event, handler);
    });
  }

  private setupUserInteraction(): void {
    const enableInteraction = () => {
      if (!this.userInteracted) {
        this.userInteracted = true;
        // Resolve the interaction promise
        if (this.interactionResolve) {
          this.interactionResolve();
        }
      }
    };

    // Listen for user interactions - more comprehensive list
    const events = [
      "click",
      "touchstart",
      "keydown",
      "mousedown",
      "pointerdown",
      "touchend",
    ];
    events.forEach((event) => {
      document.addEventListener(event, enableInteraction, { passive: true });
    });
  }

  private preloadSounds(): void {
    const soundUrls = [
      "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/sounds/notification-sound-pop.mp3",
      "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/sounds/notification-sound-bell.mp3",
      "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/sounds/notification-sound-beep.mp3",
    ];

    soundUrls.forEach((url) => {
      const howl = new Howl({
        src: [url],
        volume: this.currentPreferences.volume,
        preload: true,
        html5: false, // Start with Web Audio API
        onload: () => {
          // Sound loaded successfully
        },
        onloaderror: (id, error) => {
          // Web Audio failed, create HTML5 fallback
          this.createHtml5Fallback(url);
        },
        onplayerror: (id, error) => {
          console.warn("⚠️ Howler play error - user interaction required");
        },
      });

      this.sounds.set(url, howl);
    });
  }

  private createHtml5Fallback(url: string): void {
    const fallbackHowl = new Howl({
      src: [url],
      volume: this.currentPreferences.volume,
      preload: true,
      html5: true, // Force HTML5 Audio
      onload: () => {
        // Replace the failed Web Audio instance
        this.sounds.set(url, fallbackHowl);
      },
      onloaderror: (id, error) => {
        console.error("❌ Howler complete failure for:", url, error);
      },
    });
  }

  updatePreferences(preferences: SoundPreferences): void {
    this.currentPreferences = { ...preferences };

    // Update volume for all loaded sounds
    this.sounds.forEach((howl) => {
      howl.volume(preferences.volume);
    });
  }

  // Wait for user interaction before playing
  async waitForUserInteraction(): Promise<void> {
    if (this.userInteracted) {
      return Promise.resolve();
    }
    return this.interactionPromise;
  }

  async play(): Promise<boolean> {
    if (!this.currentPreferences.enabled) {
      return false;
    }

    const soundUrl = this.currentPreferences.soundType;
    let howl = this.sounds.get(soundUrl);

    if (!howl) {
      // Try to reload the sounds if they're missing
      this.preloadSounds();

      // Wait a bit for preloading to start
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Try again
      howl = this.sounds.get(soundUrl);

      if (!howl) {
        return false;
      }
    }

    try {
      // Set volume
      howl.volume(this.currentPreferences.volume);

      // Play the sound - this follows the guide's recommended pattern
      const soundId = howl.play();

      if (soundId) {
        return true;
      } else {
        // Implement the guide's fallback pattern
        this.setupFallbackOnUserGesture(howl);
        return false;
      }
    } catch (error) {
      console.error("❌ Error playing Howler sound:", error);
      // Implement the guide's fallback pattern for caught errors
      this.setupFallbackOnUserGesture(howl);
      return false;
    }
  }

  // New method: Implements the guide's recommended fallback pattern
  private setupFallbackOnUserGesture(howl: Howl): void {
    if (this.userInteracted) {
      // User has already interacted, this shouldn't have failed
      return;
    }

    const playOnGesture = () => {
      try {
        howl.volume(this.currentPreferences.volume);
        howl.play();
      } catch (error) {
        console.error("❌ Fallback sound error:", error);
      }

      // Remove listeners after first use
      this.removeFallbackListeners();
    };

    // Store the handler so we can remove it later
    this.fallbackHandler = playOnGesture;

    // Add event listeners for user gestures (as recommended in the guide)
    const events = ["click", "touchstart", "keydown", "mousedown"];
    events.forEach((event) => {
      document.addEventListener(event, playOnGesture, {
        once: true,
        passive: true,
      });
    });
  }

  private removeFallbackListeners(): void {
    if (this.fallbackHandler) {
      const events = ["click", "touchstart", "keydown", "mousedown"];
      events.forEach((event) => {
        document.removeEventListener(event, this.fallbackHandler!);
      });
      this.fallbackHandler = undefined;
    }
  }

  // Public method to remove fallback listeners (for external cleanup)
  public removeFallbackHandlers(): void {
    this.removeFallbackListeners();
  }

  // Force enable user interaction (for debugging)
  forceEnableInteraction(): void {
    if (!this.userInteracted) {
      this.userInteracted = true;
      if (this.interactionResolve) {
        this.interactionResolve();
      }
    }
  }

  canPlay(): boolean {
    const soundUrl = this.currentPreferences.soundType;
    let howl = this.sounds.get(soundUrl);

    // If howl doesn't exist, try to reload sounds (but don't wait for loading)
    if (!howl && this.sounds.size === 0) {
      this.preloadSounds();
      // Re-check after triggering preload
      howl = this.sounds.get(soundUrl);
    }

    const loaded = howl && howl.state() === "loaded";
    const result = !!loaded && this.userInteracted;

    // Reduce logging frequency - only log every 30 seconds and only if not ready
    const now = Date.now();
    if (now - this.lastCanPlayLog > this.canPlayLogThrottle && !result) {
      console.log("🤔 Howler canPlay check:", {
        soundExists: !!howl,
        loaded,
        userInteracted: this.userInteracted,
        soundsMapSize: this.sounds.size,
      });
      this.lastCanPlayLog = now;
    }

    return result;
  }

  hasUserInteracted(): boolean {
    return this.userInteracted;
  }

  getStatus() {
    const soundUrl = this.currentPreferences.soundType;
    const howl = this.sounds.get(soundUrl);

    return {
      library: "Howler.js",
      userInteracted: this.userInteracted,
      canPlay: this.canPlay(),
      currentSound: {
        url: soundUrl,
        loaded: howl ? howl.state() === "loaded" : false,
        state: howl ? howl.state() : "not-found",
      },
      allSounds: Array.from(this.sounds.entries()).map(([url, howl]) => ({
        url: url.split("/").pop()?.split(".")[0] || url,
        loaded: howl.state() === "loaded",
        state: howl.state(),
      })),
      volume: this.currentPreferences.volume,
      enabled: this.currentPreferences.enabled,
      // Session-level control
      session: {
        sessionId: currentSessionId,
        hasPlayedWelcomeSound: hasPlayedWelcomeSound,
      },
      // Debug info for event handlers
      debug: {
        hasFallbackHandler: !!this.fallbackHandler,
        hasTriggerHandler: !!this.triggerHandler,
        isWaitingForInteraction: this.isWaitingForInteraction,
      },
    };
  }

  // Debug method to show current handler state
  debugHandlerState(): void {
    console.log("🔍 DEBUG: Current handler state:", {
      fallbackHandler: !!this.fallbackHandler,
      triggerHandler: !!this.triggerHandler,
      userInteracted: this.userInteracted,
      isWaitingForInteraction: this.isWaitingForInteraction,
      sessionId: currentSessionId,
      hasPlayedWelcomeSound: hasPlayedWelcomeSound,
    });
  }

  // Reset session state (for debugging)
  resetSessionState(): void {
    hasPlayedWelcomeSound = false;
    currentSessionId = Date.now().toString();
  }
}

// Create singleton instance
const howlerNotificationSound = new HowlerNotificationSound();

// Export convenience functions with better error handling
export const updateSoundPreferences = async (
  preferences: SoundPreferences
): Promise<void> => {
  howlerNotificationSound.updatePreferences(preferences);
  return Promise.resolve();
};

export const playNotificationSound = (): Promise<boolean> => {
  return howlerNotificationSound.play();
};

export const canPlaySound = (): boolean => {
  return howlerNotificationSound.canPlay();
};

export const hasUserInteracted = (): boolean => {
  return howlerNotificationSound.hasUserInteracted();
};

export const getSoundStatus = () => {
  return howlerNotificationSound.getStatus();
};

export const initNotificationSound = (): Promise<void> => {
  return Promise.resolve();
};

export const waitForUserInteraction = (): Promise<void> => {
  return howlerNotificationSound.waitForUserInteraction();
};

export const forceEnableInteraction = (): void => {
  return howlerNotificationSound.forceEnableInteraction();
};

export const cleanupNotificationSound = (): void => {
  howlerNotificationSound.cleanup();
};

export const removeFallbackHandlers = (): void => {
  howlerNotificationSound.removeFallbackHandlers();
};

export const reloadNotificationSounds = (): void => {
  howlerNotificationSound.reloadSounds();
};

export const waitForInteractionAndTrigger = (
  callback: () => void,
  soundPreferences?: SoundPreferences
): void => {
  return howlerNotificationSound.waitForInteractionAndTrigger(
    callback,
    soundPreferences
  );
};

export const debugHandlerState = (): void => {
  return howlerNotificationSound.debugHandlerState();
};

export const resetWelcomeSoundSession = (): void => {
  return howlerNotificationSound.resetSessionState();
};

// Sound URLs constants for compatibility
export const SOUND_OPTIONS = {
  POP: "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/sounds/notification-sound-pop.mp3",
  BELL: "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/sounds/notification-sound-bell.mp3",
  BEEP: "https://mkp-prod.nyc3.cdn.digitaloceanspaces.com/whatsapp-chat/assets/sounds/notification-sound-beep.mp3",
  NONE: "",
};

// Expose to window for debugging
if (typeof window !== "undefined") {
  (window as any).howlerNotificationSound = howlerNotificationSound;
  (window as any).forceEnableInteraction = forceEnableInteraction;
  (window as any).debugHandlerState = debugHandlerState;
  (window as any).resetWelcomeSoundSession = resetWelcomeSoundSession;
  (window as any).debugSoundSystem = {
    getStatus: getSoundStatus,
    debugHandlers: debugHandlerState,
    playSound: playNotificationSound,
    hasUserInteracted: hasUserInteracted,
    resetSession: resetWelcomeSoundSession,
  };
}

// Export class for direct access if needed
export { HowlerNotificationSound };
export default howlerNotificationSound;
