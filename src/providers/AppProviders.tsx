import React, { useEffect } from "react";
import { ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import { AppearanceProvider, useAppearance } from "@/context/AppearanceContext";
import { applyAppearanceToDocument, readStoredAppearance } from "@/theme/appearance";
import { getAntdTheme } from "@/theme/antdTheme";

const ThemeBridge: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { mode } = useAppearance();

    useEffect(() => {
        applyAppearanceToDocument(mode);
    }, [mode]);

    return (
        <ConfigProvider locale={zhCN} theme={getAntdTheme(mode)}>
            {children}
        </ConfigProvider>
    );
};

/** 首屏同步主题，避免闪烁 */
function bootstrapAppearance(): void {
    applyAppearanceToDocument(readStoredAppearance());
}

bootstrapAppearance();

export const AppProviders: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <AppearanceProvider>
            <ThemeBridge>{children}</ThemeBridge>
        </AppearanceProvider>
    );
};
