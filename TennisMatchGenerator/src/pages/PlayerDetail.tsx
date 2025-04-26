import { useEffect, useState } from "react";
import { Player } from "../model/Player";
import { SelectChangeEvent } from "@mui/material/Select";
import { useNavigate, useParams } from "react-router-dom";
import { CustomPaper } from "../components/CustomPaper";
import Stack from "@mui/material/Stack";
import { Box, Button, Checkbox, FormControlLabel, TextField, Typography } from "@mui/material";
import { useNotification } from "../provider/NotificationProvider";
import { PlayerService } from "../services/PlayerService";
import { useSeason } from "../context/SeasonContext";
import { RoutePath } from "../model/RoutePath";

interface PlayerDetailProps {
}


export const PlayerDetail: React.FC<PlayerDetailProps> = ({ }) => {

    const { notify } = useNotification();
    const { season } = useSeason();
    const navigateHook = useNavigate();
    const notification = useNotification();

    if (!season) return null; // Sicherstellen, dass die Saison vorhanden ist

    const [player, setPlayer] = useState<Player>(new Player());

    const { id } = useParams<{ id: string }>();
    const playerId = id; // Wenn id nicht vorhanden ist, setze auf "new"
    const isNewPlayer = id === "new";
    const playerService = new PlayerService(season.id, notification);

    useEffect(() => {

        const fetchPlayer = async () => {
            if (isNewPlayer) return;
            if (!playerId) return;

            var player = await playerService.getPlayerById(playerId);
            if (player) setPlayer(player);
        };

        fetchPlayer();
    }, []);

    const navigteToPlayers = () => {

        navigateHook(`/${RoutePath.PLAYERS.path}`);
    }

    const newPlayerFormChanged = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }> | SelectChangeEvent
    ) => {
        const { name, value, type } = event.target as HTMLInputElement;

        // Kopiere den aktuellen player-Objekt und aktualisiere nur das angegebene Feld
        setPlayer((prevPlayer) => ({
            ...prevPlayer,
            [name]: type === "checkbox" ? (event.target as HTMLInputElement).checked : value,
        }));
    };

    const onFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (isNewPlayer) {
                await playerService.addPlayer(player);
                notify("Spieler/In erfolgreich angelegt.", "success");
                navigteToPlayers();
            }
            else {
                await playerService.updatePlayer(player);
                notify("Spieler/In erfolgreich aktualisiert.", "success");
                navigteToPlayers();
            }
        }
        catch (error: any) {
            notify("Fehler beim Speichern. " + error?.message, "error");
        }

    };


    return (
        <CustomPaper>
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

                    <FormControlLabel control={<Checkbox name="isActive" checked={player.isActive} onChange={newPlayerFormChanged} />} label="Ist Aktiv" />
                    <Button type="submit" variant="contained" color="primary">
                        {isNewPlayer ? "Spieler anlegen" : "Änderungen speichern"}
                    </Button>
                </Box>
            </Stack>
        </CustomPaper>

    );
}