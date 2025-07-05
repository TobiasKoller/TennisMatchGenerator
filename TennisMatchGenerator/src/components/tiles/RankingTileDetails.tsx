

import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useSeason } from "../../context/SeasonContext";
import { useNotification } from "../../provider/NotificationProvider";
import { StatisticService } from "../../services/StatisticService";
import { RankingRecordDetails } from "../../model/RankingRecordDetails";
import { WaitScreen } from "../../pages/WaitScreen";
import { SeasonService } from "../../services/SeasonService";

interface RankingTileDetailsProps {
    playerId?: string;
}

export const RankingTileDetails: React.FC<RankingTileDetailsProps> = (props) => {

    const { season } = useSeason();
    const notification = useNotification();
    if (!season) return null; // Sicherstellen, dass die Saison vorhanden ist

    const [ranking, setRanking] = useState<RankingRecordDetails>();
    const [pointsForParticipation, setPointsForParticipation] = useState<number>(0);

    const statisticService = new StatisticService(season.id, notification);
    const seasonService = new SeasonService();

    const init = async () => {
        var settings = await seasonService.getSettings();
        setPointsForParticipation(settings?.pointsForParticipation || 0); // Standardwert verwenden, falls nicht definiert    

        var result = await statisticService.getRankingForPlayer(props.playerId!);
        setRanking(result);
    };

    useEffect(() => {
        init();
    }, []);

    if (!ranking) return <WaitScreen />; // Sicherstellen, dass die Rangliste geladen ist

    return (
        <Box>
            {ranking.MatchDays.map((matchDay) => (
                <Box key={matchDay.matchDayId}>
                    <h3>{matchDay.matchDayDate?.toLocaleDateString()} ({matchDay.totalGames} Punkte + {pointsForParticipation})</h3>
                    <ul>
                        {matchDay.matches.map((match, index) => (
                            <li key={index}>
                                <span style={{ color: match.isPlayerHome ? (match.homeGames > match.guestGames ? 'green' : match.homeGames < match.guestGames ? 'red' : 'black') : (match.guestGames > match.homeGames ? 'green' : match.homeGames < match.guestGames ? 'red' : 'black') }}>
                                    {match.isPlayerHome ? <span style={{ backgroundColor: 'yellow' }}>{match.homeGames}</span> : match.homeGames} - {match.isPlayerHome ? match.guestGames : <span style={{ backgroundColor: 'yellow' }}>{match.guestGames}</span>}
                                </span>


                            </li>
                        ))}
                    </ul>
                </Box>
            ))}
        </Box>
    );
}
