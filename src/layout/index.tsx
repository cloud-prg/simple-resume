import React from "react";
import Header from "./components/Header";
import styles from "./index.module.css";
import { Outlet } from "react-router-dom";

const BasicLayout: React.FC<any> = () => {
    // const Index: any = () => {
    return <div className={styles.layout}>
        <Header />
        <div className={styles.content}>
            <Outlet />
        </div>
    </div>
}

export default BasicLayout;