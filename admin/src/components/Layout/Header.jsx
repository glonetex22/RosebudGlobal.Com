import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, Search, ChevronRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const pageTitles = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/products': 'Products',
  '/products/new': 'Add Product',
  '/orders': 'Orders',
  '/inquiries': 'Inquiries',
  '/categories': 'Categories',
  '/customers': 'Customers',
  '/settings': 'Settings',
};

const Header = ({ sidebarOpen, onToggleSidebar, onMobileMenuClick }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const getPageTitle = () => {
    // Check for exact match first
    if (pageTitles[location.pathname]) {
      return pageTitles[location.pathname];
    }
    
    // Check for partial matches
    for (const [path, title] of Object.entries(pageTitles)) {
      if (location.pathname.startsWith(path) && path !== '/') {
        return title;
      }
    }
    
    return 'Dashboard';
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMobileMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Desktop Toggle Button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 hidden lg:block"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Page Title */}
          <div>
            <h1 className="text-xl font-heading font-semibold text-gray-800 font-heading">{getPageTitle()}</h1>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
              />
            </div>
          </div>
          
          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-gray-100 relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold text-sm">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-800">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
