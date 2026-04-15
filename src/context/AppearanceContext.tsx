/* eslint-disable react-refresh/only-export-components -- 主题 Provider 与 useAppearance 同文件 */
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { AppearanceMode } from "@/theme/appearance";
import {
    applyAppearanceToDocument,
    persistAppearance,
    readStoredAppearance,
} from "@/theme/appearance";

type AppearanceContextValue = {
    mode: AppearanceMode;
    setMode: (m: AppearanceMode) => void;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export const AppearanceProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [mode, setModeState] = useState<AppearanceMode>(() => readStoredAppearance());

    const setMode = useCallback((m: AppearanceMode) => {
        setModeState(m);
        applyAppearanceToDocument(m);
        persistAppearance(m);
    }, []);

    const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

    return (
        <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
    );
};

export function useAppearance(): AppearanceContextValue {
    const ctx = useContext(AppearanceContext);
    if (!ctx) {
        throw new Error("useAppearance must be used within AppearanceProvider");
    }
    return ctx;
}
