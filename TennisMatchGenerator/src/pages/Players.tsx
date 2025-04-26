import * as React from 'react';
import { DataGrid, GridColDef, GridColumnVisibilityModel, GridRowSelectionModel } from '@mui/x-data-grid';
import { useEffect } from 'react';
import { Player } from '../model/Player';
import { PlayerService } from '../services/PlayerService';
import { useState } from 'react';
import { CustomPaper } from '../components/CustomPaper';
import Stack from '@mui/material/Stack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { useNavigate } from 'react-router-dom';
import { RoutePath } from '../model/RoutePath';
import { useSeason } from '../context/SeasonContext';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useNotification } from '../provider/NotificationProvider';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70 },
  {
    field: 'fullName',
    headerName: 'Name',
    description: 'Der vollständige Name des Spielers',
    width: 500,
    valueGetter: (_value, row: Player) => `${row.firstname || ''} ${row.lastname || ''}`,
  },
  { field: 'age', headerName: 'Alter', type: 'number', width: 150 },
  { field: 'skillRating', headerName: 'Leitungsbewertung', type: 'number', width: 150 },
];



const paginationModel = { page: 0, pageSize: 100 };

export const Players: React.FC = () => {

  const [players, setPlayers] = useState<Player[]>([]);
  const navigateHook = useNavigate();
  const { season } = useSeason();
  const notification = useNotification();

  if (!season) return null; // Sicherstellen, dass die Saison vorhanden ist

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({
    id: false, // Alter-Spalte am Anfang versteckt
  });

  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>([]);

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    setSelectedRows(newSelection);
  };

  const fetchPlayers = async () => {
    var allPlayers = await playerService.getAllPlayers();
    setPlayers(allPlayers);
  };

  const playerService = new PlayerService(season.id, notification);
  useEffect(() => {
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

  const removePlayer = async () => {
    if (!selectedRows || selectedRows.length === 0) return;
    await playerService.deletePlayer(selectedRows[0] as string);
    fetchPlayers();
    setSelectedRows([]);
  }

  //#region Delete-Dialog

  const [open, setOpen] = useState(false);  // Dialog-Status (offen/geschlossen)

  const openDeleteDialog = () => {
    setOpen(true);  // Dialog öffnen
  };

  const handleClose = () => {
    setOpen(false);  // Dialog schließen
  };

  const handleDelete = () => {
    removePlayer();
    setOpen(false);  // Dialog schließen nach der Aktion
  };
  //#endregion


  return (
    <CustomPaper>
      <Stack direction="column" spacing={2} style={{ marginBottom: "16px" }}>
        <Stack direction="row" spacing={2} justifyContent={'flex-end'}>

          {selectedRows.length > 0 && (
            <Button color='error' variant="contained" startIcon={<PersonRemoveIcon />} onClick={openDeleteDialog}>Spieler löschen</Button>
          )}
          <Button color='primary' variant="contained" startIcon={<PersonAddIcon />} onClick={addPlayer}>Spieler hinzufügen</Button>
        </Stack >
        <DataGrid
          rows={players}
          columns={columns}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
          onRowSelectionModelChange={handleSelectionChange}
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[5, 10]}
          checkboxSelection
          onCellDoubleClick={editPlayer}
          // slots={{ toolbar: GridToolbar }}
          sx={{ border: 0 }}
        />
      </Stack>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Bestätigung</DialogTitle>
        <DialogContent>
          Bist du sicher, dass du diesen Benutzer löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Abbrechen
          </Button>
          <Button onClick={handleDelete} color="error">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </CustomPaper>
  );
}
