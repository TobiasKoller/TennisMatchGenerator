
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Dashboard, Settings } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { RoutePath } from "../model/RoutePath";
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import GroupIcon from '@mui/icons-material/Group';
import { ConfirmDialog, ConfirmDialogHandle } from "./ConfirmDialog";
import { useRef } from "react";

interface SideMenuProps {
};

export const SideMenu: React.FC<SideMenuProps> = ({ }) => {

  // const seasonService = new SeasonService()
  // const notification = useNotification();

  const dialogRef = useRef<ConfirmDialogHandle>(null);


  // const createNewSeason = async () => {

  //   dialogRef.current?.open({

  //     question: "Möchtest du wirklich eine neue Saison erstellen?",
  //     onConfirm: async () => {
  //       try {
  //         await seasonService.createSeason();
  //         window.location.reload(); // Seite neu laden, um die neue Saison anzuzeigen
  //       } catch (error) {
  //         notification.notifyError(error instanceof Error ? error.message : "Saison konnte nicht erstellt werden.");
  //       }
  //     },
  //     onClose: () => {
  //     },
  //   });


  // };

  return (
    <Drawer variant="permanent" sx={{
      width: 240,
      flexShrink: 0,
      '& .MuiDrawer-paper': {
        width: 240,
        paddingTop: '64px', // Abstand für die AppBar (Höhe: 64px)
        overflow: 'hidden',
      },
    }}>
      <List sx={{ width: 240 }}>
        <ListItem component={Link} to={RoutePath.HOME.path}>
          <ListItemIcon><Dashboard /></ListItemIcon>
          <ListItemText primary={RoutePath.HOME.displayName} />
        </ListItem>
        <ListItem component={Link} to={RoutePath.MATCHDAYS.path}>
          <ListItemIcon><SportsTennisIcon /></ListItemIcon>
          <ListItemText primary={RoutePath.MATCHDAYS.displayName} />
        </ListItem>
        <ListItem component={Link} to={RoutePath.PLAYERS.path}>
          <ListItemIcon><GroupIcon /></ListItemIcon>
          <ListItemText primary={RoutePath.PLAYERS.displayName} />
        </ListItem>
        <ListItem component={Link} to={RoutePath.SETTINGS.path}>
          <ListItemIcon><Settings /></ListItemIcon>
          <ListItemText primary={RoutePath.SETTINGS.displayName} />
        </ListItem>
      </List>

      {/* <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={createNewSeason}
        >
          Neue Saison Erstellen
        </Button>
      </Box> */}
      <ConfirmDialog ref={dialogRef} />
    </Drawer>
  );
};

