import { createContext } from "react";

type MatchDayRoundContextType = {
    isPlayerUsedInMatch: (playerId: string) => boolean;
    reloadMatches: () => Promise<void>;
};

export const MatchDayRoundContext = createContext<MatchDayRoundContextType | undefined>(undefined);