import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCompass,
  FaHeart,
  FaEnvelope,
  FaLightbulb,
  FaUsers,
  FaCog,
  FaUserFriends,
  FaTachometerAlt,
} from 'react-icons/fa';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const menuItems = [
    { icon: FaTachometerAlt, label: 'Dashboard', path: '/dashboard' },
    { icon: FaCompass, label: 'Browse', path: '/browse' },
    { icon: FaHeart, label: 'Matches', path: '/matches' },
    { icon: FaUserFriends, label: 'Connections', path: '/connections' },
    { icon: FaEnvelope, label: 'Messages', path: '/messages' },
    { icon: FaLightbulb, label: 'Ideas', path: '/ideas' },
    { icon: FaUsers, label: 'Community', path: '/community' },
    { icon: FaCog, label: 'Settings', path: '/settings' },
  ];

  useEffect(() => {
  function handleClickOutside(event) {
    if (
      isOpen &&
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target)
    ) {
      setIsOpen(false);
    }
  }

  document.addEventListener('mousedown', handleClickOutside);

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [isOpen, setIsOpen]);

  return (
    <>
      {/* Sidebar */}
      <aside
      ref={sidebarRef}
        className={`
          fixed
          left-0
          top-0
          bottom-0
          w-64
          bg-gradient-to-b
          from-slate-900
          via-purple-900
          to-slate-900
          border-r
          border-white/20
          transform
          transition-transform
          duration-300
          z-30
          overflow-y-auto
          overflow-x-hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
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

    </>
  );
};

export default Sidebar;