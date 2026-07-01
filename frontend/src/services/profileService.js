import api from './api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Cache for profile data to reduce API calls
const profileCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Logger for profile updates
const logProfileUpdate = (userId, action, details = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[Profile Update] ${timestamp} - User: ${userId}, Action: ${action}`, details);
  
  // Optional: Send to backend analytics
  // trackProfileUpdate(userId, action, timestamp, details);
};

// Helper function to fix and optimize image URLs
const fixImageURL = (data, userAuthData = null) => {
  if (!data) return data;

  // Fix single profile
  if (data.profile) {
    data.profile = fixProfileImage(data.profile, userAuthData);
  }

  // Fix array of profiles
  if (data.profiles && Array.isArray(data.profiles)) {
    data.profiles = data.profiles.map(profile => 
      fixProfileImage(profile, userAuthData)
    );
  }

  return data;
};

// Helper to fix individual profile image
const fixProfileImage = (profile, userAuthData = null) => {
  if (!profile) return profile;

  // If profile has uploaded image, use it
  if (profile.profileImage && profile.profileImage.trim()) {
    // Convert relative path to absolute URL
    if (!profile.profileImage.startsWith('http')) {
      profile.profileImage = API_BASE_URL + profile.profileImage;
    }
  } 
  // Fallback to Google/OAuth profile picture
  else if (profile.googleProfilePicture && profile.googleProfilePicture.trim()) {
    profile.profileImage = profile.googleProfilePicture;
  } 
  // Or use from auth data if available
  else if (userAuthData?.picture) {
    profile.profileImage = userAuthData.picture;
  } 
  // Last resort: use placeholder
  else {
    profile.profileImage = null; // Will show default avatar
  }

  return profile;
};

// Check cache
const getCachedProfile = (key) => {
  const cached = profileCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  profileCache.delete(key);
  return null;
};

// Set cache
const setCacheProfile = (key, data) => {
  profileCache.set(key, {
    data,
    timestamp: Date.now(),
  });
};

// Get my profile with caching
export const getMyProfile = async (userAuthData = null) => {
  try {
    // Check cache first
    const cached = getCachedProfile('myProfile');
    if (cached) {
      return fixImageURL(JSON.parse(JSON.stringify(cached)), userAuthData);
    }

    const response = await api.get('/profiles/me');
    const fixedData = fixImageURL(response.data, userAuthData);

    // Cache the result
    setCacheProfile('myProfile', fixedData);

    return fixedData;
  } catch (error) {
    console.error('Error getting my profile:', error);
    throw error;
  }
};

// Get public profile with caching
export const getPublicProfile = async (userId, userAuthData = null) => {
  try {
    // Check cache
    const cacheKey = `profile_${userId}`;
    const cached = getCachedProfile(cacheKey);
    if (cached) {
      return fixImageURL(JSON.parse(JSON.stringify(cached)), userAuthData);
    }

    const response = await api.get(`/profiles/${userId}`);
    const fixedData = fixImageURL(response.data, userAuthData);

    // Cache the result
    setCacheProfile(cacheKey, fixedData);

    return fixedData;
  } catch (error) {
    console.error('Error getting public profile:', error);
    throw error;
  }
};

// Update profile information with tracking
export const updateProfile = async (profileData, userAuthData = null) => {
  try {
    // Track what's being updated
    const updateKeys = Object.keys(profileData).filter(
      key => profileData[key] !== undefined && profileData[key] !== null
    );
    logProfileUpdate('current_user', 'UPDATE_PROFILE', { fields: updateKeys });

    // Ensure skills is an array
    const data = {
      ...profileData,
      skills: Array.isArray(profileData.skills)
        ? profileData.skills
        : profileData.skills?.split(',').map(s => s.trim()).filter(s => s) || [],
      updatedAt: new Date().toISOString(), // Add timestamp
    };

    const response = await api.put('/profiles/me', data);
    const fixedData = fixImageURL(response.data, userAuthData);

    // Clear cache after update
    profileCache.delete('myProfile');

    // Log successful update
    logProfileUpdate('current_user', 'UPDATE_SUCCESS', {
      timestamp: new Date().toISOString(),
      fieldsUpdated: updateKeys.length,
    });

    return fixedData;
  } catch (error) {
    logProfileUpdate('current_user', 'UPDATE_FAILED', { error: error.message });
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Upload profile picture with validation
export const uploadProfilePicture = async (formData, userAuthData = null) => {
  try {
    // Validate file
    let fileData = formData;

    if (formData instanceof File) {
      // Validate file size (max 5MB)
      if (formData.size > 5 * 1024 * 1024) {
        throw new Error('File size exceeds 5MB limit');
      }

      // Validate file type
      if (!formData.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      fileData = new FormData();
      fileData.append('profileImage', formData);

      logProfileUpdate('current_user', 'UPLOAD_PICTURE_START', {
        fileName: formData.name,
        fileSize: formData.size,
        fileType: formData.type,
      });
    }

    const response = await api.post('/profiles/me/avatar', fileData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const fixedData = fixImageURL(response.data, userAuthData);

    // Clear cache after picture upload
    profileCache.delete('myProfile');

    // Log successful upload
    logProfileUpdate('current_user', 'PICTURE_UPLOADED', {
      timestamp: new Date().toISOString(),
      imageUrl: fixedData.profile?.profileImage || fixedData.profileImage,
    });

    return fixedData;
  } catch (error) {
    logProfileUpdate('current_user', 'PICTURE_UPLOAD_FAILED', { error: error.message });
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

// Search profiles with caching
export const searchProfiles = async (filters, userAuthData = null) => {
  try {
    // Create cache key from filters
    const cacheKey = `search_${JSON.stringify(filters)}`;
    const cached = getCachedProfile(cacheKey);
    if (cached) {
      return fixImageURL(JSON.parse(JSON.stringify(cached)), userAuthData);
    }

    const response = await api.get('/profiles', { params: filters });
    const fixedData = fixImageURL(response.data, userAuthData);

    // Cache search results
    setCacheProfile(cacheKey, fixedData);

    logProfileUpdate('current_user', 'SEARCH_PROFILES', {
      filters,
      resultsCount: fixedData.profiles?.length || 0,
    });

    return fixedData;
  } catch (error) {
    console.error('Error searching profiles:', error);
    throw error;
  }
};

// Delete profile with tracking
export const deleteProfile = async () => {
  try {
    logProfileUpdate('current_user', 'DELETE_PROFILE_START');

    const response = await api.delete('/profiles/me');

    // Clear all cache
    profileCache.clear();

    logProfileUpdate('current_user', 'PROFILE_DELETED', {
      timestamp: new Date().toISOString(),
    });

    return response.data;
  } catch (error) {
    logProfileUpdate('current_user', 'DELETE_FAILED', { error: error.message });
    console.error('Error deleting profile:', error);
    throw error;
  }
};

// Clear cache manually
export const clearProfileCache = () => {
  profileCache.clear();
  console.log('Profile cache cleared');
};

// Get cache stats
export const getCacheStats = () => {
  return {
    cacheSize: profileCache.size,
    cachedKeys: Array.from(profileCache.keys()),
    cacheDuration: `${CACHE_DURATION / 1000}s`,
  };
};

// Batch update multiple profile fields
export const batchUpdateProfile = async (updates, userAuthData = null) => {
  try {
    const batchUpdates = Array.isArray(updates) ? updates : [updates];

    logProfileUpdate('current_user', 'BATCH_UPDATE_START', {
      updateCount: batchUpdates.length,
    });

    const promises = batchUpdates.map(update =>
      updateProfile(update, userAuthData)
    );

    const results = await Promise.all(promises);

    logProfileUpdate('current_user', 'BATCH_UPDATE_SUCCESS', {
      successCount: results.length,
    });

    return results;
  } catch (error) {
    logProfileUpdate('current_user', 'BATCH_UPDATE_FAILED', { error: error.message });
    console.error('Error in batch update:', error);
    throw error;
  }
};

export default {
  getMyProfile,
  getPublicProfile,
  updateProfile,
  uploadProfilePicture,
  searchProfiles,
  deleteProfile,
  clearProfileCache,
  getCacheStats,
  batchUpdateProfile,
};