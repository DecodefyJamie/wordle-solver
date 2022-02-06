import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/dist/query';
import { wordleSolverSlice } from '../features/wordleSolver/wordleSolverSlice';

export const store = configureStore({
  reducer: {
    [wordleSolverSlice.name]: wordleSolverSlice.reducer,
  },
});

setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
