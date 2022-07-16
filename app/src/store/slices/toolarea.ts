import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { chatActions } from './chat';
import { filesActions } from './files';

export interface ToolareaState {
  toolAreaOpen: boolean;
  currentToolTab: 'chat' | 'users';
  unreadMessages: number;
  unreadFiles: number;
}

const initialState: ToolareaState = {
  toolAreaOpen: false,
  currentToolTab: 'chat', // chat, settings, users
  unreadMessages: 0,
  unreadFiles: 0,
};

const toolareaSlice = createSlice({
  name: 'toolarea',
  initialState,
  reducers: {
    toggleToolArea(state) {
      const toolAreaOpen = !state.toolAreaOpen;
      state.toolAreaOpen = toolAreaOpen;
      state.unreadMessages =
        toolAreaOpen && state.currentToolTab === 'chat'
          ? 0
          : state.unreadMessages;
      state.unreadFiles =
        toolAreaOpen && state.currentToolTab === 'chat' ? 0 : state.unreadFiles;
    },
    openToolArea(state) {
      state.toolAreaOpen = true;
      state.unreadMessages =
        state.currentToolTab === 'chat' ? 0 : state.unreadMessages;
      state.unreadFiles =
        state.currentToolTab === 'chat' ? 0 : state.unreadFiles;
    },
    closeToolArea(state) {
      state.toolAreaOpen = false;
    },
    setToolTab(state, action: PayloadAction<ToolareaState['currentToolTab']>) {
      const toolTab = action.payload;
      state.currentToolTab = toolTab;
      state.unreadMessages = toolTab === 'chat' ? 0 : state.unreadMessages;
      state.unreadFiles = toolTab === 'chat' ? 0 : state.unreadFiles;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(chatActions.addMessage, (state) => {
        if (state.toolAreaOpen && state.currentToolTab === 'chat') {
          return;
        }

        state.unreadMessages++;
      })
      .addCase(filesActions.addFile, (state) => {
        if (state.toolAreaOpen && state.currentToolTab === 'chat') {
          return;
        }

        state.unreadFiles++;
      });
  },
});

export const toolareaActions = toolareaSlice.actions;
export const toolareaReducer = toolareaSlice.reducer;
