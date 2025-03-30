import React, { createContext, useContext, useEffect, useState } from "react";
import Database from '@tauri-apps/plugin-sql';

// Typ für den Context
interface DatabaseContextType {
  db: Database | null;
}

// Context erstellen
const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

// Provider-Komponente
export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<Database | null>(null);

  useEffect(() => {
    async function initDatabase() {
      const database = await Database.load("sqlite:tennismatchgenerator.sqlite");
      setDb(database);
    }

    initDatabase();
  }, []);

  return <DatabaseContext.Provider value={{ db }}>{children}</DatabaseContext.Provider>;
};

// Custom Hook zum Verwenden des Contexts
export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase muss innerhalb eines DatabaseProviders verwendet werden.");
  }
  return context.db;
}
