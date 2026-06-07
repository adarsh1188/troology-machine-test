import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axios';

const tokenFromStorage = localStorage.getItem('token') || null;

export const login = createAsyncThunk('auth/login', async (creds, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', creds);
    localStorage.setItem('token', data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const signup = createAsyncThunk('auth/signup', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/signup', payload);
    localStorage.setItem('token', data.token);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Signup failed');
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Session expired');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: tokenFromStorage,
    status: 'idle',
    error: null,
    bootstrapped: false, // whether the initial fetchMe completed
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
    setUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.user = a.payload.user;
        s.token = a.payload.token;
      })
      .addCase(login.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload;
      })
      .addCase(signup.fulfilled, (s, a) => {
        s.user = a.payload.user;
        s.token = a.payload.token;
      })
      .addCase(signup.rejected, (s, a) => {
        s.error = a.payload;
      })
      .addCase(fetchMe.fulfilled, (s, a) => {
        s.user = a.payload;
        s.bootstrapped = true;
      })
      .addCase(fetchMe.rejected, (s) => {
        s.user = null;
        s.token = null;
        s.bootstrapped = true;
        localStorage.removeItem('token');
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
