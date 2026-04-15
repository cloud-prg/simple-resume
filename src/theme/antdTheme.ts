import type { ThemeConfig } from "antd";
import { theme } from "antd";
import type { AppearanceMode } from "./appearance";

/** Ant Design token 与 CSS 变量语义对齐（避免部分组件无法解析 var()） */
const PALETTE: Record<
    AppearanceMode,
    {
        colorPrimary: string;
        colorBgBase: string;
        colorBgContainer: string;
        colorBgElevated: string;
        colorText: string;
        colorTextSecondary: string;
        colorTextTertiary: string;
        colorBorder: string;
        colorBorderSecondary: string;
    }
> = {
    light: {
        colorPrimary: "#2563eb",
        colorBgBase: "#f1f5f9",
        colorBgContainer: "#ffffff",
        colorBgElevated: "#ffffff",
        colorText: "#0f172a",
        colorTextSecondary: "#475569",
        colorTextTertiary: "#64748b",
        colorBorder: "#e2e8f0",
        colorBorderSecondary: "#e2e8f0",
    },
    sepia: {
        colorPrimary: "#c9a227",
        colorBgBase: "#ebe4d1",
        colorBgContainer: "#faf6ea",
        colorBgElevated: "#faf6ea",
        colorText: "#3b2f1f",
        colorTextSecondary: "#5c4a36",
        colorTextTertiary: "#7a6652",
        colorBorder: "#e0d4bc",
        colorBorderSecondary: "#e0d4bc",
    },
    dark: {
        colorPrimary: "#a78bfa",
        colorBgBase: "#0f0c14",
        colorBgContainer: "#1a1622",
        colorBgElevated: "#242030",
        colorText: "#ece8f4",
        colorTextSecondary: "#c4bdd9",
        colorTextTertiary: "#9d94b8",
        colorBorder: "#3f3658",
        colorBorderSecondary: "#3f3658",
    },
};

/** 深色下默认算法的主按钮字色偏灰，幽灵/默认按钮与侧栏对比不足，单独对齐紫系主题 */
const darkButtonTokens = {
    primaryColor: "#130c1e",
    solidTextColor: "#130c1e",
    defaultColor: "#ece8f4",
    defaultBg: "#2a2438",
    defaultBorderColor: "#52486a",
    defaultHoverBg: "#352e48",
    defaultHoverColor: "#f6f4ff",
    defaultHoverBorderColor: "#7c6ba3",
    defaultActiveBg: "#2f2840",
    defaultActiveColor: "#ffffff",
    defaultActiveBorderColor: "#a78bfa",
    defaultGhostColor: "#d4c4fc",
    defaultGhostBorderColor: "#7c6ba3",
    ghostBg: "transparent",
    borderColorDisabled: "#3d3552",
    textTextColor: "#c4b5fd",
    textTextHoverColor: "#e4dcff",
    textTextActiveColor: "#ffffff",
    textHoverBg: "rgba(167, 139, 250, 0.14)",
    linkHoverBg: "rgba(167, 139, 250, 0.12)",
} as const;

export function getAntdTheme(mode: AppearanceMode): ThemeConfig {
    const p = PALETTE[mode];
    const isDark = mode === "dark";
    return {
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
            colorPrimary: p.colorPrimary,
            colorBgBase: p.colorBgBase,
            colorBgContainer: p.colorBgContainer,
            colorBgElevated: p.colorBgElevated,
            colorText: p.colorText,
            colorTextSecondary: p.colorTextSecondary,
            colorTextTertiary: p.colorTextTertiary,
            colorBorder: p.colorBorder,
            colorBorderSecondary: p.colorBorderSecondary,
            /** Divider、部分列表分割线与表单项弱分割 */
            colorSplit: p.colorBorder,
            ...(isDark
                ? {
                      colorLink: "#c4b5fd",
                      colorLinkHover: "#e4dcff",
                      colorLinkActive: "#ffffff",
                  }
                : {}),
            borderRadius: 8,
        },
        components: {
            Modal: {
                contentBg: p.colorBgElevated,
                headerBg: p.colorBgElevated,
                titleColor: p.colorText,
                colorText: p.colorText,
                footerBg: p.colorBgElevated,
            },
            Drawer: {
                colorBgElevated: p.colorBgElevated,
            },
            Segmented: {
                itemSelectedBg: isDark ? "#2f2840" : mode === "sepia" ? "#f0e6d0" : "#e8eefc",
            },
            ...(isDark
                ? {
                      Button: { ...darkButtonTokens },
                      /** form-render 的 object 区块用 Card 包裹，默认易残留浅底 */
                      Card: {
                          colorBgContainer: "#1f1b2a",
                          headerBg: "#1f1b2a",
                      },
                  }
                : {}),
        },
    };
}
