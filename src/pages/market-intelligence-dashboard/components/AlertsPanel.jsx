import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AlertsPanel = () => {
  const [activeTab, setActiveTab] = useState('active');

  const alerts = [
    {
      id: 1,
      type: 'price_drop',
      title: 'Significant Price Drop Detected',
      message: 'Downtown Core properties dropped 8.5% in the last 7 days',
      timestamp: '2 hours ago',
      severity: 'high',
      properties: 12,
      status: 'active'
    },
    {
      id: 2,
      type: 'new_listing',
      title: 'New Off-Market Opportunities',
      message: '5 new properties matching your criteria in Tech Quarter',
      timestamp: '4 hours ago',
      severity: 'medium',
      properties: 5,
      status: 'active'
    },
    {
      id: 3,
      type: 'market_trend',
      title: 'Market Trend Alert',
      message: 'Riverside District showing 15% growth trend over 30 days',
      timestamp: '6 hours ago',
      severity: 'low',
      properties: 28,
      status: 'active'
    },
    {
      id: 4,
      type: 'portfolio',
      title: 'Portfolio Performance Update',
      message: 'Your watched properties gained 3.2% average value',
      timestamp: '1 day ago',
      severity: 'medium',
      properties: 18,
      status: 'active'
    },
    {
      id: 5,
      type: 'price_drop',
      title: 'Price Alert Triggered',
      message: 'Waterfront property dropped below $900K threshold',
      timestamp: '2 days ago',
      severity: 'high',
      properties: 1,
      status: 'resolved'
    }
  ];

  const getAlertIcon = (type) => {
    switch (type) {
      case 'price_drop':
        return 'TrendingDown';
      case 'new_listing':
        return 'Plus';
      case 'market_trend':
        return 'TrendingUp';
      case 'portfolio':
        return 'Briefcase';
      default:
        return 'Bell';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'text-error bg-error/10 border-error/20';
      case 'medium':
        return 'text-warning bg-warning/10 border-warning/20';
      case 'low':
        return 'text-success bg-success/10 border-success/20';
      default:
        return 'text-text-secondary bg-muted border-border';
    }
  };

  const filteredAlerts = alerts.filter(alert => alert.status === activeTab);

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Market Alerts</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" iconName="Settings" iconSize={16}>
            Configure
          </Button>
          <Button variant="ghost" size="icon">
            <Icon name="MoreHorizontal" size={16} />
          </Button>
        </div>
      </div>

      {/* Alert Tabs */}
      <div className="flex space-x-1 mb-6 bg-muted rounded-lg p-1">
        <button
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
            activeTab === 'active' ?'bg-surface text-text-primary shadow-sm' :'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('active')}
        >
          Active ({alerts.filter(a => a.status === 'active').length})
        </button>
        <button
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
            activeTab === 'resolved' ?'bg-surface text-text-primary shadow-sm' :'text-text-secondary hover:text-text-primary'
          }`}
          onClick={() => setActiveTab('resolved')}
        >
          Resolved ({alerts.filter(a => a.status === 'resolved').length})
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className="p-4 border border-border rounded-lg hover:shadow-elevation-1 transition-shadow duration-150"
          >
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getSeverityColor(alert.severity)}`}>
                <Icon name={getAlertIcon(alert.type)} size={16} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-text-primary text-sm truncate">{alert.title}</h4>
                  <span className="text-xs text-text-secondary whitespace-nowrap ml-2">{alert.timestamp}</span>
                </div>
                
                <p className="text-sm text-text-secondary mb-2">{alert.message}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-text-secondary">
                    <span>{alert.properties} properties</span>
                    <span className={`px-2 py-1 rounded-full border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {alert.status === 'active' && (
                      <>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          Dismiss
                        </Button>
                      </>
                    )}
                    {alert.status === 'resolved' && (
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Bell" size={48} className="text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary">No {activeTab} alerts</p>
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;