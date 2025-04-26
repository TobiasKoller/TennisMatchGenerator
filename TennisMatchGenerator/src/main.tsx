import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { NotificationProvider } from "./provider/NotificationProvider";
import { SeasonProvider } from "./context/SeasonContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <SeasonProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </SeasonProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
