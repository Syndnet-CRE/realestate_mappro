import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const IntegrationManagementPanel = () => {
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const integrations = [
    {
      id: 'mls-regional',
      name: 'MLS Regional Feed',
      type: 'MLS Data Feed',
      status: 'active',
      endpoint: 'https://api.mlsregional.com/v2',
      lastSync: '2025-01-11T02:20:43Z',
      syncFrequency: '15 minutes',
      recordsCount: 1247893,
      errorCount: 0,
      configuration: {
        apiKey: '••••••••••••••••',
        regions: ['North', 'South', 'Central'],
        dataTypes: ['Residential', 'Commercial', 'Land']
      }
    },
    {
      id: 'county-records',
      name: 'County Public Records',
      type: 'Public Records',
      status: 'active',
      endpoint: 'https://records.county.gov/api/v1',
      lastSync: '2025-01-11T02:07:43Z',
      syncFrequency: '30 minutes',
      recordsCount: 892456,
      errorCount: 2,
      configuration: {
        apiKey: '••••••••••••••••',
        counties: ['County A', 'County B', 'County C'],
        recordTypes: ['Deeds', 'Liens', 'Permits']
      }
    },
    {
      id: 'salesforce-crm',
      name: 'Salesforce CRM',
      type: 'CRM System',
      status: 'warning',
      endpoint: 'https://company.salesforce.com/services/data/v58.0',
      lastSync: '2025-01-11T00:22:43Z',
      syncFrequency: '1 hour',
      recordsCount: 45678,
      errorCount: 15,
      configuration: {
        clientId: '••••••••••••••••',
        instanceUrl: 'https://company.salesforce.com',
        objects: ['Lead', 'Contact', 'Opportunity']
      }
    },
    {
      id: 'financial-analytics',
      name: 'Financial Analytics Platform',
      type: 'Financial Platform',
      status: 'error',
      endpoint: 'https://api.financialanalytics.com/v3',
      lastSync: '2025-01-10T20:22:43Z',
      syncFrequency: '6 hours',
      recordsCount: 0,
      errorCount: 45,
      configuration: {
        apiKey: '••••••••••••••••',
        services: ['Valuation', 'Market Analysis', 'ROI Calculator'],
        regions: ['US', 'Canada']
      }
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/10';
      case 'warning':
        return 'bg-warning/10';
      case 'error':
        return 'bg-error/10';
      default:
        return 'bg-muted';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Integration Management</h2>
          <p className="text-sm text-text-secondary mt-1">Manage data connections and API integrations</p>
        </div>
        <Button 
          variant="default" 
          iconName="Plus" 
          iconPosition="left"
          onClick={() => setShowAddModal(true)}
        >
          Add Integration
        </Button>
      </div>

      {/* Integration List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getStatusBg(integration.status)}`}>
                  <Icon name="Plug" size={20} className={getStatusColor(integration.status)} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">{integration.name}</h3>
                  <p className="text-xs text-text-secondary">{integration.type}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  integration.status === 'active' ? 'bg-success/10 text-success' :
                  integration.status === 'warning'? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                }`}>
                  {integration.status}
                </span>
                <button 
                  className="p-1 hover:bg-muted rounded-md transition-colors duration-150"
                  onClick={() => setSelectedIntegration(integration)}
                >
                  <Icon name="Settings" size={16} className="text-text-secondary" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-text-secondary">Records:</span>
                  <span className="ml-2 font-medium text-text-primary">
                    {formatNumber(integration.recordsCount)}
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary">Errors:</span>
                  <span className={`ml-2 font-medium ${
                    integration.errorCount > 0 ? 'text-error' : 'text-success'
                  }`}>
                    {integration.errorCount}
                  </span>
                </div>
              </div>

              <div className="text-xs">
                <span className="text-text-secondary">Last Sync:</span>
                <span className="ml-2 text-text-primary">{formatDate(integration.lastSync)}</span>
              </div>

              <div className="text-xs">
                <span className="text-text-secondary">Frequency:</span>
                <span className="ml-2 text-text-primary">{integration.syncFrequency}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" iconName="RefreshCw">
                    Sync Now
                  </Button>
                  <Button variant="ghost" size="sm" iconName="Eye">
                    View Logs
                  </Button>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button className="p-1 hover:bg-muted rounded-md transition-colors duration-150">
                    <Icon name="Pause" size={14} className="text-text-secondary" />
                  </button>
                  <button className="p-1 hover:bg-muted rounded-md transition-colors duration-150">
                    <Icon name="Trash2" size={14} className="text-error" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sync Schedule */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">Sync Schedule</h3>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <Icon name="Clock" size={24} className="text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-text-primary">Next MLS Sync</p>
              <p className="text-xs text-text-secondary">in 12 minutes</p>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <Icon name="Database" size={24} className="text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-text-primary">Records Sync</p>
              <p className="text-xs text-text-secondary">in 27 minutes</p>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <Icon name="Users" size={24} className="text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-text-primary">CRM Sync</p>
              <p className="text-xs text-text-secondary">in 45 minutes</p>
            </div>
            
            <div className="text-center p-4 bg-muted rounded-lg">
              <Icon name="DollarSign" size={24} className="text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-text-primary">Financial Sync</p>
              <p className="text-xs text-text-secondary">Error - Manual Required</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg w-full max-w-md mx-4">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">Add New Integration</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1 hover:bg-muted rounded-md transition-colors duration-150"
                >
                  <Icon name="X" size={20} className="text-text-secondary" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <Input
                label="Integration Name"
                type="text"
                placeholder="Enter integration name"
                required
              />
              
              <Input
                label="API Endpoint"
                type="url"
                placeholder="https://api.example.com/v1"
                required
              />
              
              <Input
                label="API Key"
                type="password"
                placeholder="Enter API key"
                required
              />
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button variant="default">
                  Add Integration
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationManagementPanel;