import { useEffect, useState } from "react";

import "./App.css";
import { useDatabase } from "./db/databaseContext";
import { Route, Routes } from "react-router-dom";
import { WaitScreen } from "./pages/WaitScreen";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import { NotFound } from "./pages/NotFound";
import { UserList } from "./pages/UserList";
import { UserDetail } from "./pages/UserDetail";
import { HomeLayout } from "./layout/HomeLayout";
import { RoutePath } from "./model/Routes";


export default function App() {
 
  const [initialized, setInitialized] = useState(false);
  const db = useDatabase(); // useDatabase ist ein benutzerdefinierter Hook, der den Datenbankkontext verwendet
  
  useEffect(() => {
    async function initDatabase() {
      if (db) setInitialized(true);   
    }

    initDatabase();
  }, [db]);

  if(!initialized) return <div>Loading...</div>;
  
  
  return (
    <>
      <HomeLayout />
      <Routes>
      <Route path={RoutePath.HOME} element={initialized? <Home /> : <WaitScreen />} />
      <Route path={RoutePath.SETTINGS} element={<Settings />} />
      <Route path={RoutePath.USERS}>
        <Route index element={<UserList />} />
        <Route path=":id" element={<UserDetail />} />
      </Route>
      <Route path="*" element={<NotFound />} /> {/* Fallback-Route für nicht gefundene Seiten */}
      
    </Routes>
    </>
    
  );

}

