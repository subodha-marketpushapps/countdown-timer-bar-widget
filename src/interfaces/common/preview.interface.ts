export type PreviewAction =
  | "mkp.preview.hide"
  | "mkp.preview.show"
  | "mkpHideWidget"
  | "mkpShowWidget";

export interface PreviewMessage {
  action: PreviewAction;
  widgetKey?: string; // when provided, only the matching widget should react
  source?: string;
}
