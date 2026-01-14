import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  MessageSquare,
  FolderOpen,
  Users,
  Settings,
  LogOut,
  X,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/products', label: 'Products', icon: Package },
  { path: '/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/inquiries', label: 'Inquiries', icon: MessageSquare },
  { path: '/categories', label: 'Categories', icon: FolderOpen },
  { path: '/customers', label: 'Customers', icon: Users },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ isOpen, mobileOpen, onMobileClose }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 hidden lg:block ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className={`h-16 flex items-center border-b border-gray-200 ${isOpen ? 'px-6' : 'px-4 justify-center'}`}>
          {isOpen ? (
            <div className="flex items-center gap-3">
              <img src="/images/logo.png" alt="RoseBud" className="h-8" 
                   onError={(e) => e.target.style.display = 'none'} />
              <span className="font-heading font-semibold text-lg text-gray-800">RoseBud</span>
            </div>
          ) : (
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">R</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
                ${!isOpen && 'justify-center'}
              `}
              title={!isOpen ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          {isOpen && user && (
            <div className="mb-3 px-4">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full ${!isOpen && 'justify-center'}`}
            title={!isOpen ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5" />
            {isOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <span className="font-heading font-semibold text-lg text-gray-800">RoseBud Admin</span>
          </div>
          <button 
            onClick={onMobileClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Mobile User & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          {user && (
            <div className="mb-3 px-4">
              <p className="text-sm font-medium text-gray-800">{user.firstName} {user.lastName}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
