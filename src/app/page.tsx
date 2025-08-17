'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { AcquisitionTab } from '@/components/dashboard/AcquisitionTab';
import { JobsTab } from '@/components/dashboard/JobsTab';
import { ClientsTab } from '@/components/dashboard/ClientsTab';
import { TeamsTab } from '@/components/dashboard/TeamsTab';
import { AnalyticsTab } from '@/components/dashboard/AnalyticsTab';
import { SettingsTab } from '@/components/dashboard/SettingsTab';
import { CleanerDashboard } from '@/components/dashboard/CleanerDashboard';
import { JobDiscovery } from '@/components/dashboard/JobDiscovery';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const [currentTab, setCurrentTab] = React.useState('home');

  const handleTabChange = (tab: string): void => {
    setCurrentTab(tab);
  };

  const renderCurrentTab = (): React.ReactNode => {
    // If user is a cleaner, show cleaner-specific tabs
    if (userProfile?.role === 'cleaner') {
      switch (currentTab) {
        case 'home':
          return <CleanerDashboard />;
        case 'discovery':
          return <JobDiscovery />;
        case 'schedule':
          // TODO: Implement schedule view (for now, show dashboard)
          return <CleanerDashboard />;
        case 'settings':
          // TODO: Implement cleaner settings (for now, show dashboard)
          return <CleanerDashboard />;
        default:
          return <CleanerDashboard />;
      }
    }

    // Company dashboard (owner/admin)
    switch (currentTab) {
      case 'home':
        return <DashboardHome />;
      case 'acquisition':
        return <AcquisitionTab />;
      case 'jobs':
        return <JobsTab />;
      case 'clients':
        return <ClientsTab />;
      case 'teams':
        return <TeamsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <AuthWrapper>
      <DashboardLayout 
        currentTab={currentTab} 
        onTabChange={handleTabChange}
        userRole={userProfile?.role}
      >
        {renderCurrentTab()}
      </DashboardLayout>
    </AuthWrapper>
  );
}