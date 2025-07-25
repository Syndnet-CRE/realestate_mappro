import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const PropertyDetailsPanel = ({ property, onClose, onAddToWatchlist, onOpenDealRoom }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!property) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/30">
        <div className="text-center">
          <Icon name="MapPin" size={48} className="text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary">Select a property on the map to view details</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'Home' },
    { id: 'financial', label: 'Financial', icon: 'DollarSign' },
    { id: 'market', label: 'Market', icon: 'TrendingUp' },
    { id: 'history', label: 'History', icon: 'Clock' }
  ];

  const propertyData = {
    id: property.id || 1,
    address: property.address || "1247 Oak Street, Austin, TX 78701",
    price: property.price || 875000,
    sqft: property.sqft || 2400,
    bedrooms: property.bedrooms || 4,
    bathrooms: property.bathrooms || 3,
    yearBuilt: property.yearBuilt || 1995,
    lotSize: property.lotSize || 0.25,
    propertyType: property.propertyType || "Single Family Residential",
    zoning: property.zoning || "R1 - Single Family",
    owner: property.owner || "Johnson Family Trust",
    taxAssessment: property.taxAssessment || 742000,
    lastSale: property.lastSale || { date: "2019-03-15", price: 650000 },
    images: property.images || [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
    ],
    marketAnalysis: {
      pricePerSqft: 365,
      daysOnMarket: 0,
      priceHistory: [
        { date: "2024-01", price: 875000 },
        { date: "2023-12", price: 850000 },
        { date: "2023-11", price: 825000 }
      ],
      comparables: [
        { address: "1251 Oak Street", price: 890000, sqft: 2500, distance: "0.1 mi" },
        { address: "1239 Oak Street", price: 825000, sqft: 2200, distance: "0.2 mi" },
        { address: "1263 Oak Street", price: 920000, sqft: 2600, distance: "0.3 mi" }
      ]
    },
    investment: {
      estimatedRent: 3200,
      capRate: 4.4,
      cashFlow: 850,
      roi: 12.5,
      appreciation: 8.2
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Property Images */}
      <div className="grid grid-cols-2 gap-2">
        {propertyData.images.slice(0, 4).map((image, index) => (
          <div key={index} className="aspect-video rounded-lg overflow-hidden">
            <Image
              src={image}
              alt={`Property view ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <span className="text-xs text-text-secondary">BEDROOMS</span>
            <p className="text-sm font-medium">{propertyData.bedrooms}</p>
          </div>
          <div>
            <span className="text-xs text-text-secondary">YEAR BUILT</span>
            <p className="text-sm font-medium">{propertyData.yearBuilt}</p>
          </div>
          <div>
            <span className="text-xs text-text-secondary">PROPERTY TYPE</span>
            <p className="text-sm font-medium">{propertyData.propertyType}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-xs text-text-secondary">BATHROOMS</span>
            <p className="text-sm font-medium">{propertyData.bathrooms}</p>
          </div>
          <div>
            <span className="text-xs text-text-secondary">LOT SIZE</span>
            <p className="text-sm font-medium">{propertyData.lotSize} acres</p>
          </div>
          <div>
            <span className="text-xs text-text-secondary">ZONING</span>
            <p className="text-sm font-medium">{propertyData.zoning}</p>
          </div>
        </div>
      </div>

      {/* Owner Information */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="text-sm font-medium text-text-primary mb-2">Owner Information</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-text-secondary">Current Owner</span>
            <span className="text-sm font-medium">{propertyData.owner}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-secondary">Tax Assessment</span>
            <span className="text-sm font-medium">${propertyData.taxAssessment.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-6">
      {/* Investment Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-success/10 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="TrendingUp" size={16} className="text-success" />
            <span className="text-xs font-medium text-success">ROI</span>
          </div>
          <p className="text-2xl font-bold text-success">{propertyData.investment.roi}%</p>
        </div>
        <div className="bg-primary/10 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Percent" size={16} className="text-primary" />
            <span className="text-xs font-medium text-primary">CAP RATE</span>
          </div>
          <p className="text-2xl font-bold text-primary">{propertyData.investment.capRate}%</p>
        </div>
      </div>

      {/* Cash Flow Analysis */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-text-primary">Cash Flow Analysis</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-text-secondary">Estimated Monthly Rent</span>
            <span className="text-sm font-medium text-success">+${propertyData.investment.estimatedRent.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-secondary">Monthly Cash Flow</span>
            <span className="text-sm font-medium text-success">+${propertyData.investment.cashFlow.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-secondary">Annual Appreciation</span>
            <span className="text-sm font-medium text-success">+{propertyData.investment.appreciation}%</span>
          </div>
        </div>
      </div>

      {/* Investment Calculator */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="text-sm font-medium text-text-primary mb-3">Quick Calculator</h4>
        <Button variant="outline" size="sm" className="w-full">
          <Icon name="Calculator" size={16} className="mr-2" />
          Open Investment Calculator
        </Button>
      </div>
    </div>
  );

  const renderMarketTab = () => (
    <div className="space-y-6">
      {/* Market Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-xs text-text-secondary">PRICE PER SQ FT</span>
          <p className="text-lg font-bold">${propertyData.marketAnalysis.pricePerSqft}</p>
        </div>
        <div>
          <span className="text-xs text-text-secondary">DAYS ON MARKET</span>
          <p className="text-lg font-bold">{propertyData.marketAnalysis.daysOnMarket}</p>
        </div>
      </div>

      {/* Comparable Sales */}
      <div>
        <h4 className="text-sm font-medium text-text-primary mb-3">Comparable Sales</h4>
        <div className="space-y-3">
          {propertyData.marketAnalysis.comparables.map((comp, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm font-medium">{comp.address}</p>
                <p className="text-xs text-text-secondary">{comp.sqft.toLocaleString()} sq ft • {comp.distance}</p>
              </div>
              <p className="text-sm font-bold">${comp.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Market Trends */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="text-sm font-medium text-text-primary mb-3">Market Trends</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-text-secondary">3-Month Trend</span>
            <span className="text-sm font-medium text-success">+6.1%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-text-secondary">12-Month Trend</span>
            <span className="text-sm font-medium text-success">+12.8%</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      {/* Sale History */}
      <div>
        <h4 className="text-sm font-medium text-text-primary mb-3">Sale History</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
            <div>
              <p className="text-sm font-medium">Last Sale</p>
              <p className="text-xs text-text-secondary">{propertyData.lastSale.date}</p>
            </div>
            <p className="text-sm font-bold">${propertyData.lastSale.price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Price History Chart Placeholder */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="text-sm font-medium text-text-primary mb-3">Price History</h4>
        <div className="h-32 flex items-center justify-center text-text-secondary">
          <div className="text-center">
            <Icon name="BarChart3" size={32} className="mx-auto mb-2" />
            <p className="text-sm">Price trend chart would appear here</p>
          </div>
        </div>
      </div>

      {/* Ownership History */}
      <div>
        <h4 className="text-sm font-medium text-text-primary mb-3">Ownership History</h4>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">2019 - Present:</span>
            <span className="text-text-secondary ml-2">{propertyData.owner}</span>
          </div>
          <div className="text-sm">
            <span className="font-medium">2015 - 2019:</span>
            <span className="text-text-secondary ml-2">Michael & Sarah Chen</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-surface border border-border rounded-lg shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-text-primary truncate">
              {propertyData.address}
            </h3>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-2xl font-bold text-text-primary">
                ${propertyData.price.toLocaleString()}
              </span>
              <span className="text-sm text-text-secondary">
                {propertyData.sqft.toLocaleString()} sq ft
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-4">
          <Button variant="default" size="sm" onClick={() => onOpenDealRoom(propertyData)}>
            <Icon name="Briefcase" size={16} className="mr-2" />
            Open Deal Room
          </Button>
          <Button variant="outline" size="sm" onClick={() => onAddToWatchlist(propertyData)}>
            <Icon name="Bookmark" size={16} className="mr-2" />
            Add to Watchlist
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex space-x-1 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'bg-primary text-white' :'text-text-secondary hover:text-text-primary hover:bg-muted'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'financial' && renderFinancialTab()}
        {activeTab === 'market' && renderMarketTab()}
        {activeTab === 'history' && renderHistoryTab()}
      </div>
    </div>
  );
};

export default PropertyDetailsPanel;