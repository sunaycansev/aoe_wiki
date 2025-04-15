import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { MainLayout } from "@/layouts/MainLayout";
import { store } from "@/store/store";

import App from "./App.tsx";

const HomePage = lazy(() => import("@/routes/HomePage"));
const UnitsPage = lazy(() => import("@/routes/UnitsPage"));
const UnitDetailPage = lazy(() => import("@/routes/UnitDetailPage"));

import "./styles/global.scss";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "units", element: <UnitsPage /> },
          { path: "units/:id", element: <UnitDetailPage /> },
        ],
      },
    ],
  },
]);

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </React.StrictMode>,
  );
} else {
  console.error("Root element with ID 'root' not found.");
}
