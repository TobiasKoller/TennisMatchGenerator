CREATE TABLE "match" (
    "id"	TEXT NOT NULL UNIQUE,
    "round_id"	TEXT NOT NULL,
    "type"	TEXT,
    "number"	INTEGER,
    "court"	INTEGER,
    "set1"	TEXT,
    "set2"	TEXT,
    "player1_home_id"	TEXT,
    "player2_home_id"	TEXT,
    "player1_guest_id"	TEXT,
    "player2_guest_id"	TEXT,
    PRIMARY KEY("id"),
    FOREIGN KEY("player1_guest_id") REFERENCES "player"("id"),
    FOREIGN KEY("player1_home_id") REFERENCES "player"("id"),
    FOREIGN KEY("player2_guest_id") REFERENCES "player"("id"),
    FOREIGN KEY("player2_home_id") REFERENCES "player"("id"),
    FOREIGN KEY("round_id") REFERENCES "round"("id")
);

CREATE TABLE "matchday" (
    "id"	TEXT NOT NULL UNIQUE,
    "season_id"	TEXT NOT NULL,
    "date"	TEXT,
    "is_active"	INTEGER,
    "is_closed"	INTEGER,
    PRIMARY KEY("id")
);

CREATE TABLE "player" (
    "id"	TEXT NOT NULL UNIQUE,
    "season_id"	TEXT NOT NULL,
    "firstname"	TEXT,
    "lastname"	TEXT,
    "skill_rating"	INTEGER,
    "gender"	TEXT,
    "birthdate"	TEXT,
    "is_active"	INTEGER,
    PRIMARY KEY("id")
);

CREATE TABLE "round" (
    "id"	TEXT NOT NULL UNIQUE,
    "matchday_id"	TEXT,
    "number"	INTEGER NOT NULL,
    "start_date"	TEXT,
    "end_date"	TEXT,
    "courts"	INTEGER,
    "is_active"	INTEGER,
    PRIMARY KEY("id")
);

CREATE TABLE "round_player" (
    "id"	TEXT NOT NULL UNIQUE,
    "round_id"	TEXT NOT NULL,
    "player_id"	TEXT NOT NULL,
    PRIMARY KEY("id"),
    FOREIGN KEY("player_id") REFERENCES "player"("id"),
    FOREIGN KEY("round_id") REFERENCES "round"("id")
);

CREATE TABLE "season" (
    "id"	TEXT NOT NULL UNIQUE,
    "number"	INTEGER NOT NULL,
    "year"	INTEGER NOT NULL,
    "description"	TEXT,
    "settings"	BLOB,
    "is_active"	INTEGER,
    PRIMARY KEY("number" AUTOINCREMENT)
);

CREATE TABLE "statistic" (
    "id"	TEXT NOT NULL UNIQUE,
    "season_id"	TEXT,
    "player_id"	TEXT NOT NULL,
    "won_games"	INTEGER,
    "points_for_participation"	INTEGER,
    "points_for_won_games"	INTEGER,
    PRIMARY KEY("id")
);
