import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaUsers, FaRocket, FaShieldAlt, FaMedal, FaArrowDown, FaPlay } from 'react-icons/fa';

const HomePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [scrolled, setScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full">
      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            className="w-full h-full object-cover"
           
          >
            <source
              src="https://videos.pexels.com/video-files/6914394/6914394-hd_1920_1080_25fps.mp4"
              type="video/mp4"
            />
            <source
              src="https://www.pexels.com/video-files/6914394/6914394-hd_1920_1080_25fps.web"
              type="video/webm"
            />
          </video>
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <div className="mb-6 inline-block">
            <div className="bg-purple-500/30 backdrop-blur-md px-6 py-2 rounded-full border border-purple-400/50">
              <p className="text-purple-100 font-semibold"> Welcome to Cofounder Matches</p>
            </div>
          </div>

          <h1 className="text-6xl md:text-7xl font-black mb-6 text-white leading-tight">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-purple-600 to-blue-400 bg-clip-text text-transparent">
              Co-founder
            </span>
          </h1>

          <p className="text-xl md:text-2xl mb-12 text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Connect with talented entrepreneurs who share your vision. Build the next unicorn together. 
            <br />
            <span className="text-purple-300 font-semibold">Your perfect business partner is waiting.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-lg font-bold text-lg hover:shadow-2xl hover:scale-105 transition transform inline-block"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-lg font-bold text-lg hover:shadow-2xl hover:scale-105 transition transform inline-block flex items-center gap-2 justify-center"
                >
                  <FaRocket /> Get Started Now
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-white/10 backdrop-blur-sm transition inline-block"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Scroll Indicator */}
          <div className={`flex justify-center transition-opacity duration-500 ${scrolled ? 'opacity-0' : 'opacity-100'}`}>
            <div className="animate-bounce">
              <FaArrowDown className="text-white text-2xl" />
            </div>
          </div>
        </div>
      </section>

      
      {/* Features Section */}
      <section className="py-24 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-white mb-4">
              Why Choose Cofounder Matches?
            </h2>
            <p className="text-xl text-gray-400">Everything you need to find your perfect business partner</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-900/20 border border-purple-500/30 p-5 h-60 rounded-2xl hover:border-purple-500/60 transition group cursor-pointer">

  <div className="bg-purple-500/20 p-3 rounded-xl w-fit mb-4 group-hover:bg-purple-500/40 transition">
    <FaUsers className="text-purple-300 text-2xl" />
  </div>

  <h3 className="text-xl font-bold text-white mb-2">
    Smart Matching
  </h3>

  <p className="text-gray-400 text-sm">
    AI-powered algorithm finds co-founders with complementary skills and shared vision.
  </p>

</div>

           <div className="bg-gradient-to-br from-blue-900/50 to-blue-900/20 border border-blue-500/30 p-5 h-60 rounded-2xl hover:border-blue-500/60 transition group cursor-pointer">

  <div className="bg-blue-500/20 p-3 rounded-xl w-fit mb-4 group-hover:bg-blue-500/40 transition">
    <FaShieldAlt className="text-blue-300 text-2xl" />
  </div>

  <h3 className="text-xl font-bold text-white mb-2">
    Verified Profiles
  </h3>

  <p className="text-gray-400 text-sm">
    All founders are verified with background checks and identity verification.
  </p>

</div>

            {/* Feature 3 */}
           <div className="bg-gradient-to-br from-green-900/50 to-green-900/20 border border-green-500/30 p-5 h-60 rounded-2xl hover:border-green-500/60 transition group cursor-pointer">

  <div className="bg-green-500/20 p-3 rounded-xl w-fit mb-4 group-hover:bg-green-500/40 transition">
    <FaRocket className="text-green-300 text-2xl" />
  </div>

  <h3 className="text-xl font-bold text-white mb-2">
    Startup Tools
  </h3>

  <p className="text-gray-400 text-sm">
    Access resources, templates, and tools to accelerate your startup journey.
  </p>

</div>

            {/* Feature 4 */}
            {/* Feature 4 */}
<div className="bg-gradient-to-br from-yellow-900/50 to-yellow-900/20 border border-yellow-500/30 p-5 h-60 rounded-2xl hover:border-yellow-500/60 transition group cursor-pointer">

  <div className="bg-yellow-500/20 p-3 rounded-xl w-fit mb-4 group-hover:bg-yellow-500/40 transition">
    <FaMedal className="text-yellow-300 text-2xl" />
  </div>

  <h3 className="text-xl font-bold text-white mb-2">
    Success Stories
  </h3>

  <p className="text-gray-400 text-sm">
    Join a community of successful entrepreneurs who found their perfect match.
  </p>

</div>
</div>
</div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="text-5xl font-black text-white mb-2">10,000+</h3>
              <p className="text-purple-100 text-lg">Active Founders</p>
            </div>
            <div>
              <h3 className="text-5xl font-black text-white mb-2">500+</h3>
              <p className="text-purple-100 text-lg">Successful Partnerships</p>
            </div>
            <div>
              <h3 className="text-5xl font-black text-white mb-2">$500M+</h3>
              <p className="text-purple-100 text-lg">Total Funding Raised</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Find Your Co-founder?
          </h2>
          <p className="text-xl text-gray-400 mb-10">
            Join thousands of entrepreneurs building their dreams together. Start your journey today.
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-lg font-bold text-lg hover:shadow-2xl hover:scale-105 transition transform"
            >
              Create Your Profile Now
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className="text-white font-black text-xl mb-4">Cofounder Matches</h4>
              <p className="text-gray-400 text-sm">Connecting entrepreneurs to build the future.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Platform</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><a href="#" className="hover:text-purple-400 transition">Browse Profiles</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Find Matches</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Startup Ideas</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><a href="#" className="hover:text-purple-400 transition">About Us</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="text-gray-400 text-sm space-y-2">
                <li><a href="#" className="hover:text-purple-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-purple-400 transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Cofounder Matches. All rights reserved. | Made with 💜 for entrepreneurs</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
