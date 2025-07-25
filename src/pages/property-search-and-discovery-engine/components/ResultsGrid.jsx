import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import PropertyCard from './PropertyCard';

const ResultsGrid = ({ 
  properties, 
  totalResults, 
  currentPage, 
  onPageChange, 
  onSortChange, 
  sortBy, 
  selectedProperties, 
  onPropertySelect, 
  onBulkAction,
  isLoading 
}) => {
  const [viewMode, setViewMode] = useState('grid');
  
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'investment-score', label: 'Investment Score' },
    { value: 'cap-rate', label: 'Cap Rate' },
    { value: 'cash-flow', label: 'Cash Flow' },
    { value: 'date-added', label: 'Recently Added' },
    { value: 'size', label: 'Property Size' }
  ];

  const resultsPerPage = 20;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startResult = (currentPage - 1) * resultsPerPage + 1;
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  const handleSelectAll = () => {
    if (selectedProperties.length === properties.length) {
      onPropertySelect([]);
    } else {
      onPropertySelect(properties.map(p => p.id));
    }
  };

  const handleAddToWatchlist = (propertyId) => {
    console.log('Add to watchlist:', propertyId);
  };

  const handleQuickAnalysis = (propertyId) => {
    console.log('Quick analysis:', propertyId);
  };

  const handlePropertySelect = (propertyId) => {
    const isSelected = selectedProperties.includes(propertyId);
    if (isSelected) {
      onPropertySelect(selectedProperties.filter(id => id !== propertyId));
    } else {
      onPropertySelect([...selectedProperties, propertyId]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-text-secondary">Searching properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Results Header */}
      <div className="bg-surface border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-text-primary">
              Search Results
            </h2>
            <span className="text-text-secondary">
              {startResult}-{endResult} of {totalResults.toLocaleString()} properties
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 px-3"
              >
                <Icon name="Grid3X3" size={16} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <Icon name="List" size={16} />
              </Button>
            </div>

            {/* Sort Dropdown */}
            <Select
              options={sortOptions}
              value={sortBy}
              onChange={onSortChange}
              placeholder="Sort by"
              className="w-48"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProperties.length > 0 && (
          <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-text-primary">
                {selectedProperties.length} propert{selectedProperties.length !== 1 ? 'ies' : 'y'} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPropertySelect([])}
              >
                Clear selection
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('watchlist')}
              >
                <Icon name="Heart" size={14} className="mr-2" />
                Add to Watchlist
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('compare')}
              >
                <Icon name="GitCompare" size={14} className="mr-2" />
                Compare
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBulkAction('export')}
              >
                <Icon name="Download" size={14} className="mr-2" />
                Export
              </Button>
            </div>
          </div>
        )}

        {/* Select All */}
        <div className="flex items-center space-x-3 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="text-text-secondary hover:text-text-primary"
          >
            <Icon 
              name={selectedProperties.length === properties.length ? "CheckSquare" : "Square"} 
              size={16} 
              className="mr-2" 
            />
            Select all on this page
          </Button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Search" size={48} className="mx-auto text-text-secondary mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No properties found</h3>
            <p className="text-text-secondary mb-4">
              Try adjusting your search criteria or filters to find more properties.
            </p>
            <Button variant="outline">
              <Icon name="RefreshCw" size={16} className="mr-2" />
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={`${
            viewMode === 'grid' ?'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' :'space-y-4'
          }`}>
            {properties.map(property => (
              <PropertyCard
                key={property.id}
                property={property}
                onAddToWatchlist={handleAddToWatchlist}
                onQuickAnalysis={handleQuickAnalysis}
                isSelected={selectedProperties.includes(property.id)}
                onSelect={handlePropertySelect}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-surface border-t border-border p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-secondary">
              Page {currentPage} of {totalPages}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <Icon name="ChevronLeft" size={16} className="mr-1" />
                Previous
              </Button>
              
              {/* Page Numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, currentPage - 2) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <Icon name="ChevronRight" size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsGrid;