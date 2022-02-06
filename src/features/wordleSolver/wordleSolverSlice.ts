import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export type LetterGuess = string|null

export interface GreenLetterPayload {
  index: number,
  letter: string | null,
}

export interface OrangeLetterPayload {
  index: number,
  letters: string[],
}


export interface WordleSolverState {
  fullWordList: string[],
  wordList: string[],
  greyLetters: string[],
  greenLetters: [
    LetterGuess,
    LetterGuess,
    LetterGuess,
    LetterGuess,
    LetterGuess,
  ],
  orangeLetters: [
    string[],
    string[],
    string[],
    string[],
    string[],
  ]
}

const initialState: WordleSolverState = {
  fullWordList: [],
  wordList: [],
  greyLetters: [],
  greenLetters: [
    null,
    null,
    null,
    null,
    null,
  ],
  orangeLetters: [
    [],
    [],
    [],
    [],
    [],
  ]
}

export const getWordList = createAsyncThunk(
  'wordleSolver/getWordList',
  async () => {
    const data = await axios.get('https://raw.githubusercontent.com/charlesreid1/five-letter-words/master/sgb-words.txt');
    return data.data.split('\n')
  }
)

const generateLetterRegex = (position: number, letters: string[]) => new RegExp(`\\b.{${position}}[${letters.join('')}].{${4-position}}\\b`)

export const wordleSolverSlice = createSlice({
  name: 'wordleSolver',
  initialState,
  reducers: {
    setGreyLetters: (state, action: PayloadAction<string[]>) => {
      // check if green letters or orange letters already contain it (edge case with duplicated letters)
      const setLetters = action.payload.filter(l => !state.greenLetters.includes(l) && !state.orangeLetters.some(p => p.includes(l)));
      state.greyLetters = setLetters;
    },
    setOrangeLetters: (state, action: PayloadAction<OrangeLetterPayload>) => {
      state.orangeLetters[action.payload.index] = action.payload.letters;
    },
    setGreenLetter: (state, action: PayloadAction<GreenLetterPayload>) => {
      state.greenLetters[action.payload.index] = action.payload.letter;
    },
    filterWordList: (state) => {
      let newWordList = [...state.fullWordList];

      // green letters
      for (let position in state.greenLetters) {
        if (state.greenLetters[position]) {
          const greenRegex = generateLetterRegex(+position, [state.greenLetters[position]!]);
          newWordList = newWordList.filter(w => greenRegex.test(w))
        }
      }

      // grey letters
      if (state.greyLetters.length) {
        const greyRegEx = new RegExp(`\\b.*?[${state.greyLetters.join('')}].*?\\b`);
        newWordList = newWordList.filter(w => !greyRegEx.test(w))
      }
      // orange letters
      for (let position in state.orangeLetters) {
        if (state.orangeLetters[position].length) {
          // remove any words with the orange letter in this position
          const orangeRegEx = generateLetterRegex(+position, state.orangeLetters[position]);
          newWordList = newWordList.filter(w => !orangeRegEx.test(w))
          // remove words that don't include the orange letters at all
          for (let letter of state.orangeLetters[position]) {
            const missingOrangeRegEx = new RegExp(letter);
            newWordList = newWordList.filter(w => missingOrangeRegEx.test(w))
          }
        }
      }

      // return
      state.wordList = newWordList;
    }
  },
  extraReducers: builder => {
    builder.addCase(getWordList.fulfilled, (state, action) => {
      state.fullWordList = action.payload;
      state.wordList = action.payload;
      state.greenLetters = [null, null, null, null, null];
      state.greyLetters = [];
      state.orangeLetters = [[],[],[],[],[]];
    })
  }
})