import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const SystemSettingsPanel = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      systemName: 'RealEstate MapPro',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      language: 'English',
      sessionTimeout: 30,
      maxConcurrentSessions: 5
    },
    security: {
      mfaRequired: true,
      passwordComplexity: true,
      sessionEncryption: true,
      auditLogging: true,
      ipWhitelisting: false,
      ssoEnabled: true,
      passwordExpiry: 90,
      loginAttempts: 5
    },
    performance: {
      cacheEnabled: true,
      compressionEnabled: true,
      cdnEnabled: true,
      databasePooling: true,
      mapTileCaching: true,
      apiRateLimit: 1000,
      maxConcurrentUsers: 500,
      autoScaling: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 'daily',
      retentionPeriod: 30,
      encryptBackups: true,
      offSiteBackup: true,
      backupTime: '02:00',
      compressionLevel: 'high'
    }
  });

  const sections = [
    { id: 'general', title: 'General Settings', icon: 'Settings' },
    { id: 'security', title: 'Security & Authentication', icon: 'Shield' },
    { id: 'performance', title: 'Performance Optimization', icon: 'Zap' },
    { id: 'backup', title: 'Backup & Recovery', icon: 'HardDrive' }
  ];

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="System Name"
          type="text"
          value={settings.general.systemName}
          onChange={(e) => handleSettingChange('general', 'systemName', e.target.value)}
        />
        
        <Input
          label="Default Timezone"
          type="text"
          value={settings.general.timezone}
          onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
        />
        
        <Input
          label="Date Format"
          type="text"
          value={settings.general.dateFormat}
          onChange={(e) => handleSettingChange('general', 'dateFormat', e.target.value)}
        />
        
        <Input
          label="Currency"
          type="text"
          value={settings.general.currency}
          onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
        />
        
        <Input
          label="Session Timeout (minutes)"
          type="number"
          value={settings.general.sessionTimeout}
          onChange={(e) => handleSettingChange('general', 'sessionTimeout', parseInt(e.target.value))}
        />
        
        <Input
          label="Max Concurrent Sessions"
          type="number"
          value={settings.general.maxConcurrentSessions}
          onChange={(e) => handleSettingChange('general', 'maxConcurrentSessions', parseInt(e.target.value))}
        />
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Checkbox
            label="Multi-Factor Authentication Required"
            description="Require MFA for all user accounts"
            checked={settings.security.mfaRequired}
            onChange={(e) => handleSettingChange('security', 'mfaRequired', e.target.checked)}
          />
          
          <Checkbox
            label="Password Complexity Requirements"
            description="Enforce strong password policies"
            checked={settings.security.passwordComplexity}
            onChange={(e) => handleSettingChange('security', 'passwordComplexity', e.target.checked)}
          />
          
          <Checkbox
            label="Session Encryption"
            description="Encrypt all user sessions"
            checked={settings.security.sessionEncryption}
            onChange={(e) => handleSettingChange('security', 'sessionEncryption', e.target.checked)}
          />
          
          <Checkbox
            label="Audit Logging"
            description="Log all user activities"
            checked={settings.security.auditLogging}
            onChange={(e) => handleSettingChange('security', 'auditLogging', e.target.checked)}
          />
        </div>
        
        <div className="space-y-4">
          <Input
            label="Password Expiry (days)"
            type="number"
            value={settings.security.passwordExpiry}
            onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
          />
          
          <Input
            label="Max Login Attempts"
            type="number"
            value={settings.security.loginAttempts}
            onChange={(e) => handleSettingChange('security', 'loginAttempts', parseInt(e.target.value))}
          />
          
          <Checkbox
            label="IP Whitelisting"
            description="Restrict access to specific IP addresses"
            checked={settings.security.ipWhitelisting}
            onChange={(e) => handleSettingChange('security', 'ipWhitelisting', e.target.checked)}
          />
          
          <Checkbox
            label="Single Sign-On (SSO)"
            description="Enable SSO integration"
            checked={settings.security.ssoEnabled}
            onChange={(e) => handleSettingChange('security', 'ssoEnabled', e.target.checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderPerformanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Checkbox
            label="Enable Caching"
            description="Cache frequently accessed data"
            checked={settings.performance.cacheEnabled}
            onChange={(e) => handleSettingChange('performance', 'cacheEnabled', e.target.checked)}
          />
          
          <Checkbox
            label="Compression"
            description="Compress data transfers"
            checked={settings.performance.compressionEnabled}
            onChange={(e) => handleSettingChange('performance', 'compressionEnabled', e.target.checked)}
          />
          
          <Checkbox
            label="CDN Integration"
            description="Use content delivery network"
            checked={settings.performance.cdnEnabled}
            onChange={(e) => handleSettingChange('performance', 'cdnEnabled', e.target.checked)}
          />
          
          <Checkbox
            label="Database Connection Pooling"
            description="Optimize database connections"
            checked={settings.performance.databasePooling}
            onChange={(e) => handleSettingChange('performance', 'databasePooling', e.target.checked)}
          />
        </div>
        
        <div className="space-y-4">
          <Input
            label="API Rate Limit (requests/hour)"
            type="number"
            value={settings.performance.apiRateLimit}
            onChange={(e) => handleSettingChange('performance', 'apiRateLimit', parseInt(e.target.value))}
          />
          
          <Input
            label="Max Concurrent Users"
            type="number"
            value={settings.performance.maxConcurrentUsers}
            onChange={(e) => handleSettingChange('performance', 'maxConcurrentUsers', parseInt(e.target.value))}
          />
          
          <Checkbox
            label="Map Tile Caching"
            description="Cache map tiles for faster loading"
            checked={settings.performance.mapTileCaching}
            onChange={(e) => handleSettingChange('performance', 'mapTileCaching', e.target.checked)}
          />
          
          <Checkbox
            label="Auto Scaling"
            description="Automatically scale resources"
            checked={settings.performance.autoScaling}
            onChange={(e) => handleSettingChange('performance', 'autoScaling', e.target.checked)}
          />
        </div>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Checkbox
            label="Automatic Backups"
            description="Enable scheduled backups"
            checked={settings.backup.autoBackup}
            onChange={(e) => handleSettingChange('backup', 'autoBackup', e.target.checked)}
          />
          
          <Input
            label="Backup Frequency"
            type="text"
            value={settings.backup.backupFrequency}
            onChange={(e) => handleSettingChange('backup', 'backupFrequency', e.target.value)}
          />
          
          <Input
            label="Retention Period (days)"
            type="number"
            value={settings.backup.retentionPeriod}
            onChange={(e) => handleSettingChange('backup', 'retentionPeriod', parseInt(e.target.value))}
          />
          
          <Input
            label="Backup Time"
            type="time"
            value={settings.backup.backupTime}
            onChange={(e) => handleSettingChange('backup', 'backupTime', e.target.value)}
          />
        </div>
        
        <div className="space-y-4">
          <Checkbox
            label="Encrypt Backups"
            description="Encrypt backup files"
            checked={settings.backup.encryptBackups}
            onChange={(e) => handleSettingChange('backup', 'encryptBackups', e.target.checked)}
          />
          
          <Checkbox
            label="Off-site Backup"
            description="Store backups in remote location"
            checked={settings.backup.offSiteBackup}
            onChange={(e) => handleSettingChange('backup', 'offSiteBackup', e.target.checked)}
          />
          
          <Input
            label="Compression Level"
            type="text"
            value={settings.backup.compressionLevel}
            onChange={(e) => handleSettingChange('backup', 'compressionLevel', e.target.value)}
          />
          
          <div className="pt-4">
            <Button variant="outline" iconName="Play" iconPosition="left">
              Test Backup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'performance':
        return renderPerformanceSettings();
      case 'backup':
        return renderBackupSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">System Settings</h2>
          <p className="text-sm text-text-secondary mt-1">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" iconName="RotateCcw">
            Reset to Defaults
          </Button>
          <Button variant="default" iconName="Save">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
              activeSection === section.id
                ? 'bg-surface text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon name={section.icon} size={16} />
            <span>{section.title}</span>
          </button>
        ))}
      </div>

      {/* Settings Content */}
      <div className="bg-card border border-border rounded-lg p-6">
        {renderContent()}
      </div>

      {/* System Status */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-sm text-text-primary">Database: Connected</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-sm text-text-primary">Cache: Operational</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-warning rounded-full"></div>
            <span className="text-sm text-text-primary">Backup: Scheduled</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsPanel;