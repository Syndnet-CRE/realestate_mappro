import React from 'react';
import Icon from '../../../components/AppIcon';

const SystemHealthDashboard = () => {
  const systemMetrics = [
    {
      id: 'cpu-usage',
      title: 'CPU Usage',
      value: '34%',
      status: 'healthy',
      icon: 'Cpu',
      trend: 'down',
      lastUpdated: '2 minutes ago'
    },
    {
      id: 'memory-usage',
      title: 'Memory Usage',
      value: '67%',
      status: 'warning',
      icon: 'HardDrive',
      trend: 'up',
      lastUpdated: '1 minute ago'
    },
    {
      id: 'disk-space',
      title: 'Disk Space',
      value: '23%',
      status: 'healthy',
      icon: 'Database',
      trend: 'stable',
      lastUpdated: '5 minutes ago'
    },
    {
      id: 'active-users',
      title: 'Active Users',
      value: '247',
      status: 'healthy',
      icon: 'Users',
      trend: 'up',
      lastUpdated: '30 seconds ago'
    }
  ];

  const integrationStatus = [
    {
      id: 'mls-feed-1',
      name: 'MLS Regional Feed',
      status: 'connected',
      lastSync: '2 minutes ago',
      records: '1,247,893'
    },
    {
      id: 'public-records',
      name: 'County Records API',
      status: 'connected',
      lastSync: '15 minutes ago',
      records: '892,456'
    },
    {
      id: 'crm-salesforce',
      name: 'Salesforce CRM',
      status: 'warning',
      lastSync: '2 hours ago',
      records: '45,678'
    },
    {
      id: 'financial-platform',
      name: 'Financial Analytics',
      status: 'error',
      lastSync: '6 hours ago',
      records: '0'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': case'connected':
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
      case 'healthy': case'connected':
        return 'bg-success/10';
      case 'warning':
        return 'bg-warning/10';
      case 'error':
        return 'bg-error/10';
      default:
        return 'bg-muted';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return 'TrendingUp';
      case 'down':
        return 'TrendingDown';
      case 'stable':
        return 'Minus';
      default:
        return 'Minus';
    }
  };

  return (
    <div className="space-y-6">
      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemMetrics.map((metric) => (
          <div key={metric.id} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${getStatusBg(metric.status)}`}>
                <Icon name={metric.icon} size={20} className={getStatusColor(metric.status)} />
              </div>
              <Icon 
                name={getTrendIcon(metric.trend)} 
                size={16} 
                className={`${
                  metric.trend === 'up' ? 'text-success' : 
                  metric.trend === 'down'? 'text-error' : 'text-text-secondary'
                }`} 
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-text-secondary">{metric.title}</h3>
              <p className="text-2xl font-bold text-text-primary">{metric.value}</p>
              <p className="text-xs text-text-secondary">Updated {metric.lastUpdated}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Status */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-text-primary">Integration Status</h3>
            <button className="flex items-center space-x-2 px-3 py-1.5 text-sm text-primary hover:bg-primary/5 rounded-md transition-colors duration-150">
              <Icon name="RefreshCw" size={16} />
              <span>Refresh All</span>
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-border">
          {integrationStatus.map((integration) => (
            <div key={integration.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  integration.status === 'connected' ? 'bg-success' :
                  integration.status === 'warning'? 'bg-warning' : 'bg-error'
                }`}></div>
                <div>
                  <h4 className="text-sm font-medium text-text-primary">{integration.name}</h4>
                  <p className="text-xs text-text-secondary">
                    Last sync: {integration.lastSync} • {integration.records} records
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  integration.status === 'connected' ? 'bg-success/10 text-success' :
                  integration.status === 'warning'? 'bg-warning/10 text-warning' : 'bg-error/10 text-error'
                }`}>
                  {integration.status}
                </span>
                <button className="p-1 hover:bg-muted rounded-md transition-colors duration-150">
                  <Icon name="Settings" size={16} className="text-text-secondary" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">Recent System Alerts</h3>
        </div>
        
        <div className="divide-y divide-border">
          <div className="p-4 flex items-start space-x-3">
            <div className="p-1 bg-warning/10 rounded-full">
              <Icon name="AlertTriangle" size={16} className="text-warning" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-text-primary">High Memory Usage Detected</h4>
              <p className="text-xs text-text-secondary mt-1">
                Memory usage has exceeded 65% threshold. Consider scaling resources.
              </p>
              <p className="text-xs text-text-secondary mt-1">5 minutes ago</p>
            </div>
          </div>
          
          <div className="p-4 flex items-start space-x-3">
            <div className="p-1 bg-error/10 rounded-full">
              <Icon name="XCircle" size={16} className="text-error" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-text-primary">Financial Platform Connection Failed</h4>
              <p className="text-xs text-text-secondary mt-1">
                Unable to establish connection to financial analytics service.
              </p>
              <p className="text-xs text-text-secondary mt-1">2 hours ago</p>
            </div>
          </div>
          
          <div className="p-4 flex items-start space-x-3">
            <div className="p-1 bg-success/10 rounded-full">
              <Icon name="CheckCircle" size={16} className="text-success" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-text-primary">Backup Completed Successfully</h4>
              <p className="text-xs text-text-secondary mt-1">
                Daily system backup completed without errors.
              </p>
              <p className="text-xs text-text-secondary mt-1">3 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthDashboard;