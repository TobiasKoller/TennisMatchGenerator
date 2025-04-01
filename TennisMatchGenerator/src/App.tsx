import { useEffect, useState } from "react";

import "./App.css";
import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/Home";
import { Settings } from "./pages/Settings";
import { NotFound } from "./pages/NotFound";
import { PlayerList } from "./pages/PlayerList";
import { PlayerDetail } from "./pages/PlayerDetail";
import { HomeLayout } from "./layout/HomeLayout";
import { RoutePath } from "./model/Routes";


export default function App() {


  return (
    <>
      <HomeLayout />
      <Routes>
        <Route path={RoutePath.HOME} element={<Home />} />
        <Route path={RoutePath.SETTINGS} element={<Settings />} />
        <Route path={RoutePath.USERS}>
          <Route index element={<PlayerList />} />
          <Route path=":id" element={<PlayerDetail />} />
        </Route>
        <Route path="*" element={<NotFound />} /> {/* Fallback-Route für nicht gefundene Seiten */}

      </Routes>
    </>

  );

}

