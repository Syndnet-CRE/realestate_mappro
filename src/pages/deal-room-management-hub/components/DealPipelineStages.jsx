import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DealPipelineStages = ({ deals, selectedStage, onStageSelect, onDealSelect, selectedDeal }) => {
  const [expandedStages, setExpandedStages] = useState({
    'initial-interest': true,
    'due-diligence': true,
    'negotiation': true,
    'under-contract': true,
    'closing': true
  });

  const stages = [
    {
      id: 'initial-interest',
      name: 'Initial Interest',
      icon: 'Eye',
      color: 'bg-blue-100 text-blue-800',
      count: deals.filter(deal => deal.stage === 'initial-interest').length
    },
    {
      id: 'due-diligence',
      name: 'Due Diligence',
      icon: 'Search',
      color: 'bg-yellow-100 text-yellow-800',
      count: deals.filter(deal => deal.stage === 'due-diligence').length
    },
    {
      id: 'negotiation',
      name: 'Negotiation',
      icon: 'MessageSquare',
      color: 'bg-orange-100 text-orange-800',
      count: deals.filter(deal => deal.stage === 'negotiation').length
    },
    {
      id: 'under-contract',
      name: 'Under Contract',
      icon: 'FileText',
      color: 'bg-purple-100 text-purple-800',
      count: deals.filter(deal => deal.stage === 'under-contract').length
    },
    {
      id: 'closing',
      name: 'Closing',
      icon: 'CheckCircle',
      color: 'bg-green-100 text-green-800',
      count: deals.filter(deal => deal.stage === 'closing').length
    }
  ];

  const toggleStageExpansion = (stageId) => {
    setExpandedStages(prev => ({
      ...prev,
      [stageId]: !prev[stageId]
    }));
  };

  const getDealsForStage = (stageId) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  return (
    <div className="bg-surface border-r border-border h-full overflow-y-auto">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Deal Pipeline</h2>
        <p className="text-sm text-text-secondary mt-1">
          {deals.length} active deals
        </p>
      </div>

      <div className="p-2">
        {stages.map((stage) => {
          const stageDeals = getDealsForStage(stage.id);
          const isExpanded = expandedStages[stage.id];
          const isSelected = selectedStage === stage.id;

          return (
            <div key={stage.id} className="mb-2">
              <button
                onClick={() => {
                  onStageSelect(stage.id);
                  toggleStageExpansion(stage.id);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-150 ${
                  isSelected 
                    ? 'bg-primary/10 border border-primary/20' :'hover:bg-muted'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon name={stage.icon} size={18} />
                  <div className="text-left">
                    <div className="font-medium text-text-primary">{stage.name}</div>
                    <div className="text-xs text-text-secondary">{stage.count} deals</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${stage.color}`}>
                    {stage.count}
                  </span>
                  <Icon 
                    name={isExpanded ? "ChevronDown" : "ChevronRight"} 
                    size={16} 
                    className="text-text-secondary"
                  />
                </div>
              </button>

              {isExpanded && stageDeals.length > 0 && (
                <div className="mt-2 ml-4 space-y-1">
                  {stageDeals.map((deal) => (
                    <button
                      key={deal.id}
                      onClick={() => onDealSelect(deal)}
                      className={`w-full text-left p-2 rounded-md transition-colors duration-150 ${
                        selectedDeal?.id === deal.id
                          ? 'bg-accent/10 border border-accent/20' :'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-text-primary truncate">
                            {deal.propertyAddress}
                          </div>
                          <div className="text-xs text-text-secondary">
                            ${deal.askingPrice?.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          {deal.priority === 'high' && (
                            <div className="w-2 h-2 bg-error rounded-full"></div>
                          )}
                          {deal.hasNewActivity && (
                            <div className="w-2 h-2 bg-accent rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-border mt-auto">
        <Button 
          variant="outline" 
          className="w-full"
          iconName="Plus"
          iconPosition="left"
        >
          New Deal Room
        </Button>
      </div>
    </div>
  );
};

export default DealPipelineStages;