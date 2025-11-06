import { WidgetContent, WidgetStyles, WidgetVisibilityData } from "./countdown-widget-interfaces";

export interface WidgetState {
  styles: WidgetStyles;
  content: WidgetContent;
  isVisible: boolean;
  visibilityData?: WidgetVisibilityData;
}

// Nullable published state for new users
export type PublishedWidgetState = WidgetState | null;
