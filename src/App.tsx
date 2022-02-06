import React, { ChangeEventHandler, useEffect } from 'react';
import './App.css';
import { Box, createTheme, CssBaseline, Typography, Grid, ListItem, ListItemText, Paper, useMediaQuery, FormControl, InputLabel, FilledInput } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { wordleSolverSlice, getWordList } from './features/wordleSolver/wordleSolverSlice';


const renderRow = (data: string[]) => ({ style, index } : ListChildComponentProps) => (
    <ListItem style={style} key={index} component='div' >
      <ListItemText primary={data[index]} />
    </ListItem>
  )


const renderLoadingRow = ({ style, index } : ListChildComponentProps) => (
    <ListItem style={style} key={ index } component='div' >
      <ListItemText primary='LOADING' />
    </ListItem>
  )

function App() {
  const dispatch = useAppDispatch();
  const {wordList: data, fullWordList, greenLetters, greyLetters, orangeLetters } = useAppSelector(state => state.wordleSolver);
  useEffect(() => {
    dispatch(getWordList());
  },[dispatch])
  const changeGreyLetters : ChangeEventHandler<HTMLTextAreaElement> = (e) => {
    let letters = e.target.value.toLowerCase().split('');
    letters = letters.filter((l, i) => letters.indexOf(l) === i);
    dispatch(wordleSolverSlice.actions.setGreyLetters(letters));
    dispatch(wordleSolverSlice.actions.filterWordList())
  }
  const changeGreenLetter = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, index: number) => {
    if (e.target.value.length > 1) {
      return false;
    }
    dispatch(wordleSolverSlice.actions.setGreenLetter({index, letter: e.target.value === '' ? null : e.target.value.toLowerCase()}))
    dispatch(wordleSolverSlice.actions.filterWordList())
  }
  const changeOrangeLetters = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>, index: number) => {
    let letters = e.target.value.toLowerCase().split('');
    letters = letters.filter((l, i) => letters.indexOf(l) === i);
    dispatch(wordleSolverSlice.actions.setOrangeLetters({index, letters}))
    dispatch(wordleSolverSlice.actions.filterWordList())
  }
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Paper>
        <Grid container spacing={2} padding={2}>
          <Grid item xs={12}>
            <Paper elevation={3} sx={{padding: '1em'}}>
              <Typography variant='h2' component='h1'>Wordle Solver</Typography>
            </Paper>
          </Grid>
          <Grid item xs={3}>
            <Paper elevation={2} sx={{padding: '0.2em'}}>
              <Typography variant='h4' sx={{padding: '0.5em'}}>Available Words<Typography variant='subtitle2'>({data.length}/{fullWordList.length})</Typography></Typography>
              <FixedSizeList
                height={500}
                width='100%'
                itemSize={46}
                itemCount={data.length || 1}
                overscanCount={5}
                >
                  { data.length ? renderRow(data) : renderLoadingRow }
                </FixedSizeList>
            </Paper>
          </Grid>
          <Grid item xs={9}>
            <Paper elevation={1} sx={{padding: '0.2em'}}>
              <Typography variant='h4' sx={{padding: '0.5em'}}>Letters</Typography>
              <Box sx={{padding: '0.5em'}}>
                <FormControl variant='filled' sx={{width: '100%'}}>
                  <InputLabel htmlFor='grey-letters'>Grey Letters</InputLabel>
                  <FilledInput id='grey-letters' value={greyLetters.join('').toUpperCase()} onChange={changeGreyLetters} />
                </FormControl>
                <Grid container spacing={2} paddingTop={2} columns={{xs: 10}}>
                  {
                    greenLetters.map((l, i) => (
                      <Grid item xs={2} key={i}>
                        <Paper elevation={5}>
                          <FormControl variant='filled' sx={{width: '100%'}}>
                            <InputLabel htmlFor={`green-letter-${i}`}>Green Letter</InputLabel>
                            <FilledInput id={`green-letter-${i}`} value={greenLetters[i]?.toUpperCase() || ''} onChange={e => changeGreenLetter(e, i)} />
                          </FormControl>
                        </Paper>
                      </Grid>
                    ))
                  }
                  {
                    orangeLetters.map((l, i) => (
                      <Grid item xs={2} key={i}>
                        <Paper elevation={5}>
                          <FormControl variant='filled' sx={{width: '100%'}}>
                            <InputLabel htmlFor={`green-letter-${i}`}>Orange Letters</InputLabel>
                            <FilledInput id={`green-letter-${i}`} value={orangeLetters[i].join('').toUpperCase()} onChange={e => changeOrangeLetters(e, i)} />
                          </FormControl>
                        </Paper>
                      </Grid>
                    ))
                  }
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </ThemeProvider>
  );
}

export default App;
