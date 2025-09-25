import { RankingRecord } from "../model/RankingRecord";
import { save } from '@tauri-apps/plugin-dialog';
import { BaseDirectory, writeTextFile } from '@tauri-apps/plugin-fs';

export class ExportService {

    async exportAsJson(fileName: string, data: RankingRecord[]) {
        const json = JSON.stringify(data, null, 2);

        // User fragt Pfad ab
        const filePath = await save({
            filters: [{ name: "JSON", extensions: ["json"] }],
            defaultPath: fileName,
        });

        if (!filePath) return;

        // an Rust senden
        await writeTextFile(filePath, json, {
            baseDir: BaseDirectory.AppConfig,
        });
    }

}