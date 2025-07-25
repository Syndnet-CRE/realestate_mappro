import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PropertySearchBar = ({ onPropertySelect, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priceRange: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    sqftRange: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const priceRangeOptions = [
    { value: '', label: 'Any Price' },
    { value: '0-500000', label: 'Under $500K' },
    { value: '500000-750000', label: '$500K - $750K' },
    { value: '750000-1000000', label: '$750K - $1M' },
    { value: '1000000-1500000', label: '$1M - $1.5M' },
    { value: '1500000+', label: 'Over $1.5M' }
  ];

  const propertyTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'single-family', label: 'Single Family' },
    { value: 'condo', label: 'Condominium' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'multi-family', label: 'Multi-Family' },
    { value: 'commercial', label: 'Commercial' }
  ];

  const bedroomOptions = [
    { value: '', label: 'Any' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' },
    { value: '5', label: '5+' }
  ];

  const bathroomOptions = [
    { value: '', label: 'Any' },
    { value: '1', label: '1+' },
    { value: '2', label: '2+' },
    { value: '3', label: '3+' },
    { value: '4', label: '4+' }
  ];

  const sqftRangeOptions = [
    { value: '', label: 'Any Size' },
    { value: '0-1000', label: 'Under 1,000 sq ft' },
    { value: '1000-1500', label: '1,000 - 1,500 sq ft' },
    { value: '1500-2000', label: '1,500 - 2,000 sq ft' },
    { value: '2000-2500', label: '2,000 - 2,500 sq ft' },
    { value: '2500-3000', label: '2,500 - 3,000 sq ft' },
    { value: '3000+', label: 'Over 3,000 sq ft' }
  ];

  const mockSearchResults = [
    {
      id: 1,
      address: "1247 Oak Street, Austin, TX 78701",
      price: 875000,
      sqft: 2450,
      bedrooms: 4,
      bathrooms: 3,
      propertyType: "Single Family",
      image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=300"
    },
    {
      id: 2,
      address: "892 Pine Avenue, Austin, TX 78702",
      price: 725000,
      sqft: 2100,
      bedrooms: 3,
      bathrooms: 2,
      propertyType: "Single Family",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=300"
    },
    {
      id: 3,
      address: "1456 Elm Drive, Austin, TX 78703",
      price: 950000,
      sqft: 2800,
      bedrooms: 4,
      bathrooms: 3,
      propertyType: "Single Family",
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=300"
    }
  ];

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      setSearchResults(mockSearchResults);
      setIsSearching(false);
    }, 1000);
  };

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      priceRange: '',
      propertyType: '',
      bedrooms: '',
      bathrooms: '',
      sqftRange: ''
    };
    setFilters(clearedFilters);
    onFilterChange?.(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-surface border-b border-border">
      {/* Main Search Bar */}
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search by address, city, or ZIP code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Button 
            variant="default" 
            onClick={handleSearch}
            loading={isSearching}
            disabled={!searchQuery.trim()}
          >
            <Icon name="Search" size={16} />
            Search
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Icon name="Filter" size={16} />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs">
                {Object.values(filters).filter(v => v !== '').length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="px-4 pb-4 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
            <Select
              label="Price Range"
              options={priceRangeOptions}
              value={filters.priceRange}
              onChange={(value) => handleFilterChange('priceRange', value)}
            />
            
            <Select
              label="Property Type"
              options={propertyTypeOptions}
              value={filters.propertyType}
              onChange={(value) => handleFilterChange('propertyType', value)}
            />
            
            <Select
              label="Bedrooms"
              options={bedroomOptions}
              value={filters.bedrooms}
              onChange={(value) => handleFilterChange('bedrooms', value)}
            />
            
            <Select
              label="Bathrooms"
              options={bathroomOptions}
              value={filters.bathrooms}
              onChange={(value) => handleFilterChange('bathrooms', value)}
            />
            
            <Select
              label="Square Footage"
              options={sqftRangeOptions}
              value={filters.sqftRange}
              onChange={(value) => handleFilterChange('sqftRange', value)}
            />
          </div>
          
          {hasActiveFilters && (
            <div className="flex justify-end mt-4">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <Icon name="X" size={16} />
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="border-t border-border bg-muted/30">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-text-primary">
                Search Results ({searchResults.length})
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setSearchResults([])}>
                <Icon name="X" size={16} />
                Close
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {searchResults.map((property) => (
                <div
                  key={property.id}
                  className="bg-surface border border-border rounded-lg p-4 hover:shadow-elevation-1 transition-shadow duration-150 cursor-pointer"
                  onClick={() => onPropertySelect?.(property)}
                >
                  <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                    <img
                      src={property.image}
                      alt={property.address}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/images/no_image.png';
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-text-primary line-clamp-2">
                      {property.address}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-success">
                        ${property.price.toLocaleString()}
                      </div>
                      <div className="text-xs text-text-secondary">
                        ${Math.round(property.price / property.sqft)}/sq ft
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-text-secondary">
                      <span>{property.bedrooms}bd</span>
                      <span>{property.bathrooms}ba</span>
                      <span>{property.sqft.toLocaleString()} sq ft</span>
                    </div>
                    
                    <div className="text-xs text-text-secondary">
                      {property.propertyType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertySearchBar;