import "./App.css";

import { Suspense } from "react";
import { Outlet } from "react-router-dom";

import { AppInitializer } from "@/components/AppInitializer";
import { BackgroundAudioPlayer } from "@/components/BackgroundAudioPlayer";
import { Spinner } from "@/components/Spinner";

import styles from "./App.module.scss";

function App() {
  return (
    <div className={styles.app}>
      <Suspense fallback={<Spinner overlay />}>
        <BackgroundAudioPlayer />
        <AppInitializer />
        <Outlet />
      </Suspense>
    </div>
  );
}

export default App;
