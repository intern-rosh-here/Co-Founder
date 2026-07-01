import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  FaArrowLeft,
  FaBell,
  FaLock,
  FaEye,
  FaTrash,
  FaSpinner,
  FaCheck,
} from 'react-icons/fa';
import settingsService from '../services/settingsService';
import { logout } from '../store/authSlice';

const SettingsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Tab state
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);

  // Account settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    matchNotifications: true,
    messageNotifications: true,
    marketingEmails: false,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public', // public, private, hidden
    showLocation: true,
    allowMessages: true,
    allowMatches: true,
  });

  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await settingsService.getSettings();
      
      if (settings.notifications) {
        setNotifications(settings.notifications);
      }
      if (settings.privacy) {
        setPrivacy(settings.privacy);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ACCOUNT SETTINGS
  // ============================================
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please fill in all password fields', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      await settingsService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      toast.success('✅ Password changed successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('❌ Failed to change password: ' + error.message, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // NOTIFICATION SETTINGS
  // ============================================
  const handleNotificationToggle = (key) => {
    setNotifications({
      ...notifications,
      [key]: !notifications[key],
    });
  };

  const saveNotificationSettings = async () => {
    try {
      setLoading(true);
      await settingsService.updateNotificationPreferences(notifications);

      toast.success('✅ Notification preferences updated!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('❌ Failed to update notifications: ' + error.message, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // PRIVACY SETTINGS
  // ============================================
  const handlePrivacyToggle = (key) => {
    setPrivacy({
      ...privacy,
      [key]: !privacy[key],
    });
  };

  const handlePrivacySelect = (key, value) => {
    setPrivacy({
      ...privacy,
      [key]: value,
    });
  };

  const savePrivacySettings = async () => {
    try {
      setLoading(true);
      await settingsService.updatePrivacySettings(privacy);

      toast.success('✅ Privacy settings updated!', {
        position: 'top-right',
        autoClose: 3000,
      });
    } catch (error) {
      toast.error('❌ Failed to update privacy settings: ' + error.message, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // DELETE ACCOUNT
  // ============================================
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    if (!deletePassword) {
      toast.error('Please enter your password', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      await settingsService.deleteAccount(deletePassword);

      toast.success('✅ Account deleted successfully', {
        position: 'top-right',
        autoClose: 3000,
      });

      // Logout and redirect
      setTimeout(() => {
        dispatch(logout());
        navigate('/');
      }, 2000);
    } catch (error) {
      toast.error('❌ Failed to delete account: ' + error.message, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully', {
      position: 'top-right',
      autoClose: 3000,
    });
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition"
        >
          <FaArrowLeft /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-black text-white mb-2">Settings</h1>
          <p className="text-gray-300">Manage your account and preferences</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {[
            { id: 'account', label: 'Account', icon: FaLock },
            { id: 'notifications', label: 'Notifications', icon: FaBell },
            { id: 'privacy', label: 'Privacy', icon: FaEye },
            { id: 'danger', label: 'Danger Zone', icon: FaTrash },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <Icon /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8">
          
          {/* Account Settings */}
          {activeTab === 'account' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
              
              {/* User Info */}
              <div className="mb-8 pb-8 border-b border-white/20">
                <h3 className="text-lg font-semibold text-white mb-4">Account Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white font-semibold">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="text-white font-semibold">
                      {user?.firstName} {user?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Member Since</p>
                    <p className="text-white font-semibold">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 focus:border-purple-500 focus:outline-none"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" /> Updating...
                      </>
                    ) : (
                      <>
                        <FaCheck /> Change Password
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Logout */}
              <div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
              
              <div className="space-y-4 mb-8">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email updates' },
                  { key: 'matchNotifications', label: 'Match Notifications', desc: 'Get notified about new matches' },
                  { key: 'messageNotifications', label: 'Message Notifications', desc: 'Get notified about new messages' },
                  { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive promotional content' },
                ].map((setting) => (
                  <div
                    key={setting.key}
                    className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg border border-gray-600"
                  >
                    <div>
                      <p className="text-white font-semibold">{setting.label}</p>
                      <p className="text-gray-400 text-sm">{setting.desc}</p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(setting.key)}
                      className={`w-14 h-8 rounded-full transition flex items-center ${
                        notifications[setting.key]
                          ? 'bg-green-600'
                          : 'bg-gray-500'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white transition transform ${
                          notifications[setting.key] ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={saveNotificationSettings}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <FaCheck /> Save Preferences
                  </>
                )}
              </button>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Privacy Settings</h2>
              
              <div className="space-y-6 mb-8">
                {/* Profile Visibility */}
                <div>
                  <p className="text-white font-semibold mb-3">Profile Visibility</p>
                  <div className="space-y-2">
                    {[
                      { value: 'public', label: 'Public - Everyone can see your profile' },
                      { value: 'private', label: 'Private - Only connections can see' },
                      { value: 'hidden', label: 'Hidden - Profile is completely hidden' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value={option.value}
                          checked={privacy.profileVisibility === option.value}
                          onChange={(e) => handlePrivacySelect('profileVisibility', e.target.value)}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-300">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Toggle Options */}
                {[
                  { key: 'showLocation', label: 'Show Location', desc: 'Let others see your location' },
                  { key: 'allowMessages', label: 'Allow Messages', desc: 'Allow others to message you' },
                  { key: 'allowMatches', label: 'Allow Matches', desc: 'Allow others to match with you' },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                    <div>
                      <p className="text-white font-semibold">{setting.label}</p>
                      <p className="text-gray-400 text-sm">{setting.desc}</p>
                    </div>
                    <button
                      onClick={() => handlePrivacyToggle(setting.key)}
                      className={`w-14 h-8 rounded-full transition flex items-center ${
                        privacy[setting.key]
                          ? 'bg-green-600'
                          : 'bg-gray-500'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full bg-white transition transform ${
                          privacy[setting.key] ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={savePrivacySettings}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <FaCheck /> Save Settings
                  </>
                )}
              </button>
            </div>
          )}

          {/* Danger Zone */}
          {activeTab === 'danger' && (
            <div>
              <h2 className="text-2xl font-bold text-red-500 mb-6">Danger Zone</h2>
              
              <div className="bg-red-600/20 border border-red-600/50 rounded-xl p-8 mb-8">
                <h3 className="text-lg font-bold text-red-400 mb-4">Delete Account</h3>
                <p className="text-gray-300 mb-6">
                  Deleting your account is permanent and cannot be undone. All your data will be deleted.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Type "DELETE" to confirm:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="Type DELETE"
                      className="w-full bg-gray-700 border border-red-600 text-white rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 text-sm mb-2">
                      Enter your password:
                    </label>
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full bg-gray-700 border border-red-600 text-white rounded-lg px-4 py-2 focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading || deleteConfirm !== 'DELETE' || !deletePassword}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <FaSpinner className="animate-spin" /> Deleting...
                      </>
                    ) : (
                      <>
                        <FaTrash /> Delete Account Permanently
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;