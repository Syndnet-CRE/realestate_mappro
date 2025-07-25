import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PropertyDetailsPanel = ({ selectedProperty, onPropertySelect }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'Home' },
    { id: 'financial', label: 'Financial', icon: 'DollarSign' },
    { id: 'ownership', label: 'Ownership', icon: 'Users' },
    { id: 'environmental', label: 'Environmental', icon: 'Leaf' },
    { id: 'legal', label: 'Legal', icon: 'Scale' }
  ];

  const mockProperties = [
    {
      id: 1,
      address: "1247 Oak Street, Austin, TX 78701",
      price: 875000,
      sqft: 2450,
      bedrooms: 4,
      bathrooms: 3,
      lotSize: 0.25,
      yearBuilt: 2018,
      propertyType: "Single Family",
      zoning: "R-4",
      images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400", "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400"],
      owner: "Sarah Johnson",
      ownershipHistory: [
        { owner: "Sarah Johnson", date: "2020-03-15", price: 750000 },
        { owner: "Michael Davis", date: "2018-11-20", price: 680000 }
      ],
      taxAssessment: 825000,
      monthlyTaxes: 1250,
      insurance: 180,
      utilities: 220,
      floodZone: "X",
      environmentalRisks: ["None identified"],
      legalIssues: ["None"],
      comparables: [
        { address: "1251 Oak Street", price: 890000, sqft: 2500, date: "2024-06-15" },
        { address: "1239 Oak Street", price: 825000, sqft: 2300, date: "2024-05-20" }
      ]
    }
  ];

  const property = selectedProperty || mockProperties[0];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-text-secondary mb-2">Property Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Property Type</span>
                <span className="text-sm font-medium">{property.propertyType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Year Built</span>
                <span className="text-sm font-medium">{property.yearBuilt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Square Feet</span>
                <span className="text-sm font-medium">{property.sqft.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Lot Size</span>
                <span className="text-sm font-medium">{property.lotSize} acres</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-text-secondary">Zoning</span>
                <span className="text-sm font-medium">{property.zoning}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-text-secondary mb-2">Layout</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-text-primary">{property.bedrooms}</div>
                <div className="text-xs text-text-secondary">Bedrooms</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-text-primary">{property.bathrooms}</div>
                <div className="text-xs text-text-secondary">Bathrooms</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-text-primary">{(property.sqft / 1000).toFixed(1)}K</div>
                <div className="text-xs text-text-secondary">Sq Ft</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-text-secondary mb-2">Property Images</h4>
            <div className="grid grid-cols-2 gap-2">
              {property.images.map((image, index) => (
                <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <Image 
                    src={image} 
                    alt={`Property view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-3">Valuation</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Current Price</span>
              <span className="text-lg font-semibold text-success">${property.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Tax Assessment</span>
              <span className="text-sm font-medium">${property.taxAssessment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Price per Sq Ft</span>
              <span className="text-sm font-medium">${Math.round(property.price / property.sqft)}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-3">Monthly Expenses</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Property Taxes</span>
              <span className="text-sm font-medium">${property.monthlyTaxes}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Insurance</span>
              <span className="text-sm font-medium">${property.insurance}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-secondary">Utilities</span>
              <span className="text-sm font-medium">${property.utilities}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-text-primary">Total Monthly</span>
                <span className="text-sm font-semibold text-text-primary">
                  ${property.monthlyTaxes + property.insurance + property.utilities}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-3">Comparable Sales</h4>
        <div className="space-y-2">
          {property.comparables.map((comp, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <div className="text-sm font-medium text-text-primary">{comp.address}</div>
                <div className="text-xs text-text-secondary">{comp.sqft.toLocaleString()} sq ft • {comp.date}</div>
              </div>
              <div className="text-sm font-semibold text-text-primary">${comp.price.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOwnershipTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-3">Current Owner</h4>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Icon name="User" size={20} color="white" />
            </div>
            <div>
              <div className="text-sm font-medium text-text-primary">{property.owner}</div>
              <div className="text-xs text-text-secondary">Owner since March 2020</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-3">Ownership History</h4>
        <div className="space-y-3">
          {property.ownershipHistory.map((record, index) => (
            <div key={index} className="flex justify-between items-center p-3 border border-border rounded-lg">
              <div>
                <div className="text-sm font-medium text-text-primary">{record.owner}</div>
                <div className="text-xs text-text-secondary">{record.date}</div>
              </div>
              <div className="text-sm font-semibold text-text-primary">${record.price.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEnvironmentalTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-3">Flood Zone Information</h4>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
              <Icon name="Shield" size={16} color="white" />
            </div>
            <div>
              <div className="text-sm font-medium text-text-primary">Zone {property.floodZone}</div>
              <div className="text-xs text-text-secondary">Minimal flood risk area</div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-3">Environmental Risks</h4>
        <div className="space-y-2">
          {property.environmentalRisks.map((risk, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-success/5 border border-success/20 rounded-lg">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span className="text-sm text-text-primary">{risk}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLegalTab = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-3">Legal Status</h4>
        <div className="space-y-2">
          {property.legalIssues.map((issue, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-success/5 border border-success/20 rounded-lg">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span className="text-sm text-text-primary">{issue}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-text-secondary mb-3">Zoning Compliance</h4>
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-text-primary">Current Zoning: {property.zoning}</div>
              <div className="text-xs text-text-secondary">Residential - Single Family</div>
            </div>
            <div className="px-3 py-1 bg-success text-success-foreground rounded-full text-xs font-medium">
              Compliant
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'financial':
        return renderFinancialTab();
      case 'ownership':
        return renderOwnershipTab();
      case 'environmental':
        return renderEnvironmentalTab();
      case 'legal':
        return renderLegalTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-text-primary mb-1">{property.address}</h2>
            <div className="flex items-center space-x-4 text-sm text-text-secondary">
              <span>${property.price.toLocaleString()}</span>
              <span>•</span>
              <span>{property.sqft.toLocaleString()} sq ft</span>
              <span>•</span>
              <span>{property.bedrooms}bd {property.bathrooms}ba</span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Icon name="Share" size={16} />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PropertyDetailsPanel;