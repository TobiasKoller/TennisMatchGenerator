import React, { createContext, useState, useContext, ReactNode } from "react";
import { Snackbar, Alert } from "@mui/material";

// Der Typ für den Kontext
interface NotificationContextType {
  notify: (message: string, severity?: "success" | "error" | "warning" | "info") => void;
}

// Der Typ für den Benachrichtigungszustand
interface NotificationState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

// Der Kontext, der den `notify`-Handler bereitstellt
const NotificationContext = createContext<NotificationContextType | null>(null);


// Der Provider für Benachrichtigungen
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "success",
  });

  // notify-Funktion für die Anzeige von Benachrichtigungen
  const notify = (message: string, severity: "success" | "error" | "warning" | "info" = "success") => {
    setNotification({ open: true, message, severity });
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.severity === "success" ? 3000 : null}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

// Custom Hook, um Benachrichtigungen zu verwenden
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
