export const APPEARANCE_STORAGE_KEY = "sr-appearance";

export type AppearanceMode = "light" | "sepia" | "dark";

const MODES: AppearanceMode[] = ["light", "sepia", "dark"];

function isAppearanceMode(v: string | null): v is AppearanceMode {
    return v !== null && (MODES as string[]).includes(v);
}

export function readStoredAppearance(): AppearanceMode {
    try {
        const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
        if (isAppearanceMode(raw)) return raw;
    } catch {
        /* ignore */
    }
    return "light";
}

export function applyAppearanceToDocument(mode: AppearanceMode): void {
    document.documentElement.dataset.theme = mode;
}

export function persistAppearance(mode: AppearanceMode): void {
    try {
        localStorage.setItem(APPEARANCE_STORAGE_KEY, mode);
    } catch {
        /* ignore */
    }
}
