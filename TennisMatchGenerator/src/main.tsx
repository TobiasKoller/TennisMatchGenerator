import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { NotificationProvider } from "./provider/NotificationProvider";
import { SeasonProvider } from "./context/SeasonContext";
import DatabaseInitializer from "./db/DatabaseInitializer";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <DatabaseInitializer>
          <SeasonProvider>
            <App />
          </SeasonProvider>
        </DatabaseInitializer>
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>
);
