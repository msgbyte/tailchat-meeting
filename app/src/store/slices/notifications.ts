import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import randomString from 'crypto-random-string';

export interface NotificationType {
  id: string;
  type?: 'default' | 'error' | 'success' | 'warning' | 'info';
  text: string;
  timeout: number;
  toBeClosed?: boolean;
  persist?: boolean;
}

export type NotificationsState = NotificationType[];

const initialState: NotificationsState = [];

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification(state, action: PayloadAction<NotificationType>) {
      state.push({
        ...action.payload,
        toBeClosed: false,
      });
    },
    removeNotification(state, action: PayloadAction<string>) {
      const notificationId = action.payload;

      state = state.filter(
        (notification) => notification.id !== notificationId
      );
    },
    removeAllNotifications(state) {
      state = [];
    },
    closeNotification(state, action: PayloadAction<string>) {
      const notificationId = action.payload;

      state.forEach((e) => {
        if (e.id === notificationId) {
          e.toBeClosed = true;
        }

        return e;
      });
    },
  },
});

export const notificationsActions = notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;

export const notifyAction = createAsyncThunk(
  'notifications/notify',
  (
    detail: Pick<NotificationType, 'type' | 'text'> & { timeout?: number },
    { dispatch }
  ) => {
    const { type = 'info', text } = detail;
    let timeout = detail.timeout;
    if (!timeout) {
      switch (type) {
        case 'info':
          timeout = 3000;
          break;
        case 'error':
          timeout = 5000;
          break;
        default:
          timeout = 3000;
          break;
      }
    }

    const notification = {
      id: randomString({ length: 6 }).toLowerCase(),
      type: type,
      text: text,
      timeout: timeout,
    };

    dispatch(notificationsActions.addNotification(notification));

    setTimeout(() => {
      dispatch(notificationsActions.removeNotification(notification.id));
    }, timeout);
  }
);
