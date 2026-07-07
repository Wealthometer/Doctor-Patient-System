import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationApi } from '@/api/services';

interface NotificationState {
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  unreadCount: 0,
  loading: false,
  error: null,
};

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await notificationApi.getUnreadCount();
      return data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { detail?: string } } };
      return rejectWithValue(err.response?.data?.detail || 'Failed to fetch unread count');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default notificationSlice.reducer;
