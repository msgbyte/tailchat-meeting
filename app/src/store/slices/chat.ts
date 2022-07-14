import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  type: 'message' | 'file';
  time: number;
  sender: 'response' | 'client';
  isRead: boolean;
  name: string;
  peerId: string;
  picture: string;
  text: string;
  attachment?: File[];
}

export interface ChatState {
  order: 'asc' | 'desc';
  isScrollEnd: boolean;
  messages: ChatMessage[];
  count: number;
  countUnread: number;
}

const initialState: ChatState = {
  order: 'asc',
  isScrollEnd: true,
  messages: [],
  count: 0,
  countUnread: 0,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      const message = action.payload;

      state.messages.push(message);
      state.count++;
      if (message.sender === 'response') {
        state.countUnread++;
      }
    },
    addChatHistory: (state, action: PayloadAction<ChatMessage[]>) => {
      const chatHistory = action.payload;

      chatHistory.forEach((item, index) => {
        chatHistory[index].isRead = true;
      });

      state.messages = chatHistory;
      state.count = chatHistory.length;
    },
    clearChat: (state) => {
      state.messages = [];
      state.count = 0;
      state.countUnread = 0;
    },
    sortChat: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.order = action.payload;
    },
    setIsScrollEnd: (state, action: PayloadAction<boolean>) => {
      state.isScrollEnd = action.payload;
    },
    setIsMessageRead: (
      state,
      action: PayloadAction<{ id: string; isRead: boolean }>
    ) => {
      const { id, isRead } = action.payload;

      state.messages.forEach((key, index) => {
        if (state.messages[index].time === Number(id)) {
          state.messages[index].isRead = isRead;

          state.countUnread--;
        }
      });
    },
  },
});

export const chatActions = chatSlice.actions;
export const chatReducer = chatSlice.reducer;
