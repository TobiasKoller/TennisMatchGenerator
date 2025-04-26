import React, { createContext, useState, useContext, ReactNode } from "react";
import { Snackbar, Alert } from "@mui/material";

// Der Typ für den Kontext
export interface INotificationService {
  notify: (message: string, severity?: "success" | "error" | "warning" | "info") => void;
  notifyError: (message: string) => Error;
  notifySuccess: (message: string) => void;
  notifyWarning: (message: string) => void;
}

// Der Typ für den Benachrichtigungszustand
interface NotificationState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

// Der Kontext, der den `notify`-Handler bereitstellt
const NotificationContext = createContext<INotificationService | null>(null);


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

  const notifyError = (message: string): Error => {
    setNotification({ open: true, message, severity: "error" });

    return new Error(message);
  }

  const notifySuccess = (message: string) => {
    setNotification({ open: true, message, severity: "success" });
  }

  const notifyWarning = (message: string) => {
    setNotification({ open: true, message, severity: "warning" });
  }

  return (
    <NotificationContext.Provider value={{ notify, notifyError, notifySuccess, notifyWarning }}>
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
export const useNotification = (): INotificationService => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
