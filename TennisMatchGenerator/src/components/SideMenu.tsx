
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Dashboard, BarChart, Settings } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { RoutePath } from "../model/RoutePath";
import SportsTennisIcon from '@mui/icons-material/SportsTennis';

export const SideMenu = () => {


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
        {/* <ListItem component={Link} to={RoutePath.CURRENT_SEASON.path}>
          <ListItemIcon><SportsTennisIcon /></ListItemIcon>
          <ListItemText primary={RoutePath.CURRENT_SEASON.displayName} />
        </ListItem> */}
        <ListItem component={Link} to={RoutePath.PLAYERS.path}>
          <ListItemIcon><BarChart /></ListItemIcon>
          <ListItemText primary={RoutePath.PLAYERS.displayName} />
        </ListItem>
        <ListItem component={Link} to={RoutePath.SETTINGS.path}>
          <ListItemIcon><Settings /></ListItemIcon>
          <ListItemText primary={RoutePath.SETTINGS.displayName} />
        </ListItem>
      </List>
    </Drawer>
  );
};

