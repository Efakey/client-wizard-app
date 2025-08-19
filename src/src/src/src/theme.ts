export const BRAND = (globalThis as any).__APP_BRAND as string;
export const PRIMARY = (globalThis as any).__PRIMARY_COLOR as string;
export const ACCENT = (globalThis as any).__ACCENT_COLOR as string;
export const brandStyles = {'--primary':PRIMARY,'--accent':ACCENT} as React.CSSProperties;
