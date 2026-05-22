export const TOAST_DURATION_MS = 3000;

export type ToastKind = "success" | "error" | "warning" | "info";

export type ToastTheme = {
  iconName: "check" | "x" | "alert" | "info";
  containerClassName: string;
  iconClassName: string;
};

export function getToastTheme(kind: ToastKind): ToastTheme {
  switch (kind) {
    case "success":
      return {
        iconName: "check",
        containerClassName: "border-emerald-200 bg-emerald-50 text-emerald-900",
        iconClassName: "bg-emerald-600 text-white"
      };
    case "error":
      return {
        iconName: "x",
        containerClassName: "border-rose-200 bg-rose-50 text-rose-900",
        iconClassName: "bg-rose-600 text-white"
      };
    case "warning":
      return {
        iconName: "alert",
        containerClassName: "border-amber-200 bg-amber-50 text-amber-900",
        iconClassName: "bg-amber-500 text-slate-950"
      };
    default:
      return {
        iconName: "info",
        containerClassName: "border-cyan-200 bg-cyan-50 text-cyan-950",
        iconClassName: "bg-cyan-600 text-white"
      };
  }
}
