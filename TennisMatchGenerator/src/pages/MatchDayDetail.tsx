import { Box, Button, IconButton, Stack, Tab, Tabs, } from "@mui/material";
import { useEffect, useState } from "react";
import { CustomPaper } from "../components/CustomPaper";
import { MatchDayService } from "../services/MatchDayService";
import { useNotification } from "../provider/NotificationProvider";
import { useSeason } from "../context/SeasonContext";
import { MatchDayRound } from "../model/MatchDayRound";
import { useParams } from "react-router-dom";
import { MatchDayRoundPage } from "./MatchDayRoundPage";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

interface MatchDayDetailProps {
}

export const MatchDayDetail: React.FC<MatchDayDetailProps> = ({ }) => {

    const { id } = useParams<{ id: string }>();
    const { season } = useSeason();
    const notification = useNotification();

    const [activeRoundId, setActiveRound] = useState("");
    const [selectedRoundId, setSelectedRoundId] = useState("");
    // const [enabledRoundIds, setEnabledRoundIds] = useState<string[]>([]); // Zustand für die aktiven Runden
    const [rounds, setRounds] = useState<MatchDayRound[]>([]);


    const matchDayId = id;
    if (!matchDayId) return null; // Sicherstellen, dass die ID vorhanden ist    
    if (season === null) return null; // Sicherstellen, dass die Saison vorhanden ist    

    var matchDayService = new MatchDayService(season.id, notification);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
        setSelectedRoundId(newValue);
    };

    const addNewRound = async () => {
        await matchDayService.createMatchDayRound(matchDayId);
        fetchRounds();
    };

    async function fetchRounds() {
        const dbRounds = await matchDayService.getAllMatchDayRounds(matchDayId!);
        setRounds(dbRounds);
        const activeRoundId = dbRounds[dbRounds.length - 1].id; // Setze die aktive Runde auf die letzte Runde
        setActiveRound(activeRoundId); // Setze die aktive Runde auf die letzte Runde
        setSelectedRoundId(activeRoundId); // Setze die ausgewählte Runde auf die letzte Runde
    }


    // const changeTabState = (enableTab: boolean) => {
    //     if (enableTab) {
    //         if (!enabledRoundIds.includes(selectedRoundId)) {
    //             setEnabledRoundIds((prev) => [...prev, selectedRoundId]);
    //         }
    //     }
    //     else
    //         setEnabledRoundIds((prev) => prev.filter((id) => id !== selectedRoundId));
    // }

    const handleDelete = async (roundId: string) => {
        // if (rounds.length <= 1) {
        //     notification.notifyError("Es muss mindestens eine Runde vorhanden sein.");
        //     return;
        // }

        // const confirmed = window.confirm("Möchten Sie diese Runde wirklich löschen?");
        // if (!confirmed) return;

        // try {
        //     await matchDayService.deleteMatchDayRound(matchDayId, roundId);
        //     setRounds((prev) => prev.filter((round) => round.id !== roundId));
        //     notification.notifySuccess("Runde erfolgreich gelöscht.");
        //     // Wenn die gelöschte Runde die aktive Runde war, setze die nächste Runde als aktiv
        //     if (activeRoundId === roundId && rounds.length > 1) {
        //         const nextActiveRound = rounds[0].id; // Nimm die erste Runde als neue aktive Runde
        //         setActiveRound(nextActiveRound);
        //         setSelectedRoundId(nextActiveRound);
        //     }
        // } catch (error) {
        //     notification.notifyError("Fehler beim Löschen der Runde.");
        // }
    }

    const closeMatchDay = async () => {
        try {
            await matchDayService.closeMatchDay(matchDayId);
            notification.notifySuccess("Spieltag erfolgreich abgeschlossen.");
        } catch (error) {
            notification.notifyError("Fehler beim Abschließen des Spieltags.");
        }
    }

    const init = async () => {
        await fetchRounds();
    }

    useEffect(() => {
        init();
    }, []);


    return (
        <CustomPaper sx={{ height: "100%" }}>
            <Stack direction="column" spacing={2} sx={{ height: "100%" }}>
                {/* Obere Buttons und Tabs */}
                <Box display="flex" alignItems="center">
                    <Tabs
                        value={selectedRoundId}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {rounds.map((round, index) => (
                            <Tab key={round.id} label={
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {`Runde ${round.number}`}
                                    {index === rounds.length - 1 && (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(round.id);
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </span>
                            } value={round.id} />
                        ))}
                    </Tabs>
                    <Button
                        color="primary"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={addNewRound}
                        sx={{ marginLeft: 2 }}
                    >
                        Neue Runde
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                    <Button
                        color="primary"
                        variant="outlined"
                        startIcon={<TaskAltIcon />}
                        onClick={closeMatchDay}
                        sx={{ marginLeft: 2 }}
                    >
                        Spieltag abschließen
                    </Button>
                </Box>

                {/* Inhalt Bereich */}
                <Box sx={{ flexGrow: 1, overflow: "hidden", minHeight: 0 }}>
                    {rounds.map((round) => (
                        round.id === selectedRoundId && (
                            <MatchDayRoundPage
                                key={round.id}
                                matchDayId={matchDayId}
                                round={round}
                                // changeTabState={changeTabState}
                                addNewRound={addNewRound}
                                isActive={activeRoundId === round.id}
                                isEnabled={true}
                            />
                        )
                    ))}
                </Box>
            </Stack>
        </CustomPaper>


    );
}
