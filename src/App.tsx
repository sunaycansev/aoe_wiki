import "./App.css";

import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import styles from "./App.module.scss";

function App() {
  return (
    <div className={styles.app}>
      <Suspense fallback={<>Loading...</>}>
        <Outlet />
      </Suspense>
    </div>
  );
}

export default App;
