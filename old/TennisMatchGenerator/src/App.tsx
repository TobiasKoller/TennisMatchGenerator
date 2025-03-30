import { useState } from "react";
import "./App.css";
import { Box, Tab, Tabs } from "@mui/material";
import {MatchDay} from './components/MatchDay'
import { Ranking } from "./components/Ranking";
import { Players } from "./components/Players";
import { Settings } from "./components/Settings";

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Match Day" {...a11yProps(0)} />
          <Tab label="Ranking" {...a11yProps(1)} />
          <Tab label="Players" {...a11yProps(2)} />
          <Tab label="Settings" {...a11yProps(3)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <MatchDay />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Ranking />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <Players />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <Settings />
      </CustomTabPanel>
    </Box>
  );
}

export default App;
