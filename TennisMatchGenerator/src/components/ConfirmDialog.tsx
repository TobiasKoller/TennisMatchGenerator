// ConfirmDialog.tsx
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from "@mui/material";
import {
    forwardRef,
    useImperativeHandle,
    useState,
    useCallback,
} from "react";

export interface ConfirmDialogHandle {
    open: (options: {
        question?: string;
        onConfirm?: () => void;
        onClose?: () => void;
    }) => void;
    close: () => void;
}

export const ConfirmDialog = forwardRef<ConfirmDialogHandle>((_, ref) => {
    const [open, setOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [onConfirm, setOnConfirm] = useState<() => void>(() => () => { });
    const [onClose, setOnClose] = useState<() => void>(() => () => { });

    const handleClose = useCallback(() => {
        onClose();
        setOpen(false);
    }, [onClose]);

    const handleConfirm = useCallback(() => {
        onConfirm();
        setOpen(false);
    }, [onConfirm]);

    useImperativeHandle(ref, () => ({
        open: ({ question = "", onConfirm = () => { }, onClose = () => { } }) => {
            setQuestion(question);
            setOnConfirm(() => onConfirm);
            setOnClose(() => onClose);
            setOpen(true);
        },
        close: () => setOpen(false),
    }));

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Bestätigen</DialogTitle>
            <DialogContent>{question}</DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="inherit">
                    Nein
                </Button>
                <Button onClick={handleConfirm} color="primary" variant="contained">
                    Ja
                </Button>
            </DialogActions>
        </Dialog>
    );
});
