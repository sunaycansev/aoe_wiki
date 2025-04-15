import { Outlet } from "react-router-dom";

import { Navigation } from "../components/Navigation";
import styles from "./MainLayout.module.scss";

export const MainLayout = () => {
  return (
    <div className={styles.layoutContainer}>
      <header className={styles.header}>
        <Navigation />
      </header>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};
