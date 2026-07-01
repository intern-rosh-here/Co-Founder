import api from './api';

// Initiate OAuth Login
export const initiateOAuthLogin = (provider) => {
  const clientId = {
    google: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID,
    github: process.env.REACT_APP_GITHUB_CLIENT_ID,
    linkedin: process.env.REACT_APP_LINKEDIN_CLIENT_ID,
    microsoft: process.env.REACT_APP_MICROSOFT_CLIENT_ID,
  }[provider];

  if (!clientId) {
    alert(`${provider} OAuth not configured. Check .env.local`);
    return;
  }

  const redirectUri = `${window.location.origin}/auth/callback/${provider}`;
  const state = generateRandomString(32);
  
  localStorage.setItem(`oauth_state_${provider}`, state);

  const authUrls = {
    google: 'https://accounts.google.com/o/oauth2/v2/auth',
    github: 'https://github.com/login/oauth/authorize',
    linkedin: 'https://www.linkedin.com/oauth/v2/authorization',
    microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  };

  const scopes = {
    google: 'openid profile email',
    github: 'user:email',
    linkedin: 'r_liteprofile r_emailaddress',
    microsoft: 'openid profile email',
  };

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: scopes[provider],
    state: state,
  });

  // Provider-specific params
  if (provider === 'google') {
    params.append('access_type', 'offline');
    params.append('prompt', 'consent');
  }

  window.location.href = `${authUrls[provider]}?${params.toString()}`;
};

// Handle OAuth Callback
export const handleOAuthCallback = async (provider, code) => {
  try {
    const response = await api.post('/auth/oauth/callback', {
      provider,
      code,
      redirectUri: `${window.location.origin}/auth/callback/${provider}`,
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    throw error;
  }
};

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export default {
  initiateOAuthLogin,
  handleOAuthCallback,
};