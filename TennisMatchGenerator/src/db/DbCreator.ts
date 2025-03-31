import { readTextFile } from "@tauri-apps/plugin-fs";
import Database from "@tauri-apps/plugin-sql";

async function createNewDatabase(db: Database) {
  try {
    const sqlScript = await readTextFile("resources/Sql/init.sql"); // Holt Datei aus `resources`
    const statements = sqlScript.split(";").map((stmt) => stmt.trim()).filter(Boolean);

    for (const statement of statements) {
      await db.execute(statement);
    }

    console.log("Datenbank erfolgreich initialisiert.");
  } catch (error) {
    console.error("Fehler beim Initialisieren der Datenbank:", error);
  }
}
