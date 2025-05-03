
import "./App.css";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { RoutePath } from "./model/RoutePath";
import { Home } from "./pages/Home";
import { Players } from "./pages/Players";
import { Settings } from "./pages/Settings";
import { PlayerDetail } from "./pages/PlayerDetail";
import { NotFound } from "./pages/NotFound";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import { SideMenu } from "./components/SideMenu";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import { MatchDays } from "./pages/MatchDays";
import { useSeason } from "./context/SeasonContext";
import { WaitScreen } from "./pages/WaitScreen";
import { MatchDayDetail } from "./pages/MatchDayDetail";
import { Drawer, IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import { MatchDayService } from "./services/MatchDayService";
import { useNotification } from "./provider/NotificationProvider";
import { AppService } from "./services/AppService";

export default function App() {

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigateHook = useNavigate();
  const notification = useNotification();
  const [dbInitialized, setDbInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  let { season } = useSeason();
  if (!season) return <WaitScreen message="Saison wird geladen..." />;

  var appService = new AppService(notification);

  useEffect(() => {
    async function init() {
      if (season && !dbInitialized) {
        if (!await appService.isDbInitialized()) {
          notification.notifySuccess("Datenbank wird initialisiert...");
          await appService.initializeDb();
          notification.notifySuccess("Datenbank erfolgreich eingerichtet.");
        }
        setDbInitialized(true);
      }
      setIsLoading(false); // Setze auf false, wenn alles initialisiert ist
    }
    init();
  }, [season, dbInitialized]);

  // Zeige Loading-Bildschirm, wenn noch geladen wird
  if (isLoading || !season) {
    return <WaitScreen message="Anwendung wird initialisiert..." />;
  }



  var matchDayService = new MatchDayService(season.id, notification);


  useEffect(() => {
    // Immer wenn sich die Route ändert -> Sidebar schließen
    setSidebarOpen(false);

  }, [location]);

  // useEffect(() => {
  //   init();
  // }, []);

  const openCurrentMatchday = async () => {
    var matchDay = await matchDayService.getActiveMatchDay();
    navigateHook(`/${RoutePath.MATCHDAYS.path}/${matchDay.id}`);
  };



  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100vw" }}>
      <CssBaseline />
      <Drawer
        anchor="left"
        open={isSidebarOpen}
        onClose={() => setSidebarOpen(false)}
      >
        <SideMenu />
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
        }}
      >
        <AppBar position="sticky" sx={{ zIndex: 1201, height: "64px" }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              Tennis Action - {season.description}
            </Typography>
            <Box sx={{ ml: "auto" }}>
              <Tooltip title="Aktuelle Tabelle" arrow >
                <IconButton color="inherit" onClick={() => console.log("Ranking")}>
                  <EmojiEventsIcon sx={{ color: 'gold' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Aktueller Spieltag" arrow >
                <IconButton color="inherit" onClick={openCurrentMatchday}>
                  <SportsTennisIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </AppBar>
        {/* <CustomBreadcrumbs /> */}
        <Routes>
          <Route path={RoutePath.HOME.path} element={<Home />} />
          <Route path={RoutePath.SETTINGS.path} element={<Settings />} />
          <Route path={RoutePath.MATCHDAYS.path}>
            <Route index element={<MatchDays />} />
            <Route path=":id" element={<MatchDayDetail />} />
          </Route>
          <Route path={RoutePath.PLAYERS.path}>
            <Route index element={<Players />} />
            <Route path=":id" element={<PlayerDetail />} />
          </Route>
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Box>
    </Box >

  );

}

