import * as React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useEffect } from 'react';
import { Player } from '../model/Player';
import { PlayerService } from '../services/PlayerService';
import { useState } from 'react';
import { CustomPaper } from '../components/CustomPaper';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 70},
  {
    field: 'fullName',
    headerName: 'Name',
    description: 'Der vollständige Name des Spielers',
    width: 500,
    valueGetter: (value, row) => `${row.firstName || ''} ${row.lastName || ''}`,
  },
  { field: 'age', headerName: 'Alter', type: 'number', width: 150 },
  { field: 'skillRating', headerName: 'Leitungsbewertung', type: 'number', width: 150 },
];



const paginationModel = { page: 0, pageSize: 100 };

export const PlayerList: React.FC = () => {

  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {

    const fetchPlayers = async () => {
        var resultx = await new PlayerService().getAllPlayers();
        setPlayers(resultx);
    };
    
    fetchPlayers();
    }
  , []);

  return (
    <CustomPaper elevation={16} style={{ padding: "16px", margin: "16px" }}>
      <DataGrid
        rows={players}
        columns={columns}
        initialState={{ pagination: { paginationModel } }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        sx={{ border: 0 }}
      />
    </CustomPaper>
  );
}
