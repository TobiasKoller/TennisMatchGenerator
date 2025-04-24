import * as React from 'react';
import { DataGrid, GridColDef, GridColumnVisibilityModel, GridToolbar } from '@mui/x-data-grid';
import { useEffect } from 'react';
import { Player } from '../model/Player';
import { PlayerService } from '../services/PlayerService';
import { useState } from 'react';
import { CustomPaper } from '../components/CustomPaper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../model/RoutePath';
import { useSeason } from '../context/SeasonContext';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  {
    field: 'fullName',
    headerName: 'Name',
    description: 'Der vollständige Name des Spielers',
    width: 500,
    valueGetter: (value, row: Player) => `${row.firstname || ''} ${row.lastname || ''}`,
  },
  { field: 'age', headerName: 'Alter', type: 'number', width: 150 },
  { field: 'skillRating', headerName: 'Leitungsbewertung', type: 'number', width: 150 },
];



const paginationModel = { page: 0, pageSize: 100 };

export const PlayerList: React.FC = () => {

  const [players, setPlayers] = useState<Player[]>([]);
  const navigateHook = useNavigate();
  const { season } = useSeason();
  if (!season) return null; // Sicherstellen, dass die Saison vorhanden ist

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
    id: false, // Alter-Spalte am Anfang versteckt
  });

  const playerService = new PlayerService(season.id);
  useEffect(() => {

    const fetchPlayers = async () => {
      var allPlayers = await playerService.getAllPlayers();
      setPlayers(allPlayers);
    };

    fetchPlayers();
  }, []);

  const navigate = (route: string) => {
    navigateHook(route);
  }

  const addPlayer = () => {
    navigate("/" + RoutePath.PLAYERS.path + "/new");
  };

  const editPlayer = (params: any) => {
    if (!params.id) return;
    navigate("/" + RoutePath.PLAYERS.path + "/" + params.id);
  };

  return (
    <CustomPaper elevation={16} style={{ padding: "16px", margin: "16px" }}>
      <Stack direction="column" spacing={2} style={{ marginBottom: "16px" }}>
        <ButtonGroup variant="contained" aria-label="Basic button group" sx={{ alignSelf: "flex-end" }}>
          <Button startIcon={<PersonAddIcon />} onClick={addPlayer}>Spieler hinzufügen</Button>
        </ButtonGroup>
        <DataGrid
          rows={players}
          columns={columns}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          onCellDoubleClick={editPlayer}
          // slots={{ toolbar: GridToolbar }}
          sx={{ border: 0 }}
        />
      </Stack>

    </CustomPaper>
  );
}
