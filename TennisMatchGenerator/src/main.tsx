import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { NotificationProvider } from "./provider/NotificationProvider";
import { SeasonProvider } from "./context/SeasonContext";
import { ServiceProvider } from "./context/ServiceContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <SeasonProvider>
        <ServiceProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </ServiceProvider>
      </SeasonProvider>

    </BrowserRouter>
  </React.StrictMode>,
);
