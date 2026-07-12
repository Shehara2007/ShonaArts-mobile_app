import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppNotification } from '../../types';

interface NotificationState {
  items: AppNotification[];
  loading: boolean;
}

const initialState: NotificationState = {
  items: [],
  loading: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<AppNotification[]>) => {
      state.items = action.payload;
      state.loading = false;
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const item = state.items.find((n) => n.id === action.payload);
      if (item) item.read = true;
    },
    markAllNotificationsRead: (state) => {
      state.items.forEach((n) => {
        n.read = true;
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
    setNotificationLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  removeNotification,
  setNotificationLoading,
} = notificationSlice.actions;

export const selectUnreadNotificationCount = (state: {
  notification: NotificationState;
}) => state.notification.items.filter((n) => !n.read).length;

export default notificationSlice.reducer;
