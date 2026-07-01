import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as profileService from '../services/profileService';

export const getMyProfile = createAsyncThunk(
  'profile/getMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileService.getMyProfile();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await profileService.updateProfile(profileData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error');
    }
  }
);

export const uploadProfilePicture = createAsyncThunk(
  'profile/uploadProfilePicture',
  async (file, { rejectWithValue }) => {
    try {
      const response = await profileService.uploadProfilePicture(file);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error');
    }
  }
);

export const searchProfiles = createAsyncThunk(
  'profile/searchProfiles',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await profileService.searchProfiles(filters);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error');
    }
  }
);

const initialState = {
  myProfile: null,
  profiles: [],
  searchResults: [],
  loading: false,
  error: null,
  isProfileComplete: false,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get My Profile
    builder
      .addCase(getMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.myProfile = action.payload.user;
        state.isProfileComplete = action.payload.isProfileComplete;
      })
      .addCase(getMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.myProfile = action.payload.user;
        state.isProfileComplete = action.payload.isProfileComplete;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Upload Profile Picture
    builder
      .addCase(uploadProfilePicture.pending, (state) => {
        state.loading = true;
      })
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        state.loading = false;
        if (state.myProfile) {
          state.myProfile.profileImage = action.payload.profileImage;
        }
      })
      .addCase(uploadProfilePicture.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Search Profiles
    builder
      .addCase(searchProfiles.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchProfiles.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.users;
      })
      .addCase(searchProfiles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = profileSlice.actions;
export default profileSlice.reducer;