import { Box, Button, Container, Paper, Stack, TextField, styled } from "@mui/material"

export function Settings(){
    const Item = styled(Paper)(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
        ...theme.typography.body2,
        padding: theme.spacing(1),
        textAlign: 'center',
        color: theme.palette.text.secondary,
      }));
    
    return   (
        <Box>
            <Stack spacing={2} width={200}>
                <TextField label="Anzahl Tennisplätze" inputProps={{ type: 'number'}} />

                <Button variant="contained">Speichern</Button>
            </Stack>
        </Box>
            
          
        // <Grid container spacing={2}>
        //     <Grid item xs={8}>
        //         <Item>xs=8</Item>
        //     </Grid>
        //     <Grid item xs={4}>
        //         <Item>xs=4</Item>
        //     </Grid>
        //     <Grid item xs={4}>
        //         <Item>xs=4</Item>
        //     </Grid>
        //     <Grid item xs={8}>
        //         <Item>xs=8</Item>
        //     </Grid>
        // </Grid>
    )
}