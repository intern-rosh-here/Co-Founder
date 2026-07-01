import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const fetchMatches = createAsyncThunk(
  'match/fetchMatches',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/matches`, {
        params: filters,
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getRecommendations = createAsyncThunk(
  'match/getRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/matches/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const saveProfile = createAsyncThunk(
  'match/saveProfile',
  async (profileId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/matches/save/${profileId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const sendConnection = createAsyncThunk(
  'match/sendConnection',
  async (profileId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/matches/connect/${profileId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const initialState = {
  matches: [],
  recommendations: [],
  savedProfiles: [],
  connections: [],
  loading: false,
  error: null,
};

const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Matches
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Recommendations
    builder
      .addCase(getRecommendations.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.recommendations = action.payload;
      })
      .addCase(getRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Save Profile
    builder
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.savedProfiles.push(action.meta.arg);
      });

    // Send Connection
    builder
      .addCase(sendConnection.fulfilled, (state, action) => {
        state.connections.push(action.payload);
      });
  },
});

export const { clearError } = matchSlice.actions;
export default matchSlice.reducer;
