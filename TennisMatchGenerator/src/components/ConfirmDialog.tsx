import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

export function ConfirmDialog({ open, onClose, onConfirm, question }: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    question: string;
}) {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Bestätigen</DialogTitle>
            <DialogContent>{question}</DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Nein</Button>
                <Button onClick={onConfirm} color="primary" variant="contained">Ja</Button>
            </DialogActions>
        </Dialog>
    );
}
