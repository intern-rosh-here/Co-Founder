import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const getAllFounders = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.industry) params.append('industry', filters.industry);
    if (filters.experience) params.append('experience', filters.experience);
    if (filters.location) params.append('location', filters.location);
    if (filters.skip !== undefined) params.append('skip', filters.skip);
    if (filters.limit !== undefined) params.append('limit', filters.limit);

    console.log('🔍 API Request to /profiles/browse');

    const response = await axios.get(`${API_URL}/profiles/browse`, {
      params: Object.fromEntries(params),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('📦 Response:', response.data);

    // Backend returns: { data: [...], total: ..., count: ... }
    let founders = [];

    if (response.data?.data && Array.isArray(response.data.data)) {
      console.log(`✅ Found ${response.data.data.length} founders`);
      founders = response.data.data;
    } else {
      console.warn('⚠️ No founders array found');
      return [];
    }

    return founders;
  } catch (error) {
    console.error('❌ Error fetching founders:', error.response?.data || error.message);
    return [];
  }
};

export const getFounderById = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await axios.get(`${API_URL}/profiles/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching founder:', error);
    return null;
  }
};