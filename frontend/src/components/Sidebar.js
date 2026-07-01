import React from 'react';
import { useNavigate, } from 'react-router-dom';
import {
  FaCompass,
  FaHeart,
  FaEnvelope,
  FaLightbulb,
  FaUsers,
  FaCog,
  FaChevronLeft,
  FaChevronRight,
  FaUserFriends
} from 'react-icons/fa';
import { FaComments} from 'react-icons/fa';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const menuItems = [
  { icon: FaCompass, label: 'Browse', path: '/browse' },
  { icon: FaHeart, label: 'Matches', path: '/matches' },

  // NEW
  { icon: FaUserFriends, label: 'Connections', path: '/connections' },

  { icon: FaEnvelope, label: 'Messages', path: '/messages' },
  { icon: FaLightbulb, label: 'Ideas', path: '/ideas' },
  { icon: FaUsers, label: 'Community', path: '/community' },
  { icon: FaCog, label: 'Settings', path: '/settings' },
];

  return (
    <>
      
      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-12 h-[calc(100vh-48px)]
          bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900
          border-r border-white/20
          transition-all duration-300
          z-30
          ${isOpen ? 'w-64' : 'w-0'}
          overflow-hidden
        `}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/20 mt-4">
          <h1 className="text-xl font-black text-purple-400 whitespace-nowrap">
            Menu
          </h1>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-4 text-gray-300 hover:text-white hover:bg-purple-600/30 px-4 py-3 rounded-lg transition whitespace-nowrap"
              >
                <Icon className="text-xl flex-shrink-0" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Arrow Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          fixed top-1/2 -translate-y-1/2
          z-50
          bg-purple-700 hover:bg-purple-600
          text-white
          p-3 rounded-r-lg
          transition-all duration-300
          ${isOpen ? 'left-64' : 'left-0'}
        `}
      >
        {isOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </button>

      

    </>
  );
};

export default Sidebar;