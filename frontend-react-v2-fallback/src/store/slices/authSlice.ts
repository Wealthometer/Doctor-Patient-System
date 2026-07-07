import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/services';
import type { UserInfo, LoginRequest, RegisterRequest } from '../../types';

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })(),
  token: localStorage.getItem('accessToken'),
  loading: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async (data: LoginRequest, { rejectWithValue }) => {
  try {
    const res = await authApi.login(data);
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    // fetch canonical user info
    const user = await authApi.me();
    localStorage.setItem('user', JSON.stringify(user));
    return { token: res.accessToken, user };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (data: RegisterRequest, { rejectWithValue }) => {
  try {
    const res = await authApi.register(data);
    localStorage.setItem('accessToken', res.accessToken);
    localStorage.setItem('refreshToken', res.refreshToken);
    const user = await authApi.me();
    localStorage.setItem('user', JSON.stringify(user));
    return { token: res.accessToken, user };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try { await authApi.logout(); } catch { /* ignore */ }
  localStorage.clear();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
    setUser: (state, action: PayloadAction<UserInfo>) => { state.user = action.payload; },
  },
  extraReducers: (builder) => {
    const pending = (state: AuthState) => { state.loading = true; state.error = null; };
    const rejected = (state: AuthState, action: any) => { state.loading = false; state.error = action.payload as string; };

    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, rejected)
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, rejected)
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
