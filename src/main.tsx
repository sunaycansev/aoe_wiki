import React, { lazy } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.tsx";
import { MainLayout } from "./layouts/MainLayout";
import { store } from "./store/store";
const HomePage = lazy(() => import("./routes/HomePage"));

import "./styles/global.scss";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [{ index: true, element: <HomePage /> }],
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
