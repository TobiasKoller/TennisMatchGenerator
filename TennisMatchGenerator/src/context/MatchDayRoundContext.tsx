import { createContext } from "react";

type MatchDayRoundContextType = {
    isPlayerUsedInMatch: (playerId: string) => boolean;
    reloadMatches: () => Promise<void>;
    isEditable: () => boolean;
};

export const MatchDayRoundContext = createContext<MatchDayRoundContextType | undefined>(undefined);