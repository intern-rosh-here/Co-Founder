import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaCamera, FaSpinner, FaCheck } from 'react-icons/fa';
import * as profileService from '../services/profileService';
import { setAuthUser } from '../store/authSlice';

// ─── helpers ────────────────────────────────────────────────────────────────

const skillsToString = (skills) =>
  Array.isArray(skills) ? skills.join(', ') : (skills || '');

const API_URL = 'http://localhost:5000';

const buildFormData = (user = {}) => ({
  firstName: user.firstName || '',
  lastName: user.lastName || '',
  email: user.email || '',
  phone: user.phone || '',
  bio: user.bio || '',
  industry: user.industry || '',
  experience: user.experience || '',
  locationCity: user.location?.city || '',
locationCountry: user.location?.country || '',
  skills: skillsToString(user.skills),

  role: user.role || '',
  previousRoles: user.previousRoles || '',
  startupName: user.startupName || '',
  startupDescription: user.startupDescription || '',
  startupFundingGoal: user.startupFundingGoal || '',
  equityOffering: user.equityOffering || '',

  timezone: user.timezone || 'UTC',

  linkedinProfile: user.linkedinProfile || '',
gitHubProfile: user.gitHubProfile || '',
twitterProfile: user.twitterProfile || '',
website: user.website || '',
});

// ─── component ───────────────────────────────────────────────────────────────

