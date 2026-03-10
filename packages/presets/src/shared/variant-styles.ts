export type StepVariant = "default" | "primary" | "success" | "warning" | "danger";

export const VARIANT_STYLES: Record<StepVariant, { bg: string; border: string; text: string }> = {
  default: {
    bg: "var(--siren-node, hsl(0 0% 12.2%))",
    border: "var(--siren-node-border, hsl(0 0% 18%))",
    text: "var(--siren-text, hsl(0 0% 98%))",
  },
  primary: {
    bg: "var(--siren-primary, #0068b8)",
    border: "var(--siren-primary, #0068b8)",
    text: "#ffffff",
  },
  success: {
    bg: "var(--siren-success, #18794e)",
    border: "var(--siren-success, #18794e)",
    text: "#ffffff",
  },
  warning: {
    bg: "var(--siren-warning, #ffc53d)",
    border: "var(--siren-warning, #ffc53d)",
    text: "hsl(0 0% 9%)",
  },
  danger: {
    bg: "var(--siren-danger, #cd2b31)",
    border: "var(--siren-danger, #cd2b31)",
    text: "#ffffff",
  },
};

export const BASE_TEXT_STYLE: React.CSSProperties = {
  fontFamily: "var(--siren-font, system-ui)",
  fontSize: "14px",
  fontWeight: 400,
  letterSpacing: "0.01em",
  textAlign: "center",
};
