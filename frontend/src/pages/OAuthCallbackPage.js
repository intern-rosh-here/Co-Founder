
import React, { useEffect, useState ,useRef} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '../store/authSlice';
import { handleOAuthCallback } from '../services/oauthService';


const OAuthCallbackPage = () => {
  const hasRun = useRef(false);
  const { provider } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
  if (hasRun.current) return;
  hasRun.current = true;
  const savedState = localStorage.getItem(`oauth_state_${provider}`);
  const handleCallback = async () => {
    

    try {
      const callbackProcessed = sessionStorage.getItem('oauth_processed');
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const oauthError = params.get('error');

      console.log('OAuth callback running');
      
      if (callbackProcessed) {
  navigate('/dashboard', { replace: true });
  return;
}

      if (oauthError) {
        throw new Error(`OAuth error: ${oauthError}`);
      }

      if (!code) {
        throw new Error('No authorization code received');
      }

      

      console.log('Provider:', provider);
      console.log('Returned state:', state);
      console.log('Saved state:', savedState);

      // Validate state only if one exists
      if (savedState && state !== savedState) {
        throw new Error('Invalid state parameter');
      }

      // Remove state after validation
      if (savedState) {
        localStorage.removeItem(`oauth_state_${provider}`);
      }

      const result = await handleOAuthCallback(provider, code);

      if (result?.token && result?.user) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));

        dispatch(setAuthUser(result.user));

        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
  console.error('OAuth error:', err);

  const token = localStorage.getItem('token');

  if (token) {
    console.log('User already authenticated, ignoring duplicate OAuth callback');

    navigate('/dashboard', { replace: true });
    return;
  }

  setError(err.response?.data?.message || err.message);
  setLoading(false);
}
  };
  

  handleCallback();
}, [provider, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
      <div className="text-center">
        {loading && (
          <>
            <div className="mb-6">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 border-opacity-75"></div>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Authenticating...</h1>
            <p className="text-gray-400">Please wait while we verify your {provider} account</p>
          </>
        )}

        {error && (
          <>
            <div className="mb-6 text-6xl">❌</div>
            <h1 className="text-3xl font-bold text-red-400 mb-2">Authentication Failed</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 transition"
              >
                Back to Login
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition"
              >
                Go Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallbackPage;