import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type TransportsType = 'recv' | 'send';

export interface TransportsState {
  recv?: unknown;
  send?: unknown;
}

const initialState: TransportsState = {};

const transportsSlice = createSlice({
  name: 'transports',
  initialState,
  reducers: {
    addTransportStats(
      state,
      action: PayloadAction<{ transport: any; type: TransportsType }>
    ) {
      const { transport, type } = action.payload;

      state[type] = transport[0];
    },
  },
});

export const transportsActions = transportsSlice.actions;
export const transportsReducer = transportsSlice.reducer;
