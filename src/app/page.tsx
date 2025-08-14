'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { AcquisitionTab } from '@/components/dashboard/AcquisitionTab';
import { JobsTab } from '@/components/dashboard/JobsTab';
import { ClientsTab } from '@/components/dashboard/ClientsTab';
import { AnalyticsTab } from '@/components/dashboard/AnalyticsTab';
import { SettingsTab } from '@/components/dashboard/SettingsTab';
import { AuthWrapper } from '@/components/auth/AuthWrapper';

interface DashboardPageState {
  currentTab: string;
}

export default class DashboardPage extends React.Component<{}, DashboardPageState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      currentTab: 'home'
    };
  }

  private handleTabChange = (tab: string): void => {
    this.setState({ currentTab: tab });
  };

  private renderCurrentTab = (): React.ReactNode => {
    switch (this.state.currentTab) {
      case 'home':
        return <DashboardHome />;
      case 'acquisition':
        return <AcquisitionTab />;
      case 'jobs':
        return <JobsTab />;
      case 'clients':
        return <ClientsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardHome />;
    }
  };

  public render(): React.ReactNode {
    return (
      <AuthWrapper>
        <DashboardLayout 
          currentTab={this.state.currentTab}
          onTabChange={this.handleTabChange}
        >
          {this.renderCurrentTab()}
        </DashboardLayout>
      </AuthWrapper>
    );
  }
}