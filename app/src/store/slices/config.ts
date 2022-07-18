import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { config as defaultConfig } from '../../config';

export type ConfigState = typeof defaultConfig;

const initialState: ConfigState = {
  ...defaultConfig,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    set(state, action: PayloadAction<ConfigState>) {
      state = action.payload;
    },
  },
});

export const configActions = configSlice.actions;
export const configReducer = configSlice.reducer;
