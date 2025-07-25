import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const UserManagementPanel = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  const users = [
    {
      id: 'user-1',
      name: 'John Anderson',
      email: 'john.anderson@company.com',
      role: 'Senior Administrator',
      department: 'IT Operations',
      status: 'active',
      lastLogin: '2025-01-11T01:45:23Z',
      permissions: ['system-config', 'user-management', 'integrations', 'monitoring'],
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      id: 'user-2',
      name: 'Sarah Mitchell',
      email: 'sarah.mitchell@company.com',
      role: 'Investment Analyst',
      department: 'Real Estate',
      status: 'active',
      lastLogin: '2025-01-11T02:15:12Z',
      permissions: ['property-analysis', 'market-intelligence', 'deal-management'],
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      id: 'user-3',
      name: 'Michael Rodriguez',
      email: 'michael.rodriguez@company.com',
      role: 'Acquisition Manager',
      department: 'Acquisitions',
      status: 'active',
      lastLogin: '2025-01-10T23:30:45Z',
      permissions: ['property-search', 'deal-management', 'market-intelligence'],
      avatar: 'https://randomuser.me/api/portraits/men/56.jpg'
    },
    {
      id: 'user-4',
      name: 'Emily Chen',
      email: 'emily.chen@company.com',
      role: 'Data Analyst',
      department: 'Analytics',
      status: 'inactive',
      lastLogin: '2025-01-08T16:22:11Z',
      permissions: ['property-analysis', 'market-intelligence'],
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
    }
  ];

  const roles = [
    {
      id: 'senior-admin',
      name: 'Senior Administrator',
      description: 'Full system access with all administrative privileges',
      userCount: 2,
      permissions: ['system-config', 'user-management', 'integrations', 'monitoring', 'audit-logs']
    },
    {
      id: 'investment-analyst',
      name: 'Investment Analyst',
      description: 'Property analysis and market research capabilities',
      userCount: 15,
      permissions: ['property-analysis', 'market-intelligence', 'deal-management']
    },
    {
      id: 'acquisition-manager',
      name: 'Acquisition Manager',
      description: 'Property search and deal management access',
      userCount: 8,
      permissions: ['property-search', 'deal-management', 'market-intelligence']
    },
    {
      id: 'data-analyst',
      name: 'Data Analyst',
      description: 'Analytics and reporting focused role',
      userCount: 5,
      permissions: ['property-analysis', 'market-intelligence']
    }
  ];

  const auditLogs = [
    {
      id: 'log-1',
      user: 'John Anderson',
      action: 'Updated system configuration',
      resource: 'MLS Integration Settings',
      timestamp: '2025-01-11T02:15:43Z',
      ipAddress: '192.168.1.100',
      status: 'success'
    },
    {
      id: 'log-2',
      user: 'Sarah Mitchell',
      action: 'Exported property analysis report',
      resource: 'Property Analysis Workbench',
      timestamp: '2025-01-11T01:45:22Z',
      ipAddress: '192.168.1.105',
      status: 'success'
    },
    {
      id: 'log-3',
      user: 'Michael Rodriguez',
      action: 'Failed login attempt',
      resource: 'Authentication System',
      timestamp: '2025-01-11T01:30:15Z',
      ipAddress: '192.168.1.110',
      status: 'failed'
    },
    {
      id: 'log-4',
      user: 'Emily Chen',
      action: 'Accessed market intelligence dashboard',
      resource: 'Market Intelligence Dashboard',
      timestamp: '2025-01-10T22:15:33Z',
      ipAddress: '192.168.1.115',
      status: 'success'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': case'success':
        return 'text-success';
      case 'inactive': case'failed':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'active': case'success':
        return 'bg-success/10';
      case 'inactive': case'failed':
        return 'bg-error/10';
      default:
        return 'bg-muted';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: 'Users' },
    { id: 'roles', label: 'Roles & Permissions', icon: 'Shield' },
    { id: 'audit', label: 'Audit Logs', icon: 'FileText' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">User Management</h2>
          <p className="text-sm text-text-secondary mt-1">Manage users, roles, and access permissions</p>
        </div>
        <Button 
          variant="default" 
          iconName="UserPlus" 
          iconPosition="left"
          onClick={() => setShowAddUserModal(true)}
        >
          Add User
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary hover:border-border'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">System Users</h3>
              <div className="flex items-center space-x-2">
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="w-64"
                />
                <Button variant="outline" size="sm" iconName="Filter">
                  Filter
                </Button>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-border">
            {users.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">{user.name}</h4>
                    <p className="text-xs text-text-secondary">{user.email}</p>
                    <p className="text-xs text-text-secondary">{user.role} • {user.department}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.status === 'active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    }`}>
                      {user.status}
                    </span>
                    <p className="text-xs text-text-secondary mt-1">
                      Last login: {formatDate(user.lastLogin)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button className="p-1 hover:bg-muted rounded-md transition-colors duration-150">
                      <Icon name="Edit" size={16} className="text-text-secondary" />
                    </button>
                    <button className="p-1 hover:bg-muted rounded-md transition-colors duration-150">
                      <Icon name="Shield" size={16} className="text-text-secondary" />
                    </button>
                    <button className="p-1 hover:bg-muted rounded-md transition-colors duration-150">
                      <Icon name="Trash2" size={16} className="text-error" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((role) => (
            <div key={role.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon name="Shield" size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-primary">{role.name}</h3>
                    <p className="text-xs text-text-secondary mt-1">{role.description}</p>
                    <p className="text-xs text-text-secondary mt-1">{role.userCount} users assigned</p>
                  </div>
                </div>
                
                <button className="p-1 hover:bg-muted rounded-md transition-colors duration-150">
                  <Icon name="Settings" size={16} className="text-text-secondary" />
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-medium text-text-secondary">PERMISSIONS</h4>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="px-2 py-1 text-xs bg-muted text-text-secondary rounded-md"
                    >
                      {permission.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="bg-card border border-border rounded-lg">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Audit Logs</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" iconName="Download">
                  Export
                </Button>
                <Button variant="outline" size="sm" iconName="Filter">
                  Filter
                </Button>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-border">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-center justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${getStatusBg(log.status)}`}>
                    <Icon 
                      name={log.status === 'success' ? 'CheckCircle' : 'XCircle'} 
                      size={16} 
                      className={getStatusColor(log.status)} 
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-text-primary">{log.action}</h4>
                    <p className="text-xs text-text-secondary">
                      {log.user} • {log.resource}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {formatDate(log.timestamp)} • {log.ipAddress}
                    </p>
                  </div>
                </div>
                
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  log.status === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                }`}>
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg w-full max-w-md mx-4">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">Add New User</h3>
                <button 
                  onClick={() => setShowAddUserModal(false)}
                  className="p-1 hover:bg-muted rounded-md transition-colors duration-150"
                >
                  <Icon name="X" size={20} className="text-text-secondary" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="Enter full name"
                required
              />
              
              <Input
                label="Email Address"
                type="email"
                placeholder="user@company.com"
                required
              />
              
              <Input
                label="Department"
                type="text"
                placeholder="Enter department"
                required
              />
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddUserModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="default">
                  Add User
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPanel;