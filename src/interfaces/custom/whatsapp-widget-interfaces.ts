export interface WidgetPosition {
  position: "left" | "right";
}

export interface ElementStyles {
  styles?: React.CSSProperties;
}

export interface WidgetOptions {
  widgetState: string;
  draftWidgetState: string;
}

export interface WhatsAppAgentAvailableTime {
  startHour: number; // 0-23
  endHour: number; // 0-23
  availableDays: {
    [key: string]: boolean; // e.g., { Monday: true, Tuesday: false }
  };
}

export interface WhatsAppAgent {
  id: string;
  name: string;
  role?: string;
  phoneNumber: string;
  email?: string;
  isVisible?: boolean;
  availableTime: WhatsAppAgentAvailableTime;
  imageUrl?: string;
  showRole?: boolean;
  initialMessage?: string;
  introMessage: string;
  statusIndicator: {
    indicator: "none" | "bulb" | "text" | "both";
    textOnline?: string;
    textOffline?: string;
  };
}

export interface WidgetContent {
  headerTitle: string;
  headerSubtitle: string;
  members: WhatsAppAgent[];
  footerText: string;
  badgeText: string;
  badgeIcon?: number | string;
  badgeIndicatorEnabled?: boolean;
  badgeIndicatorMode?: "smart" | "always";
  badgeIndicatorResetKey?: string;
  mainBehavior: "direct" | "single-chat" | "multi-chat";
  chatInputMode?: "input" | "button";
  chatButtonLabel?: string;
  showWelcomePopup?: boolean;
  welcomeMessage?: string;
  welcomeContentType: "custom" | "agent";
  welcomePopupDelay?: number; // Delay before showing popup (milliseconds)
  welcomePopupDuration?: number; // Auto-hide duration (milliseconds)
  welcomePopupSoundEnabled?: boolean; // Enable/disable notification sound
  welcomePopupSoundType?: string; // Sound type: "pop", "bell", "none"
  welcomePopupSoundVolume?: number; // Sound volume (0.0 - 1.0)
  unavailableAgentBehavior: "show" | "hide";
  welcomePopupRepeatMode?: "perSession" | "perReload";
}

export interface WidgetVisibilityData {
  visibilityOption: "all-pages" | "special-pages";
  visibilityPagePaths: string[];
}

export interface WidgetStyles {
  D_Avatar_IndicatorActiveColor: string;
  D_Avatar_IndicatorDisabledColor: string;
  D_Text_HighEmphasisColor: string;
  D_Text_LowEmphasisColor: string;
  D_Text_DisabledColor: string;
  D_Btn_BackgroundColor: string;
  D_Btn_TextColor: string;
  D_Card_BackgroundColor: string;
  D_Header_BackgroundColor: string;
  D_Header_Text_HighEmphasisColor: string;
  D_Header_Text_LowEmphasisColor: string;
  D_Content_BackgroundColor: string;
  D_Content_BorderColor: string;
  D_Content_BackgroundImage: string;
  D_Footer_BackgroundColor: string;
  D_Badge_IndicatorColor: string;
  L_Widget_FontFamily: string;
  L_Widget_CornerRounding: number;
  L_Widget_FontSize: number;
  L_Widget_MaxWidth: number;
  L_Widget_PositionAlign: "left" | "right";
  L_Widget_Position: {
    bottom?: number;
    left?: number;
    right?: number;
  };
  L_Widget_Position_Mobile: {
    bottom?: number;
    left?: number;
    right?: number;
  };
  L_Widget_PositionAlign_Mobile: "left" | "right";
  L_Widget_ElementGap: number;
  L_Widget_ZIndex: number;
  D_Badge_BackgroundColor: string;
  D_Badge_TextColor: string;
  L_Badge_Size: number;
  L_Badge_Size_Mobile: number;
  L_Badge_CornerRounding: CornerRadius;
  L_Badge_CornerRounding_Mobile: CornerRadius;
  D_Widget_Theme: string;
}

export interface CornerRadius {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
  linked?: boolean;
}
