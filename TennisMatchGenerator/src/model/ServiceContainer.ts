import { PlayerService } from "../services/PlayerService";
import { SeasonService } from "../services/SeasonService";
import { SettingService } from "../services/SettingService";

export interface ServiceContainer {
  settingService: SettingService;
  seasonService: SeasonService;
  playerService: PlayerService;
}

