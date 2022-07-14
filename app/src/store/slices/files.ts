import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface FileInfo {
  sender: 'client' | 'response';
  active: boolean;
  progress: number;
  files: unknown;
  magnetUri: string;
  timeout: boolean;
}

export interface FilesState {
  files: FileInfo[];
  count: number;
  countUnread: number;
}

const initialState: FilesState = {
  files: [],
  count: 0,
  countUnread: 0,
};

const filesSlice = createSlice({
  name: 'file',
  initialState,
  reducers: {
    addFile(state, action: PayloadAction<FileInfo>) {
      const file = action.payload;

      state.files.push({
        ...file,
        active: false,
        progress: 0,
        files: null,
      });
      state.count++;
      state.countUnread =
        file.sender === 'response' ? ++state.countUnread : state.countUnread;
    },
    addFileHistory(state, action: PayloadAction<FileInfo[]>) {
      const fileHistory = action.payload;

      const newFileHistory = [];

      fileHistory.forEach((file) => {
        newFileHistory.push({
          active: false,
          progress: 0,
          files: null,
          ...file,
        });
      });

      state.files = newFileHistory;
      state.count = newFileHistory.length;
    },
    setFileActive(state, action: PayloadAction<string>) {
      const magnetUri = action.payload;

      state.files.forEach((item, index) => {
        if (item.magnetUri === magnetUri) {
          state.files[index].active = true;
        }
      });
    },
    setFileInactive(state, action: PayloadAction<string>) {
      const magnetUri = action.payload;

      state.files.forEach((item, index) => {
        if (item.magnetUri === magnetUri) {
          state.files[index].active = false;
        }
      });
    },
    setFileProgress(
      state,
      action: PayloadAction<{
        magnetUri: string;
        progress: number;
      }>
    ) {
      const { magnetUri, progress } = action.payload;

      state.files.forEach((item, index) => {
        if (item.magnetUri === magnetUri) {
          state.files[index].progress = progress;
        }
      });
    },
    setFileDone(
      state,
      action: PayloadAction<{
        magnetUri: string;
        sharedFiles: unknown;
      }>
    ) {
      const { magnetUri, sharedFiles } = action.payload;

      state.files.forEach((item, index) => {
        if (item.magnetUri === magnetUri) {
          state.files[index] = {
            ...item,
            files: sharedFiles,
            progress: 1,
            active: false,
            timeout: false,
          };
        }
      });
    },
    clearFiles(state) {
      state.files = [];
      state.count = 0;
      state.countUnread = 0;
    },
  },
});

export const filesActions = filesSlice.actions;
export const filesReducer = filesSlice.reducer;
