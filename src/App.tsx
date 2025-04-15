import "./App.css";

import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import styles from "./App.module.scss";
import { Spinner } from "./components/Spinner";

function App() {
  return (
    <div className={styles.app}>
      <Suspense fallback={<Spinner overlay />}>
        <Outlet />
      </Suspense>
    </div>
  );
}

export default App;
