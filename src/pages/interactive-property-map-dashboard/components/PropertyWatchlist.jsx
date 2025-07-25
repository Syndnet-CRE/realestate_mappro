import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const PropertyWatchlist = ({ onPropertySelect }) => {
  const [activeTab, setActiveTab] = useState('watching');

  const watchlistProperties = [
    {
      id: 1,
      address: "1247 Oak Street, Austin, TX 78701",
      price: 875000,
      sqft: 2400,
      type: "Single Family",
      status: "Off-Market",
      lastUpdate: "2 hours ago",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
      alerts: 2,
      roi: 12.5
    },
    {
      id: 2,
      address: "3456 Commerce Blvd, Dallas, TX 75201",
      price: 1250000,
      sqft: 4800,
      type: "Commercial",
      status: "Listed",
      lastUpdate: "1 day ago",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
      alerts: 1,
      roi: 8.3
    },
    {
      id: 3,
      address: "789 Industrial Way, Houston, TX 77002",
      price: 2100000,
      sqft: 12000,
      type: "Industrial",
      status: "Under Contract",
      lastUpdate: "3 days ago",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      alerts: 0,
      roi: 15.2
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: "price_change",
      property: "1247 Oak Street",
      message: "Price reduced by $25,000",
      timestamp: "2 hours ago",
      icon: "TrendingDown",
      color: "text-success"
    },
    {
      id: 2,
      type: "new_listing",
      property: "5678 Main Ave",
      message: "New off-market opportunity",
      timestamp: "4 hours ago",
      icon: "Plus",
      color: "text-primary"
    },
    {
      id: 3,
      type: "status_change",
      property: "3456 Commerce Blvd",
      message: "Status changed to Listed",
      timestamp: "1 day ago",
      icon: "RefreshCw",
      color: "text-warning"
    }
  ];

  const tabs = [
    { id: 'watching', label: 'Watching', count: watchlistProperties.length },
    { id: 'activity', label: 'Activity', count: recentActivity.length }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Off-Market': return 'bg-primary/10 text-primary';
      case 'Listed': return 'bg-success/10 text-success';
      case 'Under Contract': return 'bg-warning/10 text-warning';
      default: return 'bg-muted text-text-secondary';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg shadow-sm">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">Property Watchlist</h3>
          <Button variant="ghost" size="sm">
            <Icon name="Plus" size={14} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted rounded-md p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 rounded text-xs font-medium transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'bg-surface text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>{tab.label}</span>
              <span className="bg-text-secondary/20 text-text-secondary px-1.5 py-0.5 rounded text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {activeTab === 'watching' && (
          <div className="divide-y divide-border">
            {watchlistProperties.map((property) => (
              <div
                key={property.id}
                className="p-4 hover:bg-muted/50 cursor-pointer transition-colors duration-150"
                onClick={() => onPropertySelect(property)}
              >
                <div className="flex space-x-3">
                  <div className="w-16 h-12 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={property.image}
                      alt={property.address}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {property.address}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm font-semibold text-text-primary">
                            ${property.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-text-secondary">
                            {property.sqft.toLocaleString()} sq ft
                          </span>
                        </div>
                      </div>
                      
                      {property.alerts > 0 && (
                        <div className="flex items-center space-x-1 text-error">
                          <Icon name="Bell" size={12} />
                          <span className="text-xs">{property.alerts}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(property.status)}`}>
                          {property.status}
                        </span>
                        <span className="text-xs text-text-secondary">
                          ROI: {property.roi}%
                        </span>
                      </div>
                      <span className="text-xs text-text-secondary">
                        {property.lastUpdate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="divide-y divide-border">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors duration-150">
                <div className="flex items-start space-x-3">
                  <div className={`p-1.5 rounded-full bg-muted ${activity.color}`}>
                    <Icon name={activity.icon} size={12} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {activity.property}
                    </p>
                    <p className="text-sm text-text-secondary mt-1">
                      {activity.message}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Last sync: 5 min ago</span>
          <Button variant="ghost" size="sm" className="text-xs">
            View All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyWatchlist;