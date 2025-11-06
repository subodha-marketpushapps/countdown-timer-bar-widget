import { WidgetState } from "../../../interfaces/custom/widget-state-interface";
import { WhatsAppAgent } from "../../../interfaces";
import { ValidationError } from "./types";
// import { validatePhoneNumber } from "../../utils/validators";

export class WidgetStateValidator {
  static validateWidgetState(state: WidgetState): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate content
    errors.push(...this.validateContent(state.content));

    // Validate styles
    errors.push(...this.validateStyles(state.styles));

    return errors;
  }

  static validateContent(content: any): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate main behavior
    if (
      !["direct", "single-chat", "multi-chat"].includes(content.mainBehavior)
    ) {
      errors.push({
        field: "content.mainBehavior",
        message: "Invalid main behavior type",
        severity: "error",
      });
    }

    // Validate chat input mode (only for chat behaviors)
    if (content.mainBehavior !== "direct" && content.chatInputMode) {
      if (!["input", "button"].includes(content.chatInputMode)) {
        errors.push({
          field: "content.chatInputMode",
          message: "Invalid chat input mode. Must be 'input' or 'button'",
          severity: "error",
        });
      }

      // Validate button label when button mode is selected
      if (content.chatInputMode === "button") {
        if (!content.chatButtonLabel || content.chatButtonLabel.trim().length === 0) {
          errors.push({
            field: "content.chatButtonLabel",
            message: "Button label is required when using direct button mode",
            severity: "error",
          });
        } else if (content.chatButtonLabel.length > 50) {
          errors.push({
            field: "content.chatButtonLabel",
            message: "Button label must be 50 characters or less",
            severity: "error",
          });
        }
      }
    }

    // Validate agents
    if (!content.members || !Array.isArray(content.members)) {
      errors.push({
        field: "content.members",
        message: "Members array is required",
        severity: "error",
      });
    } else {
      // errors.push(...this.validateAgents(content.members));
    }

    // Validate agent visibility for different behaviors
    const visibleAgents =
      content.members?.filter((agent: WhatsAppAgent) => agent.isVisible) || [];

    if (content.mainBehavior === "single-chat" && visibleAgents.length === 0) {
      errors.push({
        field: "content.members",
        message: "At least one agent must be visible for single-chat mode",
        severity: "error",
      });
    }

    if (content.mainBehavior === "multi-chat" && visibleAgents.length === 0) {
      errors.push({
        field: "content.members",
        message: "At least one agent must be visible for multi-chat mode",
        severity: "error",
      });
    }

    return errors;
  }

  // static validateAgents(agents: WhatsAppAgent[]): ValidationError[] {
  //   const errors: ValidationError[] = [];

  //   agents.forEach((agent, index) => {
  //     // Validate phone number
  //     if (!agent.phoneNumber || !validatePhoneNumber(agent.phoneNumber)) {
  //       errors.push({
  //         field: `content.members[${index}].phoneNumber`,
  //         message: `Invalid phone number for agent "${agent.name}"`,
  //         severity: "error",
  //       });
  //     }

  //     // Validate name
  //     if (!agent.name || agent.name.trim().length === 0) {
  //       errors.push({
  //         field: `content.members[${index}].name`,
  //         message: `Agent name is required`,
  //         severity: "error",
  //       });
  //     }

  //     // Validate availability time
  //     if (agent.availableTime) {
  //       const { startHour, endHour } = agent.availableTime;
  //       if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
  //         errors.push({
  //           field: `content.members[${index}].availableTime`,
  //           message: `Invalid availability hours for agent "${agent.name}"`,
  //           severity: "error",
  //         });
  //       }
  //     }

  //     // Validate intro message length
  //     if (agent.introMessage && agent.introMessage.length > 500) {
  //       errors.push({
  //         field: `content.members[${index}].introMessage`,
  //         message: `Intro message too long for agent "${agent.name}" (max 500 characters)`,
  //         severity: "warning",
  //       });
  //     }
  //   });

  //   return errors;
  // }

  static validateStyles(styles: any): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate colors
    if (
      styles.D_Badge_BackgroundColor &&
      !this.isValidColor(styles.D_Badge_BackgroundColor)
    ) {
      errors.push({
        field: "styles.D_Badge_BackgroundColor",
        message: "Invalid badge background color format",
        severity: "error",
      });
    }

    // Validate dimensions
    if (
      styles.L_Widget_MaxWidth &&
      (styles.L_Widget_MaxWidth < 200 || styles.L_Widget_MaxWidth > 800)
    ) {
      errors.push({
        field: "styles.L_Widget_MaxWidth",
        message: "Widget max width must be between 200 and 800 pixels",
        severity: "warning",
      });
    }

    // Validate position values
    if (styles.L_Widget_Position) {
      const { bottom, left, right } = styles.L_Widget_Position;
      if (bottom !== undefined && (bottom < 0 || bottom > 500)) {
        errors.push({
          field: "styles.L_Widget_Position.bottom",
          message: "Bottom position must be between 0 and 500 pixels",
          severity: "warning",
        });
      }
      if (left !== undefined && (left < 0 || left > 500)) {
        errors.push({
          field: "styles.L_Widget_Position.left",
          message: "Left position must be between 0 and 500 pixels",
          severity: "warning",
        });
      }
      if (right !== undefined && (right < 0 || right > 500)) {
        errors.push({
          field: "styles.L_Widget_Position.right",
          message: "Right position must be between 0 and 500 pixels",
          severity: "warning",
        });
      }
    }

    return errors;
  }

  private static isValidColor(color: string): boolean {
    // Check hex colors (6 or 8 characters including alpha channel)
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(color)) {
      return true;
    }

    // Check rgb/rgba colors
    if (
      /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[01]?\.?\d*)?\s*\)$/.test(
        color
      )
    ) {
      return true;
    }

    // Check named colors (basic validation)
    const namedColors = [
      "red",
      "blue",
      "green",
      "yellow",
      "black",
      "white",
      "transparent",
    ];
    return namedColors.includes(color.toLowerCase());
  }
}
