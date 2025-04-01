import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

interface CustomModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  okCaption?: string;
  cancelCaption?: string;
  showCancel?: boolean;
  children?: React.ReactNode;
  onConfirm?: () => void;
}

const CustomDialog: React.FC<CustomModalProps> = ({ open, onClose, title, children, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Abbrechen</Button>
        {onConfirm && (
          <Button onClick={onConfirm} color="primary" variant="contained">
            Bestätigen
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CustomDialog;
