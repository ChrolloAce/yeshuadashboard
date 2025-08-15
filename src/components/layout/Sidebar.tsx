'use client';

import React from 'react';
import { 
  Home, 
  Users, 
  PlusCircle, 
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  LogOut,
  User,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onTabChange, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const { userProfile, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  const navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Dashboard',
      icon: <Home className="w-5 h-5" />
    },
    {
      id: 'acquisition',
      label: 'Acquisition',
      icon: <PlusCircle className="w-5 h-5" />
    },
    {
      id: 'jobs',
      label: 'Jobs',
      icon: <Briefcase className="w-5 h-5" />
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 'teams',
      label: 'Teams',
      icon: <UserCheck className="w-5 h-5" />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />
    }
  ];

  const handleTabClick = (tabId: string): void => {
    onTabChange(tabId);
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      setShowLogoutModal(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

    return (
      <div className={`bg-white border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="Yeshua Cleaning" 
                className="h-8 w-auto"
              />
              <div>
                <h2 className="text-lg font-bold text-gray-900">Yeshua</h2>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <img 
              src="/logo.png" 
              alt="Yeshua Cleaning" 
              className="h-8 w-auto mx-auto"
            />
          )}
          
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    currentTab === item.id
                      ? 'bg-primary-50 text-primary-600 border border-primary-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={`flex-shrink-0 ${
                    currentTab === item.id ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          {!isCollapsed ? (
            <>
              {/* User Profile */}
              <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                <div className="flex-shrink-0">
                  {userProfile?.avatar ? (
                    <img 
                      src={userProfile.avatar} 
                      alt={`${userProfile.firstName} ${userProfile.lastName}`}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-primary-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userProfile?.firstName} {userProfile?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{userProfile?.role}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors text-gray-700 hover:bg-red-50 hover:text-red-600"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>

              {/* Copyright */}
              <div className="text-center pt-2">
                <p className="text-xs text-gray-400">© 2024 Yeshua Cleaning</p>
              </div>
            </>
          ) : (
            <>
              {/* Collapsed User Avatar */}
              <div className="flex justify-center">
                {userProfile?.avatar ? (
                  <img 
                    src={userProfile.avatar} 
                    alt={`${userProfile.firstName} ${userProfile.lastName}`}
                    className="h-8 w-8 rounded-full"
                    title={`${userProfile.firstName} ${userProfile.lastName}`}
                  />
                ) : (
                  <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center" title={`${userProfile?.firstName} ${userProfile?.lastName}`}>
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                )}
              </div>

              {/* Collapsed Logout Button */}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full flex justify-center p-2 rounded-lg transition-colors text-gray-700 hover:bg-red-50 hover:text-red-600"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Logout Confirmation Modal */}
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <LogOut className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Confirm Logout</h3>
                  <p className="text-sm text-gray-500">Are you sure you want to log out?</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
};
