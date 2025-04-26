import { INotificationService } from "../provider/NotificationProvider";

export abstract class ServiceBase {

    seasonId: string;
    noticiationService: INotificationService;
    notifyError: (message: string) => Error;


    constructor(seasonId: string, notificationService: INotificationService) {
        this.seasonId = seasonId;
        this.noticiationService = notificationService;
        this.notifyError = notificationService.notifyError;
    }
}
