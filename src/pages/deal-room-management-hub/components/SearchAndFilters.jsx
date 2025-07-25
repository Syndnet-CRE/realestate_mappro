import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const SearchAndFilters = ({ onSearch, onFilter, filters, onClearFilters }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters || {});

  const propertyTypeOptions = [
    { value: 'all', label: 'All Property Types' },
    { value: 'single-family', label: 'Single Family' },
    { value: 'multi-family', label: 'Multi Family' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'land', label: 'Land' }
  ];

  const stageOptions = [
    { value: 'all', label: 'All Stages' },
    { value: 'initial-interest', label: 'Initial Interest' },
    { value: 'due-diligence', label: 'Due Diligence' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'under-contract', label: 'Under Contract' },
    { value: 'closing', label: 'Closing' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const assigneeOptions = [
    { value: 'all', label: 'All Assignees' },
    { value: 'sarah-johnson', label: 'Sarah Johnson' },
    { value: 'mike-chen', label: 'Mike Chen' },
    { value: 'lisa-rodriguez', label: 'Lisa Rodriguez' },
    { value: 'david-kim', label: 'David Kim' },
    { value: 'john-analyst', label: 'John Analyst' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
    onFilter(updatedFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    setSearchQuery('');
    onClearFilters();
  };

  const getActiveFilterCount = () => {
    return Object.values(localFilters).filter(value => value && value !== 'all').length;
  };

  return (
    <div className="bg-surface border-b border-border">
      <div className="p-4">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-4">
          <div className="flex-1 relative">
            <Icon 
              name="Search" 
              size={16} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" 
            />
            <Input
              type="search"
              placeholder="Search deals by property address, city, or deal ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline" iconName="Search" iconPosition="left">
            Search
          </Button>
        </form>

        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              iconName="Filter"
              iconPosition="left"
            >
              Filters
              {getActiveFilterCount() > 0 && (
                <span className="ml-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </Button>

            {getActiveFilterCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                iconName="X"
                iconPosition="left"
              >
                Clear All
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" iconName="Download" iconPosition="left">
              Export
            </Button>
            <Button variant="outline" size="sm" iconName="Save" iconPosition="left">
              Save View
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterPanelOpen && (
          <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <Select
                label="Property Type"
                options={propertyTypeOptions}
                value={localFilters.propertyType || 'all'}
                onChange={(value) => handleFilterChange('propertyType', value)}
              />

              <Select
                label="Deal Stage"
                options={stageOptions}
                value={localFilters.stage || 'all'}
                onChange={(value) => handleFilterChange('stage', value)}
              />

              <Select
                label="Priority"
                options={priorityOptions}
                value={localFilters.priority || 'all'}
                onChange={(value) => handleFilterChange('priority', value)}
              />

              <Select
                label="Assigned To"
                options={assigneeOptions}
                value={localFilters.assignee || 'all'}
                onChange={(value) => handleFilterChange('assignee', value)}
              />

              <Select
                label="Date Range"
                options={dateRangeOptions}
                value={localFilters.dateRange || 'all'}
                onChange={(value) => handleFilterChange('dateRange', value)}
              />
            </div>

            {/* Advanced Filters */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  label="Min Price"
                  type="number"
                  placeholder="$0"
                  value={localFilters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />

                <Input
                  label="Max Price"
                  type="number"
                  placeholder="$1,000,000"
                  value={localFilters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />

                <Input
                  label="Min Square Feet"
                  type="number"
                  placeholder="0"
                  value={localFilters.minSqFt || ''}
                  onChange={(e) => handleFilterChange('minSqFt', e.target.value)}
                />

                <Input
                  label="Max Square Feet"
                  type="number"
                  placeholder="10,000"
                  value={localFilters.maxSqFt || ''}
                  onChange={(e) => handleFilterChange('maxSqFt', e.target.value)}
                />
              </div>
            </div>

            {/* Saved Filters */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">Saved Filters:</span>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">High Priority Deals</Button>
                  <Button variant="ghost" size="sm">Due Diligence Active</Button>
                  <Button variant="ghost" size="sm">Closing This Month</Button>
                  <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
                    Save Current
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilters;