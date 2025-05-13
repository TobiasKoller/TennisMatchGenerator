import { createContext } from "react";

type MatchDayRoundContextType = {
    // togglePlayerSelection: (playerId: string) => void;
    // isSelectedPlayer: (playerId: string) => boolean;
    registerDraggablePlayer: (control: HTMLDivElement) => void;
    isPlayerUsedInMatch: (playerId: string) => boolean;
};

export const MatchDayRoundContext = createContext<MatchDayRoundContextType | undefined>(undefined);