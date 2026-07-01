
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const axios = require('axios');
console.log('OAUTH CONTROLLER LOADED');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

exports.oauthCallback = async (req, res) => {
  try {
    console.log('OAuth callback received:', req.body);
    
    const { provider, code, redirectUri } = req.body;

    if (!provider || !code) {
      return res.status(400).json({ message: 'Missing provider or code' });
    }

    console.log(`OAuth callback for ${provider}`);

    // Get OAuth tokens from provider
    const tokens = await getOAuthTokens(provider, code, redirectUri);
    
    if (!tokens) {
      console.error(`Failed to get tokens for ${provider}`);
      return res.status(401).json({ message: 'Failed to get OAuth tokens' });
    }

    console.log('Got tokens successfully');

    // Get user info from OAuth provider
    const oauthUser = await getOAuthUserInfo(provider, tokens);
    
    if (!oauthUser) {
      console.error(`Failed to get user info from ${provider}`);
      return res.status(401).json({ message: 'Failed to get user info' });
    }

    console.log('Got user info:', oauthUser);

    // Check if user exists
    let user = await User.findOne({ email: oauthUser.email });

    if (!user) {
      console.log('Creating new user');
      user = new User({
        firstName: oauthUser.firstName || '',
        lastName: oauthUser.lastName || '',
        email: oauthUser.email,
        phone: oauthUser.phone || '',
        password: `oauth_${provider}_${Math.random().toString(36).substr(2, 9)}`,
        profileImage: oauthUser.picture || '',
        isEmailVerified: true,
      });
      await user.save();
      console.log('User created successfully');
    }

    // Check if user is blocked
    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account has been blocked' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    });

    console.log('Token generated successfully');

    res.json({
      token,
      user: user,
      message: 'OAuth login successful',
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};
// Get OAuth Tokens
async function getOAuthTokens(provider, code, redirectUri) {
  try {
    console.log(`Getting ${provider} tokens...`);
    
    const tokenEndpoints = {
      google: 'https://oauth2.googleapis.com/token',
      github: 'https://github.com/login/oauth/access_token',
      linkedin: 'https://www.linkedin.com/oauth/v2/accessToken',
      microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    };

    const tokenEndpoint = tokenEndpoints[provider];
    if (!tokenEndpoint) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    const clientId = process.env[`OAUTH_${provider.toUpperCase()}_CLIENT_ID`];
    const clientSecret = process.env[`OAUTH_${provider.toUpperCase()}_SECRET`];

    if (!clientId || !clientSecret) {
      throw new Error(`Missing ${provider} credentials in .env`);
    }

    console.log(`Exchanging code for ${provider} tokens...`);

    const response = await axios.post(tokenEndpoint, {
      client_id: clientId,
      client_secret: clientSecret,
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    console.log(`Successfully got ${provider} tokens`);
    return response.data;
  } catch (error) {
    console.error(`Error getting ${provider} tokens:`, error.message);
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      console.error(`Response data:`, error.response.data);
    }
    return null;
  }
}

// Get User Info from OAuth Provider
async function getOAuthUserInfo(provider, tokens) {
  try {
    console.log(`Getting ${provider} user info...`);
    
    const userInfoEndpoints = {
      google: 'https://www.googleapis.com/oauth2/v2/userinfo',
      github: 'https://api.github.com/user',
      linkedin: 'https://api.linkedin.com/v2/me',
      microsoft: 'https://graph.microsoft.com/v1.0/me',
    };

    const userInfoEndpoint = userInfoEndpoints[provider];
    if (!userInfoEndpoint) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    const response = await axios.get(userInfoEndpoint, {
  headers: {
    'Authorization': `Bearer ${tokens.access_token}`,
  },
});

// GitHub email fix
if (provider === 'github') {
  const emailResponse = await axios.get(
    'https://api.github.com/user/emails',
    {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
      },
    }
  );

  const primaryEmail =
    emailResponse.data.find(email => email.primary)?.email ||
    emailResponse.data[0]?.email ||
    null;

  response.data.email = primaryEmail;

  console.log('GitHub emails:', emailResponse.data);
}

const normalizedUser = normalizeOAuthUserInfo(provider, response.data);
console.log(`Got ${provider} user info:`, normalizedUser);
return normalizedUser;

    
  } catch (error) {
    console.error(`Error getting user info from ${provider}:`, error.message);
    if (error.response) {
      console.error(`Response status: ${error.response.status}`);
      console.error(`Response data:`, error.response.data);
    }
    return null;
  }
}

// Normalize OAuth User Info
function normalizeOAuthUserInfo(provider, userInfo) {
  switch (provider) {
    case 'google':
      return {
        email: userInfo.email,
        firstName: userInfo.name?.split(' ')[0] || '',
        lastName: userInfo.name?.split(' ')[1] || '',
        picture: userInfo.picture,
      };

    case 'github':
      return {
        email: userInfo.email,
        firstName: userInfo.name?.split(' ')[0] || userInfo.login || '',
        lastName: userInfo.name?.split(' ')[1] || '',
        picture: userInfo.avatar_url,
      };

    case 'linkedin':
      return {
        email: userInfo.email,
        firstName: userInfo.localizedFirstName || '',
        lastName: userInfo.localizedLastName || '',
      };

    case 'microsoft':
      return {
        email: userInfo.mail || userInfo.userPrincipalName,
        firstName: userInfo.givenName || '',
        lastName: userInfo.surname || '',
      };

    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}


// Link OAuth Account
exports.linkOAuthAccount = async (req, res) => {
  try {
    const { provider, code, redirectUri } = req.body;
    const userId = req.userId;

    const tokens = await getOAuthTokens(provider, code, redirectUri);
    const oauthUser = await getOAuthUserInfo(provider, tokens);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `${provider} account linked`,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error('Link OAuth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unlink OAuth Account
exports.unlinkOAuthAccount = async (req, res) => {
  try {
    const { provider } = req.params;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `${provider} account unlinked`,
    });
  } catch (error) {
    console.error('Unlink OAuth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};