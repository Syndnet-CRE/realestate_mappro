import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const PropertyFilters = ({ onFilterChange, activeFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    propertyType: '',
    zoning: '',
    sqftMin: '',
    sqftMax: '',
    yearBuilt: '',
    ownershipType: '',
    environmentalRisk: false,
    floodZone: false,
    offMarket: false
  });

  const propertyTypeOptions = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'mixed-use', label: 'Mixed Use' },
    { value: 'land', label: 'Vacant Land' }
  ];

  const zoningOptions = [
    { value: 'r1', label: 'R1 - Single Family' },
    { value: 'r2', label: 'R2 - Multi Family' },
    { value: 'c1', label: 'C1 - Commercial' },
    { value: 'i1', label: 'I1 - Light Industrial' },
    { value: 'm1', label: 'M1 - Manufacturing' }
  ];

  const ownershipOptions = [
    { value: 'individual', label: 'Individual Owner' },
    { value: 'corporate', label: 'Corporate Entity' },
    { value: 'trust', label: 'Trust/Estate' },
    { value: 'government', label: 'Government' },
    { value: 'reit', label: 'REIT' }
  ];

  const savedFilters = [
    { id: 1, name: 'High-Value Residential', count: 1247 },
    { id: 2, name: 'Commercial Opportunities', count: 89 },
    { id: 3, name: 'Off-Market Leads', count: 156 },
    { id: 4, name: 'Distressed Properties', count: 234 }
  ];

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      priceMin: '',
      priceMax: '',
      propertyType: '',
      zoning: '',
      sqftMin: '',
      sqftMax: '',
      yearBuilt: '',
      ownershipType: '',
      environmentalRisk: false,
      floodZone: false,
      offMarket: false
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-surface border border-border rounded-lg shadow-sm">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Property Filters</h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Icon 
                name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                size={16} 
              />
            </Button>
          </div>
        </div>
      </div>

      {/* Saved Filters */}
      <div className="p-4 border-b border-border">
        <h4 className="text-xs font-medium text-text-secondary mb-3">SAVED FILTERS</h4>
        <div className="space-y-2">
          {savedFilters.map((filter) => (
            <button
              key={filter.id}
              className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors duration-150 text-left"
            >
              <span className="text-sm text-text-primary">{filter.name}</span>
              <span className="text-xs text-text-secondary bg-muted px-2 py-1 rounded">
                {filter.count.toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Controls */}
      <div className={`transition-all duration-300 ${isExpanded ? 'block' : 'hidden'}`}>
        <div className="p-4 space-y-4">
          {/* Price Range */}
          <div>
            <h4 className="text-xs font-medium text-text-secondary mb-2">PRICE RANGE</h4>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min Price"
                value={filters.priceMin}
                onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                className="text-sm"
              />
              <Input
                type="number"
                placeholder="Max Price"
                value={filters.priceMax}
                onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Property Type */}
          <div>
            <Select
              label="Property Type"
              options={propertyTypeOptions}
              value={filters.propertyType}
              onChange={(value) => handleFilterChange('propertyType', value)}
              placeholder="All Types"
            />
          </div>

          {/* Zoning */}
          <div>
            <Select
              label="Zoning"
              options={zoningOptions}
              value={filters.zoning}
              onChange={(value) => handleFilterChange('zoning', value)}
              placeholder="All Zones"
            />
          </div>

          {/* Square Footage */}
          <div>
            <h4 className="text-xs font-medium text-text-secondary mb-2">SQUARE FOOTAGE</h4>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min Sq Ft"
                value={filters.sqftMin}
                onChange={(e) => handleFilterChange('sqftMin', e.target.value)}
                className="text-sm"
              />
              <Input
                type="number"
                placeholder="Max Sq Ft"
                value={filters.sqftMax}
                onChange={(e) => handleFilterChange('sqftMax', e.target.value)}
                className="text-sm"
              />
            </div>
          </div>

          {/* Ownership Type */}
          <div>
            <Select
              label="Ownership Type"
              options={ownershipOptions}
              value={filters.ownershipType}
              onChange={(value) => handleFilterChange('ownershipType', value)}
              placeholder="All Ownership Types"
            />
          </div>

          {/* Special Filters */}
          <div>
            <h4 className="text-xs font-medium text-text-secondary mb-3">SPECIAL CRITERIA</h4>
            <div className="space-y-2">
              <Checkbox
                label="Environmental Risk Areas"
                checked={filters.environmentalRisk}
                onChange={(e) => handleFilterChange('environmentalRisk', e.target.checked)}
              />
              <Checkbox
                label="Flood Zone Properties"
                checked={filters.floodZone}
                onChange={(e) => handleFilterChange('floodZone', e.target.checked)}
              />
              <Checkbox
                label="Off-Market Opportunities"
                checked={filters.offMarket}
                onChange={(e) => handleFilterChange('offMarket', e.target.checked)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span>Matching Properties: 2,847</span>
          <Button variant="ghost" size="sm" className="text-xs">
            Save Filter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyFilters;