import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const PropertySummaryHeader = ({ deal, onClose }) => {
  if (!deal) {
    return (
      <div className="bg-surface border-b border-border p-6">
        <div className="flex items-center justify-center h-24">
          <div className="text-center">
            <Icon name="Building" size={32} className="text-text-secondary mx-auto mb-2" />
            <p className="text-text-secondary">Select a deal to view details</p>
          </div>
        </div>
      </div>
    );
  }

  const getStageColor = (stage) => {
    const colors = {
      'initial-interest': 'bg-blue-100 text-blue-800',
      'due-diligence': 'bg-yellow-100 text-yellow-800',
      'negotiation': 'bg-orange-100 text-orange-800',
      'under-contract': 'bg-purple-100 text-purple-800',
      'closing': 'bg-green-100 text-green-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'text-error',
      'medium': 'text-warning',
      'low': 'text-success'
    };
    return colors[priority] || 'text-text-secondary';
  };

  return (
    <div className="bg-surface border-b border-border">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <Image
                src={deal.propertyImage}
                alt={deal.propertyAddress}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-xl font-semibold text-text-primary">
                  {deal.propertyAddress}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(deal.stage)}`}>
                  {deal.stage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <div className="flex items-center space-x-1">
                  <Icon name="AlertCircle" size={16} className={getPriorityColor(deal.priority)} />
                  <span className={`text-sm font-medium ${getPriorityColor(deal.priority)}`}>
                    {deal.priority.charAt(0).toUpperCase() + deal.priority.slice(1)} Priority
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-6 text-sm text-text-secondary">
                <div className="flex items-center space-x-1">
                  <Icon name="MapPin" size={14} />
                  <span>{deal.city}, {deal.state}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Home" size={14} />
                  <span>{deal.propertyType}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Calendar" size={14} />
                  <span>Created {deal.createdDate}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" iconName="Share" iconPosition="left">
              Share
            </Button>
            <Button variant="outline" size="sm" iconName="Star" iconPosition="left">
              Watch
            </Button>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                <Icon name="X" size={16} />
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-text-secondary mb-1">Asking Price</div>
            <div className="text-lg font-semibold text-text-primary">
              ${deal.askingPrice?.toLocaleString()}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-text-secondary mb-1">Est. Value</div>
            <div className="text-lg font-semibold text-text-primary">
              ${deal.estimatedValue?.toLocaleString()}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-text-secondary mb-1">Square Feet</div>
            <div className="text-lg font-semibold text-text-primary">
              {deal.squareFeet?.toLocaleString()} sq ft
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-sm text-text-secondary mb-1">Days Active</div>
            <div className="text-lg font-semibold text-text-primary">
              {deal.daysActive} days
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Icon name="Users" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">
                {deal.teamMembers?.length || 0} team members
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="FileText" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">
                {deal.documentsCount || 0} documents
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="MessageSquare" size={16} className="text-text-secondary" />
              <span className="text-sm text-text-secondary">
                {deal.commentsCount || 0} comments
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-text-secondary">Last updated:</div>
            <div className="text-sm font-medium text-text-primary">{deal.lastUpdated}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySummaryHeader;