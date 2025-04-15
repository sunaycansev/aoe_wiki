import "./App.css";

import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import styles from "./App.module.scss";
import { AppInitializer } from "./components/AppInitializer";
import { Spinner } from "./components/Spinner";

function App() {
  return (
    <div className={styles.app}>
      <Suspense fallback={<Spinner overlay />}>
        <AppInitializer />
        <Outlet />
      </Suspense>
    </div>
  );
}

export default App;
