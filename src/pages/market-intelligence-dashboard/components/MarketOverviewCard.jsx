import React from 'react';
import Icon from '../../../components/AppIcon';

const MarketOverviewCard = ({ title, value, change, changeType, icon, trend }) => {
  const getChangeColor = (type) => {
    switch (type) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  const getChangeIcon = (type) => {
    switch (type) {
      case 'positive':
        return 'TrendingUp';
      case 'negative':
        return 'TrendingDown';
      default:
        return 'Minus';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-elevation-2 transition-shadow duration-150">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={icon} size={20} className="text-primary" />
          </div>
          <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        </div>
        {trend && (
          <div className="w-16 h-8 bg-muted rounded flex items-center justify-center">
            <div className="w-12 h-2 bg-primary/20 rounded-full relative overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${trend}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="text-2xl font-semibold text-text-primary">{value}</div>
        {change && (
          <div className={`flex items-center space-x-1 text-sm ${getChangeColor(changeType)}`}>
            <Icon name={getChangeIcon(changeType)} size={14} />
            <span>{change}</span>
            <span className="text-text-secondary">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketOverviewCard;