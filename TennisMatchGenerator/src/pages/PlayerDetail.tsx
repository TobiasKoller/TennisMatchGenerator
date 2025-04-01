import { useState } from "react";
import { Player } from "../model/Player";
import { SelectChangeEvent } from "@mui/material/Select";
import { useParams } from "react-router-dom";
import { CustomPaper } from "../components/CustomPaper";
import Stack from "@mui/material/Stack";
import { Box, Button, TextField, Typography } from "@mui/material";
import { PlayerService } from "../services/PlayerService";
import { useNotification } from "../provider/NotificationProvider";

interface PlayerDetailProps {
}


export const PlayerDetail: React.FC<PlayerDetailProps> = ({ }) => {

    const { notify } = useNotification();

    const [player, setPlayer] = useState<Player>({
        firstname: "",
        lastname: "",
        skillRating: 1,
        age: 18,
        isActive: true,
        id: ""
    });

    const { id } = useParams<{ id: string }>();
    const [playerId, setPlayerId] = useState<string>(id || "");
    const [isNewPlayer, setIsNewPlayer] = useState<boolean>(playerId === "new");

    const newPlayerFormChanged = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
        const { name, value, type } = event.target as HTMLInputElement;
        setPlayer((prev) => ({
            ...prev,
            [name!]: type === "checkbox" ? (event.target as HTMLInputElement).checked : value,
        }));
    };

    const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const playerService = new PlayerService();

        try {
            if (isNewPlayer) {
                let id = await playerService.addPlayer(player);
                setPlayerId(id);
                setIsNewPlayer(false);
                setPlayer({ ...player, id: id });
                notify("Spieler/In erfolgreich angelegt.", "success");
            }
            else {
                await playerService.updatePlayer(player);
                notify("Spieler/In erfolgreich aktualisiert.", "success");
            }
        }
        catch (error: any) {
            notify("Fehler beim Speichern. " + error?.message, "error");
        }

    };


    return (
        <CustomPaper elevation={16} style={{ padding: "16px", margin: "16px" }}>
            <Typography variant="h5">{isNewPlayer ? "neuen Spieler anlegen" : "Spielerdetails"} </Typography>
            <Stack direction="column" spacing={2} style={{ marginBottom: "16px" }}>
                <Box
                    component="form"
                    onSubmit={onFormSubmit}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        maxWidth: 400,
                        alignItems: "flex-start", // Links ausrichten
                    }}>


                    <TextField label="Vorname" type="text" name="firstname" value={player.firstname} onChange={newPlayerFormChanged} fullWidth />
                    <TextField label="Nachname" name="lastname" type="text" value={player.lastname} onChange={newPlayerFormChanged} fullWidth />
                    <TextField label="Alter" name="age" type="age" value={player.age} onChange={newPlayerFormChanged} fullWidth />
                    <TextField label="Leistungsbewertung" name="skillRating" type="number" value={player.skillRating} onChange={newPlayerFormChanged} fullWidth />
                    <TextField label="Ist Aktiv" name="isActive" type="checkbox" value={player.isActive} onChange={newPlayerFormChanged} fullWidth />

                    <Button type="submit" variant="contained" color="primary">
                        {isNewPlayer ? "Spieler anlegen" : "Änderungen speichern"}
                    </Button>
                </Box>
            </Stack>
        </CustomPaper>

    );
}