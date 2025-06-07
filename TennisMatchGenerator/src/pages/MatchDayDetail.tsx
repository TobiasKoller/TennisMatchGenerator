import { Box, Button, Chip, IconButton, Stack, Tab, Tabs, Tooltip, Typography, } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { CustomPaper } from "../components/CustomPaper";
import { MatchDayService } from "../services/MatchDayService";
import { useNotification } from "../provider/NotificationProvider";
import { useSeason } from "../context/SeasonContext";
import { MatchDayRound } from "../model/MatchDayRound";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MatchDayRoundPage } from "./MatchDayRoundPage";
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { SeasonService } from "../services/SeasonService";
import LockIcon from '@mui/icons-material/Lock';
import { ConfirmDialog, ConfirmDialogHandle } from "../components/ConfirmDialog";
import { MatchDay } from "../model/Matchday";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { RoutePath } from "../model/RoutePath";

interface MatchDayDetailProps {
}

export const MatchDayDetail: React.FC<MatchDayDetailProps> = ({ }) => {

    const { id } = useParams<{ id: string }>();
    const { season } = useSeason();
    const notification = useNotification();

    // const [activeRoundId, setActiveRound] = useState("");
    const [selectedRoundId, setSelectedRoundId] = useState("");
    const [isClosed, setIsClosed] = useState(false);
    const [prevMatchDayId, setPrevMatchDayId] = useState<string | null>(null);
    const [nextMatchDayId, setNextMatchDayId] = useState<string | null>(null);

    // const [enabledRoundIds, setEnabledRoundIds] = useState<string[]>([]); // Zustand für die aktiven Runden
    const [rounds, setRounds] = useState<MatchDayRound[]>([]);
    const [matchDay, setMatchDay] = useState<MatchDay | null>(null);
    const dialogRef = useRef<ConfirmDialogHandle>(null);
    const location = useLocation();
    const navigateHook = useNavigate();

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

    const formatDate = (value: Date | undefined) => {
        if (!value) return "";
        return value.toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }

    async function fetchRounds() {
        const dbRounds = await matchDayService.getAllMatchDayRounds(matchDayId!);
        setRounds(dbRounds);
        if (dbRounds.length === 0)
            return;

        const activeRoundId = dbRounds[dbRounds.length - 1].id; // Setze die aktive Runde auf die letzte Runde
        // setActiveRound(activeRoundId); // Setze die aktive Runde auf die letzte Runde
        setSelectedRoundId(activeRoundId); // Setze die ausgewählte Runde auf die letzte Runde
    }


    const handleDelete = async (roundId: string) => {
        if (rounds.length <= 1) {
            notification.notifyWarning("Es muss mindestens eine Runde vorhanden sein.");
            return;
        }

        var round = rounds.find((r) => r.id === roundId);
        if (!round) {
            notification.notifyError("Runde nicht gefunden.");
            return;
        }

        var matches = await matchDayService.getMatches(roundId);
        if (matches && matches.length > 0) {
            notification.notifyWarning("Die Runde kann nicht gelöscht werden, da sie bereits Spiele enthält.");
            return;
        }

        const confirmed = window.confirm("Möchten Sie diese Runde wirklich löschen?");
        if (!confirmed) return;

        try {
            await matchDayService.deleteMatchDayRound(roundId);
            var filteredRounds = rounds.filter((r) => r.id !== roundId);
            setRounds(filteredRounds);

            setSelectedRoundId(filteredRounds[filteredRounds.length - 1].id); // Setze die ausgewählte Runde auf die letzte Runde
            notification.notifySuccess("Runde erfolgreich gelöscht.");

        } catch (error) {
            notification.notifyError("Fehler beim Löschen der Runde.");
        }
    }

    const closeMatchDay = async () => {

        //wirklich abschließen?
        dialogRef.current?.open({

            question: "Möchten Sie den gesamten Spieltag wirklich beenden?",
            onConfirm: async () => {
                try {
                    var seasonService = new SeasonService();
                    await matchDayService.closeMatchDay(seasonService, matchDayId)
                    setIsClosed(true);

                    notification.notifySuccess("Spieltag erfolgreich abgeschlossen.");
                } catch (error) {
                    notification.notifyError(error instanceof Error ? error.message : "Fehler beim Abschließen des Spieltags.");
                }
            },
            onClose: () => {
            },
        });

    }

    const navigateToPrevMatchDay = () => {
        navigateHook(`/${RoutePath.MATCHDAYS.path}/${prevMatchDayId}`);
    };

    const navigateToNextMatchDay = () => {
        navigateHook(`/${RoutePath.MATCHDAYS.path}/${nextMatchDayId}`);
    };

    const init = async () => {
        var currentMatchDay = await matchDayService.getMatchDayById(matchDayId);
        setMatchDay(currentMatchDay);
        setIsClosed(currentMatchDay.isClosed);

        var prevId = await matchDayService.getPrevMatchDayId(currentMatchDay.id);
        var nextId = await matchDayService.getNextMatchDayId(currentMatchDay.id);

        setPrevMatchDayId(prevId);
        setNextMatchDayId(nextId);

        await fetchRounds();
    }

    useEffect(() => {
        init();
    }, [id]);

    useEffect(() => {
        init();
    }, []);


    return (
        <CustomPaper sx={{ height: "100%", pointerEvents: isClosed ? 'none' : 'auto', }} >
            <Box display="flex" alignItems="center" gap={1} sx={{ pointerEvents: "all" }}>
                {prevMatchDayId && (

                    <Tooltip title={"vorheriger Spieltag"}>
                        <IconButton onClick={navigateToPrevMatchDay} aria-label="Zurück">
                            <ArrowBackIcon />
                        </IconButton>
                    </Tooltip>
                )}
                {`Spieltag vom ${formatDate(matchDay?.date)}`}
                {
                    nextMatchDayId && (
                        <Tooltip title={"nächster Spieltag"}>
                            <IconButton onClick={navigateToNextMatchDay} aria-label="Weiter">
                                <ArrowForwardIcon />
                            </IconButton>
                        </Tooltip>
                    )}
            </Box>
            {/* <Typography variant="h6">
                {`Spieltag vom ${formatDate(matchDay?.date)}`}
            </Typography> */}
            <Stack direction="column" spacing={2} sx={{ height: "100%" }}>
                {/* Obere Buttons und Tabs */}
                <Box display="flex" alignItems="center" sx={{ borderBottom: 1, borderColor: 'divider', padding: 1 }}>
                    <Tabs
                        value={selectedRoundId}
                        onChange={handleTabChange}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {rounds.map((round, index) => (
                            <Tab key={round.id} sx={{ pointerEvents: 'all' }} label={
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {`Runde ${round.number}`}
                                    {index > 0 && index === rounds.length - 1 && (
                                        !isClosed && <IconButton
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
                    {!isClosed &&
                        <Button
                            color="primary"
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={addNewRound}
                            sx={{ marginLeft: 2 }}
                        >
                            Neue Runde
                        </Button>
                    }
                    <Box sx={{ flexGrow: 1 }} />
                    {
                        isClosed
                            ? <Chip
                                icon={<LockIcon />}
                                label="Spieltag abgeschlossen"
                                color="default" // oder "primary", "secondary", "success", je nach gewünschter Farbe
                                variant="outlined" // oder "filled"
                                sx={{
                                    borderColor: '#f44336',
                                    borderWidth: 2,
                                    color: '#f44336',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    '&:hover': {
                                        backgroundColor: '#ffebee', // leicht roter Hover-Hintergrund
                                    }
                                }}
                            />
                            :
                            <Button
                                color="success"
                                variant="outlined"
                                startIcon={<TaskAltIcon />}
                                onClick={closeMatchDay}
                                disabled={isClosed}
                            >
                                Spieltag abschließen
                            </Button>

                    }
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
                                isClosed={isClosed}
                            // isActive={activeRoundId === round.id}
                            // isEnabled={true}
                            />
                        )
                    ))}
                </Box>
            </Stack>
            <ConfirmDialog ref={dialogRef} />
        </CustomPaper >


    );
}
