export interface RouteDetails {
    path: string;
    displayName: string;
    description?: string;
}


export const RoutePath: Record<string, RouteDetails> = {
    HOME: { path: "", displayName: "Startseite", description: "Startseite" },
    SETTINGS: { path: "settings", displayName: "Einstellungen", description: "Einstellungen" },
    PLAYERS: { path: "players", displayName: "Spieler/Innen", description: "Spieler/Innen" },
    MATCHDAYS: { path: "matchdays", displayName: "Spieltage", description: "Spieltage" },
    MATCHDAY: { path: "matchdays/:id", displayName: "Aktueller Spieltag", description: "Aktueller Spieltag" },
    NOT_FOUND: { path: "*", displayName: "Not Found", description: "Seite nicht gefunden" }

}

