export const primaryNavigationItems = [
  {
    href: "/",
    label: "Dashboard"
  },
  {
    href: "/settings",
    label: "Settings"
  }
] as const;

export function isPrimaryRoute(pathname: string, href: string): boolean {
  return pathname === href;
}
