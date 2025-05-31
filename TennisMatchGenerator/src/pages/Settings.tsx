import React, { useEffect, useState } from "react";
import { TextField, Button, SelectChangeEvent, Typography, Box, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { Setting } from "../model/Setting";
import { useNotification } from "../provider/NotificationProvider";
import { CustomPaper } from "../components/CustomPaper";
import { useSeason } from "../context/SeasonContext";
import { SeasonService } from "../services/SeasonService";

// Definiere einen Typ für das Formular


export const Settings: React.FC = () => {
    const { notify } = useNotification();
    const { season } = useSeason();
    if (!season) return null; // Sicherstellen, dass die Saison vorhanden ist

    const [formData, setFormData] = useState<Setting>({
        // pointsForWin: 1,
        pointsForParticipation: 1,
        availableCourts: []
    });
    const [selectedCourts, setSelectedCourts] = useState<number[]>([]); // Zustand für die ausgewählten Plätze

    const seasonService = new SeasonService();

    const init = async () => {
        const settings = await seasonService.getSettings();
        setFormData(settings);
        setSelectedCourts(settings.availableCourts);
    }

    useEffect(() => {

        init();

    }, []);

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            availableCourts: selectedCourts.sort((a, b) => a - b),
        }));
    }, [selectedCourts]);

    // Ändern von Eingaben
    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
        const { name, value, type } = event.target as HTMLInputElement;
        setFormData((prev) => ({
            ...prev,
            [name!]: type === "checkbox" ? (event.target as HTMLInputElement).checked : value,
        }));
    };

    // Formular absenden
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Formulardaten:", formData);

        try {
            await seasonService.saveSettings(season.id, formData);
            notify("Daten erfolgreich gespeichert!", "success");
        }
        catch (error: any) {
            notify("Fehler beim Speichern. " + error?.message, "error");
        }

    };

    return (
        <CustomPaper>
            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    maxWidth: 400,
                    alignItems: "flex-start", // Links ausrichten
                }}>
                <Typography variant="h5">Grundeinstellungen</Typography>

                <TextField label="Punkte für Antritt" name="pointsForParticipation" type="number" value={formData.pointsForParticipation} onChange={handleChange} fullWidth />
                {/* <TextField label="Punkte pro Spielgewinn" name="pointsForWin" type="number" value={formData.pointsForWin} onChange={handleChange} fullWidth /> */}
                <ToggleButtonGroup
                    value={selectedCourts}
                    onChange={(_e, newSelection) => setSelectedCourts(newSelection)}
                >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((court) => (
                        <ToggleButton key={court} value={court} sx={{
                            '&.Mui-selected': {
                                backgroundColor: 'green',
                                color: 'white',
                                '&:hover': {
                                    backgroundColor: 'darkgreen',
                                },
                            },
                        }}>
                            {court}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>

                {/* Hier können Sie weitere Eingabefelder hinzufügen */}

                <Button type="submit" variant="contained" color="primary">
                    Absenden
                </Button>
            </Box>
        </CustomPaper>
    );
}