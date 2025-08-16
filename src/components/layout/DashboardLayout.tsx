import React from 'react';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
  userRole?: string;
}

interface DashboardLayoutState {
  isSidebarCollapsed: boolean;
}

export class DashboardLayout extends React.Component<DashboardLayoutProps, DashboardLayoutState> {
  constructor(props: DashboardLayoutProps) {
    super(props);
    this.state = {
      isSidebarCollapsed: false
    };
  }

  private handleToggleSidebar = (): void => {
    this.setState(prevState => ({
      isSidebarCollapsed: !prevState.isSidebarCollapsed
    }));
  };

  public render(): React.ReactNode {
    const { children, currentTab, onTabChange, userRole } = this.props;
    const { isSidebarCollapsed } = this.state;

    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          currentTab={currentTab}
          onTabChange={onTabChange}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={this.handleToggleSidebar}
          userRole={userRole}
        />
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    );
  }
}
