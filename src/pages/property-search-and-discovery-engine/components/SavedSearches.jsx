import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SavedSearches = ({ onLoadSearch, onDeleteSearch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const savedSearches = [
    {
      id: 1,
      name: "Austin Multi-Family Under 500K",
      query: "Multi-family properties in Austin TX under $500,000",
      filters: { propertyTypes: ['multi-family'], maxPrice: 500000, locations: ['austin-tx'] },
      resultsCount: 47,
      lastRun: "2 hours ago",
      alertsEnabled: true,
      createdDate: "2025-01-08"
    },
    {
      id: 2,
      name: "High Cap Rate Commercial",
      query: "Commercial properties with cap rate >8%",
      filters: { propertyTypes: ['commercial'], investmentCriteria: ['high-cap-rate'] },
      resultsCount: 23,
      lastRun: "1 day ago",
      alertsEnabled: false,
      createdDate: "2025-01-05"
    },
    {
      id: 3,
      name: "Distressed Single Family",
      query: "Distressed single family homes for renovation",
      filters: { propertyTypes: ['single-family'], investmentCriteria: ['distressed', 'value-add'] },
      resultsCount: 89,
      lastRun: "3 hours ago",
      alertsEnabled: true,
      createdDate: "2025-01-03"
    },
    {
      id: 4,
      name: "Development Land Opportunities",
      query: "Land with development potential near major cities",
      filters: { propertyTypes: ['land'], investmentCriteria: ['development-potential'] },
      resultsCount: 156,
      lastRun: "6 hours ago",
      alertsEnabled: true,
      createdDate: "2024-12-28"
    }
  ];

  const handleSaveSearch = () => {
    if (searchName.trim()) {
      console.log('Saving search:', searchName);
      setSearchName('');
      setShowSaveDialog(false);
    }
  };

  const handleLoadSearch = (search) => {
    onLoadSearch(search);
  };

  const handleDeleteSearch = (searchId) => {
    onDeleteSearch(searchId);
  };

  const toggleAlerts = (searchId) => {
    console.log('Toggle alerts for search:', searchId);
  };

  return (
    <div className="bg-surface border border-border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Bookmark" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-text-primary">Saved Searches</h3>
            <span className="bg-muted text-text-secondary px-2 py-1 rounded-md text-xs font-medium">
              {savedSearches.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
            >
              <Icon name="Plus" size={14} className="mr-2" />
              Save Current
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8"
            >
              <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Enter search name..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveSearch()}
            />
            <div className="flex items-center space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveSearch}
                disabled={!searchName.trim()}
              >
                <Icon name="Save" size={14} className="mr-2" />
                Save Search
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowSaveDialog(false);
                  setSearchName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Searches List */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          {savedSearches.length === 0 ? (
            <div className="p-6 text-center">
              <Icon name="Bookmark" size={32} className="mx-auto text-text-secondary mb-3" />
              <p className="text-text-secondary mb-3">No saved searches yet</p>
              <Button variant="outline" size="sm">
                <Icon name="Plus" size={14} className="mr-2" />
                Save your first search
              </Button>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {savedSearches.map(search => (
                <div
                  key={search.id}
                  className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors duration-150"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-text-primary mb-1">{search.name}</h4>
                      <p className="text-sm text-text-secondary line-clamp-2">{search.query}</p>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleAlerts(search.id)}
                        className="h-8 w-8"
                        title={search.alertsEnabled ? "Disable alerts" : "Enable alerts"}
                      >
                        <Icon 
                          name={search.alertsEnabled ? "Bell" : "BellOff"} 
                          size={14} 
                          className={search.alertsEnabled ? "text-primary" : "text-text-secondary"}
                        />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSearch(search.id)}
                        className="h-8 w-8 text-error hover:text-error"
                        title="Delete search"
                      >
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-text-secondary mb-3">
                    <span>{search.resultsCount} results</span>
                    <span>Last run: {search.lastRun}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadSearch(search)}
                      className="flex-1"
                    >
                      <Icon name="Search" size={14} className="mr-2" />
                      Run Search
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLoadSearch(search)}
                    >
                      <Icon name="Edit" size={14} className="mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SavedSearches;