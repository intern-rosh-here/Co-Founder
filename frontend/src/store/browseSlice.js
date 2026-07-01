import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as browseService from '../services/browseService';

export const getAllFounders = createAsyncThunk(
  'browse/getAllFounders',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await browseService.getAllFounders(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error');
    }
  }
);

const initialState = {
  founders: [],
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  error: null,
  filters: {
    search: '',
    industry: 'all',
    experience: 'all',
    location: 'all',
    startupStage: 'all',
  },
};

const browseSlice = createSlice({
  name: 'browse',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllFounders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllFounders.fulfilled, (state, action) => {
        state.loading = false;
        state.founders = action.payload.founders;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(getAllFounders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, clearFilters, clearError } = browseSlice.actions;
export default browseSlice.reducer;