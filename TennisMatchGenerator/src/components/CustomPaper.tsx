import { Paper, styled } from "@mui/material";

export const CustomPaper = styled(Paper)(({ theme }) => ({
        // width: 120,
        // height: 120,
        padding: theme.spacing(2),
        ...theme.typography.body2,
        textAlign: 'left',
    }));