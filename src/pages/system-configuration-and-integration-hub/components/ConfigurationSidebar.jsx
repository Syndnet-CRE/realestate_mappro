import React from 'react';
import Icon from '../../../components/AppIcon';

const ConfigurationSidebar = ({ activeSection, onSectionChange }) => {
  const configurationSections = [
    {
      id: 'system-settings',
      title: 'System Settings',
      icon: 'Settings',
      subsections: [
        { id: 'general', title: 'General Settings' },
        { id: 'security', title: 'Security & Authentication' },
        { id: 'performance', title: 'Performance Optimization' },
        { id: 'backup', title: 'Backup & Recovery' }
      ]
    },
    {
      id: 'integrations',
      title: 'Data Integrations',
      icon: 'Plug',
      subsections: [
        { id: 'mls-feeds', title: 'MLS Data Feeds' },
        { id: 'public-records', title: 'Public Records' },
        { id: 'crm-systems', title: 'CRM Systems' },
        { id: 'financial-platforms', title: 'Financial Platforms' }
      ]
    },
    {
      id: 'user-management',
      title: 'User Management',
      icon: 'Users',
      subsections: [
        { id: 'roles-permissions', title: 'Roles & Permissions' },
        { id: 'team-settings', title: 'Team Settings' },
        { id: 'access-control', title: 'Access Control' },
        { id: 'audit-logs', title: 'Audit Logs' }
      ]
    },
    {
      id: 'monitoring',
      title: 'System Monitoring',
      icon: 'Activity',
      subsections: [
        { id: 'performance-metrics', title: 'Performance Metrics' },
        { id: 'health-dashboard', title: 'System Health' },
        { id: 'alerts', title: 'Alerts & Notifications' },
        { id: 'usage-analytics', title: 'Usage Analytics' }
      ]
    },
    {
      id: 'maintenance',
      title: 'Maintenance',
      icon: 'Wrench',
      subsections: [
        { id: 'scheduled-tasks', title: 'Scheduled Tasks' },
        { id: 'database-maintenance', title: 'Database Maintenance' },
        { id: 'cache-management', title: 'Cache Management' },
        { id: 'system-updates', title: 'System Updates' }
      ]
    }
  ];

  return (
    <div className="w-full h-full bg-surface border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Configuration</h2>
        <p className="text-sm text-text-secondary mt-1">System administration panel</p>
      </div>
      
      <div className="p-2 space-y-1 overflow-y-auto" style={{ height: 'calc(100% - 80px)' }}>
        {configurationSections.map((section) => (
          <div key={section.id} className="space-y-1">
            <button
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                activeSection === section.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-secondary hover:text-text-primary hover:bg-muted'
              }`}
            >
              <Icon name={section.icon} size={16} />
              <span>{section.title}</span>
            </button>
            
            {activeSection === section.id && (
              <div className="ml-6 space-y-1">
                {section.subsections.map((subsection) => (
                  <button
                    key={subsection.id}
                    onClick={() => onSectionChange(subsection.id)}
                    className="w-full text-left px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-muted rounded-md transition-colors duration-150"
                  >
                    {subsection.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfigurationSidebar;