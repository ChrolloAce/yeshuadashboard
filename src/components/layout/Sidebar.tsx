import React from 'react';
import { 
  HomeIcon, 
  UserGroupIcon, 
  PlusCircleIcon, 
  ChartBarIcon,
  CogIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react';

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

export class Sidebar extends React.Component<SidebarProps> {
  private readonly navigationItems: NavigationItem[] = [
    {
      id: 'home',
      label: 'Dashboard',
      icon: <HomeIcon className="w-5 h-5" />
    },
    {
      id: 'acquisition',
      label: 'Acquisition',
      icon: <PlusCircleIcon className="w-5 h-5" />
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: <UserGroupIcon className="w-5 h-5" />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <ChartBarIcon className="w-5 h-5" />
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <CogIcon className="w-5 h-5" />
    }
  ];

  private handleTabClick = (tabId: string): void => {
    this.props.onTabChange(tabId);
  };

  public render(): React.ReactNode {
    const { currentTab, isCollapsed, onToggleCollapse } = this.props;

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
              <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {this.navigationItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => this.handleTabClick(item.id)}
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

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed ? (
            <div className="text-center">
              <p className="text-xs text-gray-500">© 2024 Yeshua Cleaning</p>
              <p className="text-xs text-gray-400">v1.0.0</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mx-auto" title="Online"></div>
            </div>
          )}
        </div>
      </div>
    );
  }
}
