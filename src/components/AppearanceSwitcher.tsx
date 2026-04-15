import React from "react";
import { useAppearance } from "@/context/AppearanceContext";
import type { AppearanceMode } from "@/theme/appearance";
import styles from "./AppearanceSwitcher.module.css";

const OPTIONS: { label: string; value: AppearanceMode }[] = [
    { label: "浅色", value: "light" },
    { label: "米色", value: "sepia" },
    { label: "深色", value: "dark" },
];

export const AppearanceSwitcher: React.FC = () => {
    const { mode, setMode } = useAppearance();
    return (
        <div className={styles.row} role="radiogroup" aria-label="外观">
            {OPTIONS.map((o, i) => (
                <React.Fragment key={o.value}>
                    {i > 0 ? <span className={styles.sep} aria-hidden>/</span> : null}
                    <label
                        className={`${styles.option} ${mode === o.value ? styles.active : ""}`}
                    >
                        <input
                            type="radio"
                            className={styles.srOnly}
                            name="sr-appearance"
                            value={o.value}
                            checked={mode === o.value}
                            onChange={() => setMode(o.value)}
                        />
                        {o.label}
                    </label>
                </React.Fragment>
            ))}
        </div>
    );
};
