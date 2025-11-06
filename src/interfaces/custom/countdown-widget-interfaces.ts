// Clock Component Interfaces
export interface ClockProps {
  labelPosition: "top" | "bottom";
  numberStyle:
    | "outline"
    | "filled"
    | "none"
    | "fillEachDigit"
    | "outlineEachDigit";
  endDate: Date;
  endTime: string; // "HH:MM" or "HH:MM:SS"
  backgroundColor?: string;
  textColor?: string;
}

// Countdown Template Interfaces
export interface CountdownBannerProps {
  clockConfig: ClockProps;
  title: string;
  subTitle: string;
  buttonText: string;
  buttonLink: string; // Redirect URL
  scale?: number; // Zoom scale (e.g., 0.8 for 80% size)
}

// Timer Mode Types
export type TimerMode = "start-to-finish-timer" | "personal-countdown" | "number-counter";

// Action After Timer Finishes
export type TimerFinishAction = "hide" | "show-message" | "redirect";

// Display Options
export interface TimerDisplayOptions {
  showDays: boolean;
  showHours: boolean;
  showMinutes: boolean;
  showSeconds: boolean;
}

// Timer Configuration
export interface TimerConfig {
  startDate: Date;
  startTime: string; // "HH:MM" or "HH:MM:SS"
  endDate: Date;
  endTime: string; // "HH:MM" or "HH:MM:SS"
  timeZone: string;
  displayOptions: TimerDisplayOptions;
}

// Action Configuration
export interface TimerActionConfig {
  action: TimerFinishAction;
  message?: string; // Shown when action is "show-message"
  redirectUrl?: string; // Used when action is "redirect"
  showCountries?: boolean; // Show country selector
  showButton?: boolean; // Show action button
}

// Widget Content Interface (PanelContent, PanelTimer, PanelAppearance)
export interface WidgetContent {
  // Content Section (PanelContent)
  title: string;
  subtitle: string;
  
  // Button Configuration
  showButton: boolean;
  buttonText: string;
  buttonLink: string;
  makeEntireTimerClickable: boolean;
  openInNewTab: boolean;
  
  // Close Button
  showCloseButton: boolean;
  
  // Timer Section (PanelTimer)
  timerMode: TimerMode;
  timerConfig: TimerConfig;
  actionConfig: TimerActionConfig;
  
  // Appearance Section (PanelAppearance)
  selectedTemplate?: string; // Template ID
  selectedClockStyle?: string; // Clock style ID
  selectedTheme?: string; // Theme background image ID
}

// Position Types
export type BannerPosition = 
  | "centered_overlay" 
  | "static_top" 
  | "floating_top" 
  | "floating_bottom";

// Widget Styles Interface (PanelLayout, PanelPosition, PanelDesign)
export interface WidgetStyles {
  // Layout Properties
  L_Widget_MaxWidth: number;
  L_Widget_ElementGap: number;
  L_Widget_FontSize: number;
  L_Widget_FontFamily: string;
  L_Widget_CornerRounding: number;
  L_Widget_ZIndex: number;
  
  // Position Properties
  L_Widget_Position: BannerPosition;
  L_Widget_Position_Desktop: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  L_Widget_Position_Mobile: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  L_Widget_PositionAlign_Desktop?: "left" | "right" | "center";
  L_Widget_PositionAlign_Mobile?: "left" | "right" | "center";
  
  // Design/Theme Properties
  D_Widget_BackgroundColor: string;
  D_Widget_TextColor: string;
  D_Widget_ButtonBackgroundColor: string;
  D_Widget_ButtonTextColor: string;
  D_Widget_BackgroundImage?: string;
  D_Widget_Theme?: string;
  
  // Clock Style Properties
  D_Clock_BackgroundColor: string;
  D_Clock_TextColor: string;
  D_Clock_NumberStyle: ClockProps["numberStyle"];
  D_Clock_LabelPosition: ClockProps["labelPosition"];
}

// Visibility Configuration
export interface WidgetVisibilityData {
  visibilityOption: "all-pages" | "special-pages";
  visibilityPagePaths: string[];
}

// Widget Options
export interface WidgetOptions {
  widgetState: string;
  draftWidgetState: string;
}

// Complete Widget State
export interface CountdownWidgetState {
  content: WidgetContent;
  styles: WidgetStyles;
  visibility: WidgetVisibilityData;
  options: WidgetOptions;
}

// Template Selection
export interface TemplateSelection {
  templateId: string;
  templateLabel: string;
}

// Theme Selection
export interface ThemeSelection {
  themeId: string;
  themeLabel: string;
  themeImageUrl?: string;
}

// Clock Style Selection
export interface ClockStyleSelection {
  styleId: string;
  styleLabel: string;
  clockConfig: ClockProps;
}

