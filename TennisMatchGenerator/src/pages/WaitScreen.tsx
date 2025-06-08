import { Box, Typography } from "@mui/material";

interface WaitScreenProps {
    message?: string;
}

export const WaitScreen: React.FC<WaitScreenProps> = (props) => {

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",  // Horizontal zentrieren
                alignItems: "center",      // Vertikal zentrieren
                height: "100%",            // Wichtig: Höhe muss definiert sein
            }}
        >
            <Typography variant="h6" component="div" sx={{ textAlign: "center" }}>
                {props.message || "Bitte warten..."}
            </Typography>
        </Box>
    );
}