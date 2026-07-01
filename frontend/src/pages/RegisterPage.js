import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../store/authSlice';
import { FcGoogle } from "react-icons/fc";
import { initiateOAuthLogin } from '../services/oauthService';
import { 
  FaEnvelope, FaLock, FaUser, FaPhone, FaGoogle, FaGithub, 
  FaLinkedin, FaMicrosoft, FaEye, FaEyeSlash, FaCheck, FaTimes, FaArrowRight 
} from 'react-icons/fa';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  // Password Strength Checker
  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[!@#$%^&*]/.test(pwd)) strength++;
    setPasswordStrength(strength);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'password') {
      checkPasswordStrength(value);
    }

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.includes('@')) errors.email = 'Valid email is required';
    if (formData.phone.length < 10) errors.phone = 'Valid phone number is required';
    if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!acceptTerms) errors.terms = 'You must accept the terms and conditions';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await dispatch(
      register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      })
    );

    if (result.payload?.token) {
      navigate('/dashboard');
    }
  };

  const handleOAuthSignup = (provider) => {
  initiateOAuthLogin(provider);
};

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 md:p-0 py-10 md:py-0">
      <div className="w-full max-w-md lg:max-w-6xl lg:flex lg:gap-0 lg:flex-row-reverse">
        
        {/* Left Side - Benefits (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-b from-blue-600 to-blue-600 rounded-l-2xl p-12 flex-col justify-between relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/20 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-400/20 rounded-full -ml-20 -mb-20"></div>

          <div className="relative z-10">
            <h2 className="text-4xl font-black text-white mb-6">Join Now</h2>
            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
              Start your journey to find the perfect co-founder. Connect with entrepreneurs who share your vision and build something amazing together.
            </p>

            {/* Benefits List */}
            <div className="space-y-4">
              {[
                { icon: '⚡', text: 'Instant Profile Creation' },
                { icon: '🎯', text: 'Smart Matching Algorithm' },
                { icon: '💬', text: 'Direct Messaging' },
                { icon: '🔒', text: 'Verified & Secure' },
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 text-blue-100">
                  <span className="text-2xl">{benefit.icon}</span>
                  <span className="font-semibold">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof */}
          <div className="relative z-10 pt-8 border-t border-blue-400/30">
            <p className="text-blue-200 text-sm mb-4">Trusted by founders from</p>
            <div className="flex gap-3 text-blue-100 text-sm font-semibold">
              <span>🇺🇸 USA</span>
              <span>🇬🇧 UK</span>
              <span>🇮🇳 India</span>
              <span>🇨🇦 Canada</span>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full lg:w-1/2 bg-white lg:rounded-r-2xl rounded-2xl shadow-2xl p-6 md:p-10 lg:p-12">
          
          {/* Mobile Header */}
          <div className="lg:hidden mb-8">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Join thousands of entrepreneurs building their dreams</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-gray-600">Join our community of innovative founders</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-700 font-semibold text-sm">Error: {error}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            
            {/* Name Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-gray-800 font-semibold text-sm mb-2">First Name</label>
                <div className={`flex items-center border-2 rounded-xl px-4 py-3 transition-all duration-300 ${
                  focusedField === 'firstName' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}>
                  <FaUser className={`transition-colors duration-300 ${
                    focusedField === 'firstName' ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="John"
                    className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-500 ml-3 text-base"
                    required
                  />
                </div>
                {validationErrors.firstName && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <FaTimes className="text-xs" /> {validationErrors.firstName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-gray-800 font-semibold text-sm mb-2">Last Name</label>
                <div className={`flex items-center border-2 rounded-xl px-4 py-3 transition-all duration-300 ${
                  focusedField === 'lastName' 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}>
                  <FaUser className={`transition-colors duration-300 ${
                    focusedField === 'lastName' ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('lastName')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Doe"
                    className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-500 ml-3 text-base"
                    required
                  />
                </div>
                {validationErrors.lastName && (
                  <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                    <FaTimes className="text-xs" /> {validationErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-2">Email Address</label>
              <div className={`flex items-center border-2 rounded-xl px-4 py-3 transition-all duration-300 ${
                focusedField === 'email' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}>
                <FaEnvelope className={`transition-colors duration-300 ${
                  focusedField === 'email' ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-500 ml-3 text-base"
                  required
                />
              </div>
              {validationErrors.email && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <FaTimes className="text-xs" /> {validationErrors.email}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-2">Phone Number</label>
              <div className={`flex items-center border-2 rounded-xl px-4 py-3 transition-all duration-300 ${
                focusedField === 'phone' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}>
                <FaPhone className={`transition-colors duration-300 ${
                  focusedField === 'phone' ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="+1 (555) 123-4567"
                  className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-500 ml-3 text-base"
                  required
                />
              </div>
              {validationErrors.phone && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <FaTimes className="text-xs" /> {validationErrors.phone}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-2">Password</label>
              <div className={`flex items-center border-2 rounded-xl px-4 py-3 transition-all duration-300 ${
                focusedField === 'password' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}>
                <FaLock className={`transition-colors duration-300 ${
                  focusedField === 'password' ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-500 ml-3 text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* Password Strength */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600 font-semibold">Password Strength</span>
                    <span className={`text-xs font-bold ${
                      passwordStrength <= 1 ? 'text-red-600' :
                      passwordStrength <= 2 ? 'text-orange-600' :
                      passwordStrength <= 3 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {validationErrors.password && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <FaTimes className="text-xs" /> {validationErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-2">Confirm Password</label>
              <div className={`flex items-center border-2 rounded-xl px-4 py-3 transition-all duration-300 ${
                focusedField === 'confirmPassword' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}>
                <FaLock className={`transition-colors duration-300 ${
                  focusedField === 'confirmPassword' ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('confirmPassword')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  className="flex-1 outline-none bg-transparent text-gray-800 placeholder-gray-500 ml-3 text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <FaTimes className="text-xs" /> {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (e.target.checked) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      terms: '',
                    }));
                  }
                }}
                className="w-4 h-4 rounded border-2 border-gray-300 text-purple-600 mt-1 cursor-pointer"
              />
              <label htmlFor="terms" className="ml-3 text-gray-700 text-sm cursor-pointer">
                I agree to the{' '}
                <Link to="#" className="text-purple-600 font-semibold hover:text-purple-700 transition">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="#" className="text-purple-600 font-semibold hover:text-purple-700 transition">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {validationErrors.terms && (
              <p className="text-red-600 text-xs flex items-center gap-1">
                <FaTimes className="text-xs" /> {validationErrors.terms}
              </p>
            )}

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 md:py-4 rounded-xl hover:shadow-lg hover:from-purple-500 hover:to-blue-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base md:text-lg mt-8"
            >
              {loading ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <FaArrowRight className="text-lg" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="text-gray-500 font-semibold text-sm">OR SIGN UP WITH</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          {/* OAuth Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              { provider: 'google', icon: FaGoogle, label: 'Google'  },
              { provider: 'github', icon: FaGithub, label: 'GitHub', color: 'text-gray-700' },
              { provider: 'linkedin', icon: FaLinkedin, label: 'LinkedIn', color: 'text-blue-600' },
              { provider: 'microsoft', icon: FaMicrosoft, label: 'Microsoft', color: 'text-blue-500' },
            ].map(({ provider, icon: Icon, label, color }) => (
              <button
                key={provider}
                type="button"
                onClick={() => handleOAuthSignup(provider)}
                className="bg-gray-50 hover:bg-gray-100 border-2 border-gray-200 hover:border-purple-300 text-gray-700 font-semibold py-2.5 md:py-3 rounded-xl transition-all duration-300 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 group"
                title={`Sign up with ${label}`}
              >
                
                <Icon className={`text-lg md:text-xl ${color || ''} group-hover:scale-110 transition`} />
                <span className="text-xs md:text-sm hidden md:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Sign In Link */}
          <div className="text-center border-t border-gray-200 pt-6">
            <p className="text-gray-700 text-sm md:text-base">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-600 font-bold hover:text-purple-700 transition">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;