const EditProfilePage = () => {
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { user }  = useSelector((state) => state.auth);

  const [formData,       setFormData]       = useState(() => buildFormData(user));
  const [profileImage,   setProfileImage]   = useState(null);   // File object
const [previewImage, setPreviewImage] = useState(
  user?.profileImage
    ? `${API_URL}${user.profileImage}`
    : null
);
  const [loading,        setLoading]        = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
  const loadProfile = async () => {
    try {
      const response = await profileService.getMyProfile();

      const profile =
        response.profile ||
        response.user ||
        response;

      setFormData(buildFormData(profile));

      if (profile.profileImage) {
        setPreviewImage(profile.profileImage);
      }

      dispatch(setAuthUser(profile));
    } catch (err) {
      console.error(err);
    }
  };

  loadProfile();
}, [dispatch]);


  // Keep form in sync if Redux user changes from outside (e.g. token refresh)
  useEffect(() => {
  if (user) {
    setFormData(buildFormData(user));

    setPreviewImage(
      user.profileImage
        ? `${API_URL}${user.profileImage}`
        : null
    );
  }
}, [user]);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // ── field handlers ──────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5 MB', { autoClose: 3000 });
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file', { autoClose: 3000 });
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
  };

  // ── upload picture (standalone, called inside handleSubmit) ─────────────

  const uploadProfilePicture = async () => {
    if (!profileImage) return;

    setImageUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('profileImage', profileImage);

      const response        = await profileService.uploadProfilePicture(formDataObj);
      const updatedProfile  = response?.profile || response?.user || response;

      if (updatedProfile?.profileImage) {
        dispatch(setAuthUser(updatedProfile));
        setPreviewImage(
          `${API_URL}${updatedProfile.profileImage}`
        );
        setProfileImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        // Server didn't return a new URL — keep local preview, warn user
        toast.info("Picture saved — refresh if you don't see it everywhere", {
          autoClose: 4000,
        });
        setProfileImage(null);
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Upload failed';
      toast.error(`Image upload failed: ${msg}`, { autoClose: 4000 });
      // Don't re-throw — picture upload failure shouldn't block a profile save
    } finally {
      setImageUploading(false);
    }
  };

  // ── submit ──────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      toast.error('First name is required', { autoClose: 3000 });
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email is required', { autoClose: 3000 });
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        ...formData,
        skills: formData.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      // 1. Save text fields
      console.log("UPDATE DATA:", updateData);
      const response       = await profileService.updateProfile(updateData);
      const updatedProfile = response?.profile || response?.user || response;

      if (updatedProfile) {
        dispatch(setAuthUser(updatedProfile));
      }

      // 2. Upload picture if one was selected
      if (profileImage) {
        await uploadProfilePicture();
      }

      toast.success('Profile updated successfully!', {
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Use the id from the (possibly updated) Redux store value, falling back to local
      const userId = updatedProfile?._id || user?._id;
      setTimeout(() => navigate(`/profile/${userId}`), 2500);

    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to update profile';
      toast.error(`Error: ${msg}`, { autoClose: 4000 });
    } finally {
      setLoading(false);
    }
  };

  // ── shared input class ──────────────────────────────────────────────────

  const inputCls =
    'w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2 ' +
    'focus:border-purple-500 focus:outline-none transition placeholder-gray-400';

  const isBusy = loading || imageUploading;

  // ── render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => navigate(`/profile/${user?._id}`)}
            className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition"
          >
            <FaArrowLeft /> Back
          </button>
          <h1 className="text-4xl font-black text-white">Edit Profile</h1>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8">
          <form onSubmit={handleSubmit} noValidate>

            {/* ── Profile Picture ─────────────────────────────────────── */}
            <Section title="Profile Picture">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile preview"
                      className="w-32 h-32 rounded-lg object-cover border-4 border-purple-500"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-lg bg-gray-700 flex items-center justify-center border-4 border-purple-500">
                      <FaCamera className="text-4xl text-gray-400" />
                    </div>
                  )}
                  {profileImage && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full">
                      <FaCheck size={10} />
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block text-gray-300 text-sm mb-2 font-semibold">
                    Upload Picture
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isBusy}
                    className="block w-full text-gray-300 text-sm py-2 px-4 rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none disabled:opacity-50 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 file:cursor-pointer"
                  />
                  <p className="text-gray-400 text-xs mt-2">
                      Max 10 MB · All image formats supported
                  </p>
                  {profileImage && (
                    <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                      <FaCheck size={10} /> Image selected — will be uploaded with profile
                    </p>
                  )}
                </div>
              </div>
            </Section>

            {/* ── Basic Information ───────────────────────────────────── */}
            <Section title="Basic Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="First Name *">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={inputCls}
                    required
                  />
                </Field>
                <Field label="Last Name">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Field label="Email *">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputCls}
                    required
                  />
                </Field>
                <Field label="Phone">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={inputCls}
                  />
                </Field>
              </div>
            </Section>

            {/* ── Professional Information ────────────────────────────── */}
            <Section title="Professional Information">
              <Field label="Bio">
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  maxLength={500}
                  placeholder="Tell us about yourself…"
                  className={inputCls}
                />
                <p className="text-gray-400 text-xs mt-1 text-right">
                  {formData.bio.length} / 500
                </p>
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Field label="Professional Role">
  <select
    name="role"
    value={formData.role}
    onChange={handleInputChange}
    className={inputCls}
  >
    <option value="">Select Role</option>

    <option value="Founder">Founder</option>
    
    <option value="CEO">CEO</option>
    <option value="CTO">CTO</option>
    <option value="CPO">CPO</option>
    <option value="COO">COO</option>
    <option value="CMO">CMO</option>

    <option value="Software Engineer">Software Engineer</option>
    <option value="Full Stack Developer">Full Stack Developer</option>
  

    <option value="UI/UX Designer">UI/UX Designer</option>
    <option value="Product Manager">Product Manager</option>

    <option value="Data Scientist">Data Scientist</option>
    <option value="AI/ML Engineer">AI/ML Engineer</option>
    <option value="DevOps Engineer">DevOps Engineer</option>
    <option value="Cybersecurity Specialist">Cybersecurity Specialist</option>

    <option value="Business Development">Business Development</option>
    <option value="Marketing Specialist">Marketing Specialist</option>
    

    <option value="Operations Manager">Operations Manager</option>
    <option value="Finance Manager">Finance Manager</option>

    

    <option value="Student Founder">Student Founder</option>
  
  </select>
