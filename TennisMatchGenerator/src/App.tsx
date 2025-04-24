
import "./App.css";
import { Route, Routes, Router } from "react-router-dom";
import { RoutePath } from "./model/RoutePath";
import { Home } from "./pages/Home";
import { PlayerList } from "./pages/PlayerList";
import { Settings } from "./pages/Settings";
import { PlayerDetail } from "./pages/PlayerDetail";
import { NotFound } from "./pages/NotFound";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import { SideMenu } from "./components/SideMenu";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import { CurrentSeason } from "./pages/CurrentSeason";
import { CustomBreadcrumbs } from "./components/Breadcrumbs";
import { useSeason } from "./context/SeasonContext";
import { WaitScreen } from "./pages/WaitScreen";

export default function App() {

  let { season } = useSeason();
  if (!season) {
    return <WaitScreen />; // oder ein Lade-Spinner
  }

  return (

    <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
      <CssBaseline />
      <SideMenu />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          width: "calc(100vw - 240px)", // Sidebar Platz abziehen
          height: "100vh",
        }}
      >
        <AppBar position="sticky" sx={{ zIndex: 1201, height: "64px" }}>
          <Toolbar>
            <Typography variant="h6">Tennis Action - {season.description}</Typography>
          </Toolbar>
        </AppBar>
        <CustomBreadcrumbs />
        <Routes>
          <Route path={RoutePath.HOME.path} element={<Home />} />
          <Route path={RoutePath.SETTINGS.path} element={<Settings />} />
          <Route path={RoutePath.CURRENT_SEASON.path} element={<CurrentSeason />} />
          <Route path={RoutePath.PLAYERS.path}>
            <Route index element={<PlayerList />} />
            <Route path=":id" element={<PlayerDetail />} />
          </Route>
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Box>
    </Box>

  );

}

