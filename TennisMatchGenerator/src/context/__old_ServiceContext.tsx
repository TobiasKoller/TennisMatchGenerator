// import { createContext, useContext } from "react";
// import { ServiceContainer } from "../model/ServiceContainer";
// import { SeasonService } from "../services/SeasonService";
// import { SettingService } from "../services/SettingService";
// import { useSeason } from "./SeasonContext";
// import { PlayerService } from "../services/PlayerService";

// // ServiceContext.tsx
// const ServiceContext = createContext<ServiceContainer | null>(null);

// export const ServiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const { season, updateSeason } = useSeason();

//     if (!season) return null;

//     var seasonService = new SeasonService();

//     var services: ServiceContainer = {
//         seasonService: seasonService,
//         settingService: new SettingService(updateSeason),
//         playerService: new PlayerService(updateSeason), // Hier den richtigen Service für Spieler verwenden
//     }

//     return <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>;
// };

// export const useServices = () => {
//     const ctx = useContext(ServiceContext);
//     if (!ctx) throw new Error("useServices must be used within ServiceProvider");
//     return ctx;
// };
