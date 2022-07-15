import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type StatusType = 'init' | 'start' | 'stop' | 'pause' | 'resume';

export interface RecorderState {
  localRecordingState: {
    status: StatusType;
    consent: StatusType;
  };
}

const initialState: RecorderState = {
  localRecordingState: {
    status: 'init',
    consent: 'init',
  },
};

const recorderSlice = createSlice({
  name: 'recorder',
  initialState,
  reducers: {
    setLocalRecordingState: (
      state,
      action: PayloadAction<Exclude<StatusType, 'init'>>
    ) => {
      const status = action.payload;
      state.localRecordingState.status = status;
    },
    setLocalRecordingConsent: (
      state,
      action: PayloadAction<Exclude<StatusType, 'init'>>
    ) => {
      const agreed = action.payload;
      state.localRecordingState.consent = agreed;
    },
  },
});

export const recorderActions = recorderSlice.actions;
export const recorderReducer = recorderSlice.reducer;
