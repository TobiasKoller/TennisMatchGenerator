// DatabaseInitializer.tsx
import { useEffect, useState } from "react"; // abhängig von deinem SQL plugin
import { AppService } from "../services/AppService";
import { useNotification } from "../provider/NotificationProvider";

type Props = {
    children: React.ReactNode;
};

export default function DatabaseInitializer({ children }: Props) {
    const [ready, setReady] = useState(false);

    const notification = useNotification();

    const appService = new AppService(notification);
    useEffect(() => {
        async function initDb() {

            if (!await appService.isDbInitialized()) {
                notification.notifySuccess("Datenbank wird initialisiert...");

                await appService.initializeDb();
                notification.notifySuccess("Datenbank erfolgreich eingerichtet.");
            }

            setReady(true);
        }

        initDb();
    }, []);

    if (!ready) return <div>Initialisiere Datenbank...</div>;

    return <>{children}</>;
}
