import React, { useEffect, useState } from "react";
import { TextField, Button, Paper, styled, SelectChangeEvent, Typography, Box } from "@mui/material";
import { Setting } from "../model/Setting";
import { SettingService } from "../services/SettingService";

// Definiere einen Typ für das Formular


export const Settings: React.FC = () => {
    
    const CustomPaper = styled(Paper)(({ theme }) => ({
        // width: 120,
        // height: 120,
        padding: theme.spacing(2),
        ...theme.typography.body2,
        textAlign: 'left',
    }));
    
    const [formData, setFormData] = useState<Setting>({
        numberOfCourts: 1,
        pointsForWin: 1,
        pointsForParticipation: 1
    });

    
    useEffect(() => {
        const fetchSettings = async () => {
            const settingService = new SettingService();
            const settings = await settingService.getSettings();
            setFormData(settings);
        };
        fetchSettings();

    }, []);

    // Ändern von Eingaben
    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement  | { name?: string; value: unknown }> | SelectChangeEvent) => {
        const { name, value, type } = event.target as HTMLInputElement;
        setFormData((prev) => ({
        ...prev,
        [name!]: type === "checkbox" ? (event.target as HTMLInputElement).checked : value,
        }));
    };

    // Formular absenden
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Formulardaten:", formData);
        const settingService = new SettingService();
        settingService.saveSettings(formData).then(() => {
           // alert("Einstellungen erfolgreich aktualisiert!");
        });
    };

    return (
        <CustomPaper elevation={16} style={{ padding: "16px", margin: "16px" }}>
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

        <TextField label="Anzahl verfügbare Tennisplätze" type="number" name="numberOfCourts" value={formData.numberOfCourts} onChange={handleChange} fullWidth />
        <TextField label="Punkte für Antritt" name="pointsForParticipation" type="number" value={formData.pointsForParticipation} onChange={handleChange} fullWidth />
        <TextField label="Punkte pro Spielgewinn" name="pointsForWin" type="number" value={formData.pointsForWin} onChange={handleChange} fullWidth />

        <Button type="submit" variant="contained" color="primary">
            Absenden
        </Button>
        </Box>
        </CustomPaper>
    );
}