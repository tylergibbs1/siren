export interface SirenTheme {
  colors: {
    /** Page-level background (darkest layer) */
    background: string;
    /** Default surface (panels, sidebars) */
    surface: string;
    /** Raised surface (cards, nodes, popovers) */
    surfaceRaised: string;
    /** Node fill */
    node: string;
    /** Default node border — subtle, low-contrast */
    nodeBorder: string;
    /** Strong border for focus/emphasis */
    borderStrong: string;
    /** Edge/connector stroke */
    edge: string;
    /** Primary text */
    text: string;
    /** Secondary text */
    textMuted: string;
    /** Tertiary text (placeholders, disabled) */
    textSubtle: string;
    /** Brand accent */
    primary: string;
    /** Tinted background for primary accent areas */
    primaryMuted: string;
    success: string;
    warning: string;
    danger: string;
  };
  radius: string;
  fontFamily: string;
  fontMono: string;
}
