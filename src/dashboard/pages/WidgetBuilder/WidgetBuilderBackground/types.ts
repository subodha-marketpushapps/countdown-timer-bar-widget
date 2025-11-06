/**
 * Types for Widget Builder Background Component
 */

export interface WidgetBuilderBackgroundProps {
  /** React children to render on top of the background */
  children: React.ReactNode;
}

export type WebsiteLoadStatus = "loading" | "loaded" | "failed";

export type BackgroundMode = "clean" | "website";

export type ViewType = "desktopView" | "mobileView";

export interface BackgroundState {
  backgroundMode: BackgroundMode;
  websiteLoadStatus: WebsiteLoadStatus;
  viewType: ViewType;
}
