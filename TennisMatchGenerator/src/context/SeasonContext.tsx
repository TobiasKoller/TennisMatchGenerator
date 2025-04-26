import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
    useRef,
} from "react";
import { Season } from "../model/Season";
import { SeasonService } from "../services/SeasonService";

type SeasonContextType = {
    season: Season | null;
    setSeason: (s: Season) => void;
    // updateSeason: (fn: (prev: Season) => Season) => Promise<void>;
};

const SeasonContext = createContext<SeasonContextType | undefined>(undefined);

export const SeasonProvider = ({ children }: { children: ReactNode }) => {
    const [season, setSeason] = useState<Season | null>(null);
    const seasonServiceRef = useRef<SeasonService | null>(null);
    const hasLoaded = useRef(false);

    useEffect(() => {
        if (hasLoaded.current) return;
        hasLoaded.current = true;

        seasonServiceRef.current = new SeasonService();
        const loadSeason = async () => {
            var seasonService = seasonServiceRef.current;
            if (!seasonService) return;

            var season = await seasonService.getCurrentSeason();

            setSeason(season);
        };

        loadSeason();

    }, []);

    // const saveSeasonToDb = async (season: Season) => {
    //     await seasonServiceRef.current!.saveCurrentSeason(season);
    // };

    // const updateSeason = async (fn: (prev: Season) => Season) => {
    //     if (!season) return;
    //     const newSeason = fn(season);
    //     setSeason(newSeason); // lokal aktualisieren
    //     await saveSeasonToDb(newSeason); // direkt in DB schreiben
    // };

    return (
        <SeasonContext.Provider value={{ season, setSeason }}>
            {children}
        </SeasonContext.Provider>
    );
};

export const useSeason = () => {
    const ctx = useContext(SeasonContext);
    if (!ctx) throw new Error("useSeason must be used within a SeasonProvider");
    return ctx;
};