</Field>
                <Field label="Industry">
                  <select name="industry" value={formData.industry} onChange={handleInputChange} className={inputCls}>
                    <option value="">Select Industry</option>
                    {['Technology','Finance','Healthcare','E-commerce','Education','Other'].map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Field label="Experience">
                  <select name="experience" value={formData.experience} onChange={handleInputChange} className={inputCls}>
                    <option value="">Select Experience</option>
                    {['0-2 years','2-5 years','5-10 years','10+ years'].map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Skills (comma-separated)">
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="e.g. React, Node.js, MongoDB"
                    className={inputCls}
                  />
                </Field>
                <Field label="Previously Worked Roles">
  <textarea
    name="previousRoles"
    value={formData.previousRoles}
    onChange={handleInputChange}
    rows={4}
    placeholder="Example:
Software Engineer - Google (2018-2020)
Product Manager - Amazon (2020-2023)"
    className={inputCls}
  />
</Field>
              </div>
            </Section>

            {/* ── Location ────────────────────────────────────────────── */}
            <Section title="Location">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="City">
                  <input
                    type="text"
                    name="locationCity"
                    value={formData.locationCity}
                    onChange={handleInputChange}
                    className={inputCls}
                  />
                </Field>
                <Field label="Country">
                  <input
                    type="text"
                    name="locationCountry"
                    value={formData.locationCountry}
                    onChange={handleInputChange}
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="mt-6">
                <Field label="Timezone">
                  <select name="timezone" value={formData.timezone} onChange={handleInputChange} className={inputCls}>
                    {[
                      'UTC','UTC+1','UTC+2','UTC+3','UTC+4','UTC+5','UTC+5:30',
                      'UTC+6','UTC+7','UTC+8','UTC+9','UTC+10','UTC+11','UTC+12',
                      'UTC-1','UTC-2','UTC-3','UTC-4','UTC-5','UTC-6','UTC-7',
                      'UTC-8','UTC-9','UTC-10','UTC-11','UTC-12',
                    ].map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </Section>

            {/* ── Startup Information ─────────────────────────────────── */}
            <Section title="Startup Information">
              <Field label="Startup Name">
                <input
                  type="text"
                  name="startupName"
                  value={formData.startupName}
                  onChange={handleInputChange}
                  className={inputCls}
                />
              </Field>

              <div className="mt-6">
                <Field label="Startup Description">
                  <textarea
                    name="startupDescription"
                    value={formData.startupDescription}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe your startup…"
                    className={inputCls}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Field label="Ready to invest ($)">
                  <input
                    type="number"
                    name="startupFundingGoal"
                    value={formData.startupFundingGoal}
                    onChange={handleInputChange}
                    min={0}
                    className={inputCls}
                  />
                </Field>
                <Field label="Equity Offering (%)">
                  <input
                    type="number"
                    name="equityOffering"
                    value={formData.equityOffering}
                    onChange={handleInputChange}
                    min={0}
                    max={100}
                    className={inputCls}
                  />
                </Field>
              </div>
            </Section>

            {/* ── Social Links ────────────────────────────────────────── */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Social Links</h2>
              <div className="space-y-6">
                {[
                  { name: 'linkedinProfile', label: 'LinkedIn Profile', placeholder: 'https://linkedin.com/in/...' },
                  { name: 'gitHubProfile', label: 'GitHub Profile', placeholder: 'https://github.com/...' },
                  { name: 'twitterProfile', label: 'Twitter / X', placeholder: 'https://twitter.com/...' },
                  { name: 'website', label: 'Website', placeholder: 'https://yourwebsite.com' }
                  ].map(({ name, label, placeholder }) => (
                  <Field key={name} label={label}>
                    <input
                      type="url"
                      name={name}
                      value={formData[name]}
                      onChange={handleInputChange}
                      placeholder={placeholder}
                      className={inputCls}
                    />
                  </Field>
                ))}
              </div>
            </div>

            {/* ── Action Buttons ──────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={isBusy}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
              >
                {isBusy ? (
                  <><FaSpinner className="animate-spin" /> Saving…</>
                ) : (
                  <><FaCheck size={16} /> Save Changes</>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/profile/${user?._id}`)}
                disabled={isBusy}
                className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

// ─── tiny layout helpers (keep file self-contained) ──────────────────────────

const Section = ({ title, children }) => (
  <div className="mb-8 pb-8 border-b border-white/20">
    <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
    {children}
  </div>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-gray-300 text-sm mb-2">{label}</label>
    {children}
  </div>
);

export default EditProfilePage;