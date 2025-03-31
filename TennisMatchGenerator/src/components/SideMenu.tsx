import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Box from "@mui/material/Box";
import Stack from '@mui/material/Stack';

//icons
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import HomeIcon from '@mui/icons-material/Home';
import TuneIcon from '@mui/icons-material/Tune';

//drawer elements used
import Drawer from "@mui/material/Drawer";
import { useState } from "react";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { RoutePath } from "../model/Routes";
import { makeStyles } from "@mui/material/styles";


export const SideMenu: React.FC = () => {
  
  const [open, setOpen] = useState(false);  
  const navigateHook = useNavigate();

  const toggleDrawer = (open: boolean) => (event:any) => {
    setOpen(open);
  };

  const navigate = (route: string) => {
    setOpen(false); //close the drawer after navigating
    navigateHook(route);
  }
  const buttonSx = {}; //r{ paddingLeft: "10px",paddingRight: "50px", position: "relative"};
    return (
      <AppBar position="static">
          <Toolbar>
              <IconButton>
                <MenuIcon onClick={toggleDrawer(true)} sx={{ color: "#000" }} />
              </IconButton>

              <Drawer anchor="left" variant="temporary" open={open} onClose={toggleDrawer(false)} >
                <Box sx={{ paddingTop: "50px",marginLeft:"10px",marginRight: "10px", minWidth:"200px" }}>
                  <Stack direction="column" spacing={2} >
                      <Button variant="contained" sx={buttonSx} startIcon={<HomeIcon />} onClick={()=>{navigate(RoutePath.HOME)}} >Startseite</Button>
                      <Button variant="contained" sx={buttonSx} startIcon={<PeopleAltIcon sx={{marginLeft: "0px"}} />} onClick={()=>{navigate(RoutePath.USERS)}} >Spieler/Innen</Button>
                      <Button variant="contained" sx={buttonSx} startIcon={<TuneIcon />} onClick={()=>{navigate(RoutePath.SETTINGS)}} >Einstellungen</Button>
                    </Stack> 
                </Box>
              </Drawer>
            </Toolbar>
      </AppBar>


    )

};