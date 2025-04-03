import { RouteDetails } from "./RouteDetails";

export const RoutePath: Record<string, RouteDetails> = {
    HOME: { path: "", displayName: "Startseite", description: "Startseite" },
    SETTINGS: { path: "settings", displayName: "Einstellungen", description: "Einstellungen" },
    PLAYERS: { path: "users", displayName: "Spieler/Innen", description: "Spieler/Innen" },
    CURRENT_SEASON: { path: "current-season", displayName: "Aktuelle Spielzeit", description: "Aktuelle Spielzeit" },
    NOT_FOUND: { path: "*", displayName: "Not Found", description: "Seite nicht gefunden" }

}

