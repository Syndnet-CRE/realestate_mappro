import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActionToolbar from '../../components/ui/QuickActionToolbar';
import ConfigurationSidebar from './components/ConfigurationSidebar';
import SystemHealthDashboard from './components/SystemHealthDashboard';
import IntegrationManagementPanel from './components/IntegrationManagementPanel';
import UserManagementPanel from './components/UserManagementPanel';
import SystemSettingsPanel from './components/SystemSettingsPanel';

const SystemConfigurationAndIntegrationHub = () => {
  const [activeSection, setActiveSection] = useState('system-settings');

  const renderMainContent = () => {
    switch (activeSection) {
      case 'system-settings': case'general': case'security': case'performance': case'backup':
        return <SystemSettingsPanel />;
      case 'integrations': case'mls-feeds': case'public-records': case'crm-systems': case'financial-platforms':
        return <IntegrationManagementPanel />;
      case 'user-management': case'roles-permissions': case'team-settings': case'access-control': case'audit-logs':
        return <UserManagementPanel />;
      case 'monitoring': case'performance-metrics': case'health-dashboard': case'alerts': case'usage-analytics':
        return <SystemHealthDashboard />;
      case 'maintenance':
        return (
          <div className="space-y-6">
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-text-primary mb-2">Maintenance Panel</h3>
              <p className="text-text-secondary">System maintenance tools and scheduled tasks</p>
            </div>
          </div>
        );
      default:
        return <SystemHealthDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16">
        <div className="flex h-screen">
          {/* Sidebar - 25% */}
          <div className="w-1/4 min-w-80 bg-surface border-r border-border">
            <ConfigurationSidebar 
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>
          
          {/* Main Content - 75% */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-border bg-surface">
              <Breadcrumb />
              <div className="mt-4">
                <h1 className="text-2xl font-bold text-text-primary">System Configuration & Integration Hub</h1>
                <p className="text-text-secondary mt-2">
                  Administrative control center for managing system settings, data integrations, and platform configurations
                </p>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-background">
              {renderMainContent()}
            </div>
          </div>
        </div>
      </div>
      
      <QuickActionToolbar />
    </div>
  );
};

export default SystemConfigurationAndIntegrationHub;