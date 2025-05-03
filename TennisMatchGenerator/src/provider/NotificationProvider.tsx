import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { Alert } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

// Notification-Typ
interface NotificationState {
  id: string;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

// NotificationService Interface
export interface INotificationService {
  notify: (message: string, severity?: NotificationState["severity"]) => void;
  notifyError: (message: string) => Error;
  notifySuccess: (message: string) => void;
  notifyWarning: (message: string) => void;
}

// Kontext
const NotificationContext = createContext<INotificationService | null>(null);

// Provider-Komponente
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addNotification = (message: string, severity: NotificationState["severity"]) => {
    const id = uuidv4();
    setNotifications((prev) => [...prev, { id, message, severity }]);

    // Nur bei success automatisch entfernen
    if (severity === "success") {
      setTimeout(() => removeNotification(id), 3000);
    }
  };

  const notify = (message: string, severity: NotificationState["severity"] = "success") => {
    addNotification(message, severity);
  };

  const notifyError = (message: string): Error => {
    addNotification(message, "error");
    return new Error(message);
  };

  const notifySuccess = (message: string) => {
    addNotification(message, "success");
  };

  const notifyWarning = (message: string) => {
    addNotification(message, "warning");
  };

  return (
    <NotificationContext.Provider value={{ notify, notifyError, notifySuccess, notifyWarning }}>
      {children}
      {/* Gestapelte Alerts in linker oberer Ecke */}
      <div
        style={{
          position: "fixed",
          bottom: 16,
          left: 16,
          zIndex: 1400,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {notifications.map((notification) => (
          <Alert
            key={notification.id}
            severity={notification.severity}
            variant="filled"
            onClose={() => removeNotification(notification.id)}
          >
            {notification.message}
          </Alert>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Hook
export const useNotification = (): INotificationService => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
