import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../store/authSlice';
import { FaEnvelope, FaLock, FaGoogle, FaGithub, FaLinkedin, FaMicrosoft, FaDiscord, FaApple, FaEye, FaEyeSlash } from 'react-icons/fa';
import { initiateOAuthLogin } from '../services/oauthService';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (result.payload?.token) {
      navigate('/dashboard');
    }
    
  };

  const handleOAuthLogin = (provider) => {
  // Import this at top: import { initiateOAuthLogin } from '../services/oauthService';
  initiateOAuthLogin(provider);
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-xl mb-4">
              <span className="text-white text-3xl font-black">Cofounder Matches</span>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
            <p className="text-gray-300">Sign in to your Cofounder Matches account</p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
              <p className="font-semibold">❌ {error}</p>
            </div>
          )}

          {/* Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mb-8">
            {/* Email */}
            <div>
              <label className="block text-gray-200 font-semibold mb-2 text-sm">
                Email Address
              </label>
              <div className="flex items-center bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus-within:border-purple-500 transition group">
                <FaEnvelope className="text-gray-400 group-focus-within:text-purple-400 transition" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="flex-1 outline-none bg-transparent text-white placeholder-gray-500 ml-3"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-200 font-semibold text-sm">Password</label>
                <Link to="#" className="text-purple-400 hover:text-purple-300 text-sm font-semibold transition">
                  Forgot?
                </Link>
              </div>
              <div className="flex items-center bg-white/10 border border-white/20 rounded-xl px-4 py-3 focus-within:border-purple-500 transition group">
                <FaLock className="text-gray-400 group-focus-within:text-purple-400 transition" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="flex-1 outline-none bg-transparent text-white placeholder-gray-500 ml-3"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-300 transition"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-purple-600 cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 text-gray-300 text-sm cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-2xl hover:from-purple-500 hover:to-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span> Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px bg-white/20 flex-1"></div>
            <span className="text-gray-400 text-sm font-semibold">OR CONTINUE WITH</span>
            <div className="h-px bg-white/20 flex-1"></div>
          </div>

          {/* OAuth Options */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 group"
            >
              <FaGoogle className="text-red-400 group-hover:scale-110 transition" />
              <span className="hidden sm:inline text-sm">Google</span>
            </button>

            {/* GitHub */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 group"
            >
              <FaGithub className="text-gray-300 group-hover:scale-110 transition" />
              <span className="hidden sm:inline text-sm">GitHub</span>
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('linkedin')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 group"
            >
              <FaLinkedin className="text-blue-400 group-hover:scale-110 transition" />
              <span className="hidden sm:inline text-sm">LinkedIn</span>
            </button>

            {/* Microsoft */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('microsoft')}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2 group"
            >
              <FaMicrosoft className="text-blue-500 group-hover:scale-110 transition" />
              <span className="hidden sm:inline text-sm">Microsoft</span>
            </button>
          </div>

          {/* Additional OAuth Options (Hidden by default, expandable) */}
          <details className="mb-8">
            <summary className="text-gray-400 text-sm font-semibold cursor-pointer hover:text-gray-300 transition">
              More sign-in options →
            </summary>
            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/10">
              {/* Discord */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('discord')}
                className="bg-white/5 hover:bg-white/15 border border-white/10 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 group text-sm"
              >
                <FaDiscord className="text-purple-400 group-hover:scale-110 transition" />
                Discord
              </button>

              {/* Apple */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('apple')}
                className="bg-white/5 hover:bg-white/15 border border-white/10 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 group text-sm"
              >
                <FaApple className="text-gray-300 group-hover:scale-110 transition" />
                Apple
              </button>
            </div>
          </details>

          {/* Sign Up Link */}
          <div className="text-center border-t border-white/20 pt-6">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-purple-400 font-bold hover:text-purple-300 transition">
                Sign up for free
              </Link>
            </p>
          </div>

          {/* Security Note */}
          <div className="mt-6 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-xs text-center flex items-center justify-center gap-2">
              <span>🔒</span> Your credentials are encrypted and secure
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl">
          <p className="text-gray-400 text-xs text-center mb-2">Demo Credentials (Development Only)</p>
          <p className="text-gray-500 text-xs text-center">Email: demo@example.com | Password: demo123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;