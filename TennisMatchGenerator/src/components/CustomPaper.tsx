import { Paper, PaperProps, styled } from "@mui/material";

export const CustomPaper = styled((props: PaperProps) => (
    <Paper elevation={props.elevation ?? 16} {...props} />
))(({ theme }) => ({
    padding: theme.spacing(2),
    margin: theme.spacing(2),
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    minHeight: 0,
    ...theme.typography.body2,
    textAlign: 'left',
    elevation: 16
}));

