import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterSidebar = ({ isExpanded, onToggle, filters, onFiltersChange }) => {
  const [activeSection, setActiveSection] = useState('property-type');

  const propertyTypes = [
    { value: 'single-family', label: 'Single Family' },
    { value: 'multi-family', label: 'Multi-Family' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'land', label: 'Land' },
    { value: 'mixed-use', label: 'Mixed Use' }
  ];

  const priceRanges = [
    { value: '0-100k', label: 'Under $100K' },
    { value: '100k-250k', label: '$100K - $250K' },
    { value: '250k-500k', label: '$250K - $500K' },
    { value: '500k-1m', label: '$500K - $1M' },
    { value: '1m-2m', label: '$1M - $2M' },
    { value: '2m+', label: 'Over $2M' }
  ];

  const investmentCriteria = [
    { value: 'high-cap-rate', label: 'High Cap Rate (>8%)' },
    { value: 'cash-flow-positive', label: 'Cash Flow Positive' },
    { value: 'value-add', label: 'Value-Add Opportunity' },
    { value: 'distressed', label: 'Distressed Property' },
    { value: 'off-market', label: 'Off-Market Deal' },
    { value: 'development-potential', label: 'Development Potential' }
  ];

  const locations = [
    { value: 'austin-tx', label: 'Austin, TX' },
    { value: 'dallas-tx', label: 'Dallas, TX' },
    { value: 'houston-tx', label: 'Houston, TX' },
    { value: 'miami-fl', label: 'Miami, FL' },
    { value: 'atlanta-ga', label: 'Atlanta, GA' },
    { value: 'phoenix-az', label: 'Phoenix, AZ' }
  ];

  const filterSections = [
    { id: 'property-type', label: 'Property Type', icon: 'Building' },
    { id: 'price', label: 'Price Range', icon: 'DollarSign' },
    { id: 'location', label: 'Location', icon: 'MapPin' },
    { id: 'investment', label: 'Investment Criteria', icon: 'TrendingUp' },
    { id: 'features', label: 'Property Features', icon: 'Home' },
    { id: 'market', label: 'Market Conditions', icon: 'BarChart3' }
  ];

  const handleFilterChange = (category, value) => {
    onFiltersChange({
      ...filters,
      [category]: value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      Array.isArray(value) ? value.length > 0 : value
    ).length;
  };

  return (
    <div className={`bg-surface border-r border-border transition-all duration-300 ${
      isExpanded ? 'w-80' : 'w-16'
    } flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {isExpanded && (
            <div>
              <h3 className="text-lg font-semibold text-text-primary">Filters</h3>
              {getActiveFiltersCount() > 0 && (
                <p className="text-sm text-text-secondary">
                  {getActiveFiltersCount()} active filter{getActiveFiltersCount() !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            <Icon name={isExpanded ? "ChevronLeft" : "ChevronRight"} size={16} />
          </Button>
        </div>
        
        {isExpanded && getActiveFiltersCount() > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="w-full mt-3"
          >
            <Icon name="X" size={14} className="mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="flex-1 overflow-y-auto">
        {isExpanded ? (
          <div className="p-4 space-y-6">
            {/* Property Type */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
                <Icon name="Building" size={16} className="mr-2" />
                Property Type
              </h4>
              <div className="space-y-2">
                {propertyTypes.map(type => (
                  <Checkbox
                    key={type.value}
                    label={type.label}
                    checked={filters.propertyTypes?.includes(type.value) || false}
                    onChange={(e) => {
                      const current = filters.propertyTypes || [];
                      const updated = e.target.checked
                        ? [...current, type.value]
                        : current.filter(t => t !== type.value);
                      handleFilterChange('propertyTypes', updated);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
                <Icon name="DollarSign" size={16} className="mr-2" />
                Price Range
              </h4>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                {priceRanges.map(range => (
                  <Checkbox
                    key={range.value}
                    label={range.label}
                    checked={filters.priceRanges?.includes(range.value) || false}
                    onChange={(e) => {
                      const current = filters.priceRanges || [];
                      const updated = e.target.checked
                        ? [...current, range.value]
                        : current.filter(r => r !== range.value);
                      handleFilterChange('priceRanges', updated);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
                <Icon name="MapPin" size={16} className="mr-2" />
                Location
              </h4>
              <Select
                placeholder="Select locations"
                multiple
                searchable
                options={locations}
                value={filters.locations || []}
                onChange={(value) => handleFilterChange('locations', value)}
                className="mb-3"
              />
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="ZIP Code"
                  value={filters.zipCode || ''}
                  onChange={(e) => handleFilterChange('zipCode', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Radius (miles)"
                  value={filters.radius || ''}
                  onChange={(e) => handleFilterChange('radius', e.target.value)}
                />
              </div>
            </div>

            {/* Investment Criteria */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
                <Icon name="TrendingUp" size={16} className="mr-2" />
                Investment Criteria
              </h4>
              <div className="space-y-2">
                {investmentCriteria.map(criteria => (
                  <Checkbox
                    key={criteria.value}
                    label={criteria.label}
                    checked={filters.investmentCriteria?.includes(criteria.value) || false}
                    onChange={(e) => {
                      const current = filters.investmentCriteria || [];
                      const updated = e.target.checked
                        ? [...current, criteria.value]
                        : current.filter(c => c !== criteria.value);
                      handleFilterChange('investmentCriteria', updated);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Property Features */}
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
                <Icon name="Home" size={16} className="mr-2" />
                Property Features
              </h4>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <Input
                  type="number"
                  placeholder="Min Beds"
                  value={filters.minBeds || ''}
                  onChange={(e) => handleFilterChange('minBeds', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Min Baths"
                  value={filters.minBaths || ''}
                  onChange={(e) => handleFilterChange('minBaths', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min Sq Ft"
                  value={filters.minSqFt || ''}
                  onChange={(e) => handleFilterChange('minSqFt', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max Sq Ft"
                  value={filters.maxSqFt || ''}
                  onChange={(e) => handleFilterChange('maxSqFt', e.target.value)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {filterSections.map(section => (
              <Button
                key={section.id}
                variant="ghost"
                size="icon"
                className="w-12 h-12"
                title={section.label}
              >
                <Icon name={section.icon} size={20} />
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Saved Searches */}
      {isExpanded && (
        <div className="p-4 border-t border-border">
          <h4 className="text-sm font-semibold text-text-primary mb-3">Saved Searches</h4>
          <Button variant="outline" size="sm" className="w-full">
            <Icon name="Plus" size={14} className="mr-2" />
            Save Current Search
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;