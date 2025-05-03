
interface WaitScreenProps {
    message?: string;
}

export const WaitScreen: React.FC<WaitScreenProps> = (props) => {

    return (
        <div>
            {props.message || "Bitte warten..."}
        </div>
    );
}