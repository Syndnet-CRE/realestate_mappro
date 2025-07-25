import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActionToolbar from '../../components/ui/QuickActionToolbar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import SearchBar from './components/SearchBar';
import FilterSidebar from './components/FilterSidebar';
import ResultsGrid from './components/ResultsGrid';
import SavedSearches from './components/SavedSearches';
import AIRecommendations from './components/AIRecommendations';

const PropertySearchAndDiscoveryEngine = () => {
  const location = useLocation();
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({});
  const [isFilterSidebarExpanded, setIsFilterSidebarExpanded] = useState(true);
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');
  const [isLoading, setIsLoading] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showAIRecommendations, setShowAIRecommendations] = useState(true);

  // Mock properties data
  const mockProperties = [
    {
      id: 1,
      title: "Modern Single Family Home",
      location: "Austin, TX 78704",
      price: 425000,
      pricePerSqFt: 285,
      type: "Single Family",
      beds: 3,
      baths: 2,
      sqFt: 1490,
      capRate: 7.2,
      cashFlow: 850,
      investmentScore: 8.5,
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
      features: ["Updated Kitchen", "Hardwood Floors", "Fenced Yard", "Near Schools"],
      isOffMarket: false,
      isNew: true,
      isWatchlisted: false,
      lastUpdated: "2 hours ago",
      dataSync: "synced"
    },
    {
      id: 2,
      title: "Investment Duplex Opportunity",
      location: "Dallas, TX 75201",
      price: 385000,
      pricePerSqFt: 195,
      type: "Multi-Family",
      beds: 4,
      baths: 3,
      sqFt: 1975,
      capRate: 9.1,
      cashFlow: 1450,
      investmentScore: 9.2,
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
      features: ["Separate Entrances", "Updated Plumbing", "Large Lot", "Parking"],
      isOffMarket: true,
      isNew: false,
      isWatchlisted: true,
      lastUpdated: "1 hour ago",
      dataSync: "synced"
    },
    {
      id: 3,
      title: "Commercial Office Building",
      location: "Houston, TX 77002",
      price: 1250000,
      pricePerSqFt: 165,
      type: "Commercial",
      beds: 0,
      baths: 8,
      sqFt: 7575,
      capRate: 8.8,
      cashFlow: 8200,
      investmentScore: 8.9,
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
      features: ["Prime Location", "Elevator", "Parking Garage", "Modern HVAC"],
      isOffMarket: false,
      isNew: false,
      isWatchlisted: false,
      lastUpdated: "3 hours ago",
      dataSync: "pending"
    },
    {
      id: 4,
      title: "Distressed Fixer-Upper",
      location: "Phoenix, AZ 85001",
      price: 195000,
      pricePerSqFt: 145,
      type: "Single Family",
      beds: 2,
      baths: 1,
      sqFt: 1345,
      capRate: 6.8,
      cashFlow: 650,
      investmentScore: 7.8,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
      features: ["Needs Renovation", "Large Lot", "Good Bones", "Quiet Street"],
      isOffMarket: true,
      isNew: true,
      isWatchlisted: false,
      lastUpdated: "4 hours ago",
      dataSync: "synced"
    },
    {
      id: 5,
      title: "Luxury Condo Investment",
      location: "Miami, FL 33101",
      price: 675000,
      pricePerSqFt: 485,
      type: "Multi-Family",
      beds: 2,
      baths: 2,
      sqFt: 1390,
      capRate: 5.9,
      cashFlow: 1250,
      investmentScore: 7.5,
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop",
      features: ["Ocean View", "Amenities", "Concierge", "Valet Parking"],
      isOffMarket: false,
      isNew: false,
      isWatchlisted: true,
      lastUpdated: "5 hours ago",
      dataSync: "synced"
    },
    {
      id: 6,
      title: "Industrial Warehouse",
      location: "Atlanta, GA 30309",
      price: 850000,
      pricePerSqFt: 85,
      type: "Industrial",
      beds: 0,
      baths: 2,
      sqFt: 10000,
      capRate: 9.5,
      cashFlow: 6800,
      investmentScore: 9.1,
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
      features: ["Loading Docks", "High Ceilings", "Rail Access", "Secure Fencing"],
      isOffMarket: false,
      isNew: false,
      isWatchlisted: false,
      lastUpdated: "6 hours ago",
      dataSync: "synced"
    },
    {
      id: 7,
      title: "Development Land Parcel",
      location: "San Antonio, TX 78201",
      price: 325000,
      pricePerSqFt: 12,
      type: "Land",
      beds: 0,
      baths: 0,
      sqFt: 27000,
      capRate: 0,
      cashFlow: 0,
      investmentScore: 8.2,
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
      features: ["Zoned Residential", "Utilities Available", "Corner Lot", "Growth Area"],
      isOffMarket: true,
      isNew: true,
      isWatchlisted: false,
      lastUpdated: "1 day ago",
      dataSync: "synced"
    },
    {
      id: 8,
      title: "Mixed-Use Property",
      location: "Nashville, TN 37201",
      price: 950000,
      pricePerSqFt: 225,
      type: "Mixed Use",
      beds: 6,
      baths: 4,
      sqFt: 4225,
      capRate: 8.3,
      cashFlow: 5200,
      investmentScore: 8.7,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop",
      features: ["Retail + Residential", "Downtown Location", "Historic Building", "Fully Leased"],
      isOffMarket: false,
      isNew: false,
      isWatchlisted: true,
      lastUpdated: "8 hours ago",
      dataSync: "synced"
    }
  ];

  const totalResults = 1247;

  useEffect(() => {
    // Simulate search when component mounts or search parameters change
    if (searchValue || Object.keys(filters).length > 0) {
      handleSearch();
    }
  }, [searchValue, filters]);

  const handleSearch = (query = searchValue) => {
    setIsLoading(true);
    setCurrentPage(1);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestionSelect = (suggestion) => {
    console.log('Selected suggestion:', suggestion);
    handleSearch(suggestion.text);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handlePropertySelect = (propertyIds) => {
    setSelectedProperties(propertyIds);
  };

  const handleBulkAction = (action) => {
    console.log('Bulk action:', action, 'for properties:', selectedProperties);
    
    switch (action) {
      case 'watchlist':
        // Add to watchlist logic
        break;
      case 'compare':
        // Compare properties logic
        break;
      case 'export':
        // Export properties logic
        break;
      default:
        break;
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
  };

  const handleLoadSavedSearch = (search) => {
    setSearchValue(search.query);
    setFilters(search.filters);
    handleSearch(search.query);
  };

  const handleDeleteSavedSearch = (searchId) => {
    console.log('Delete saved search:', searchId);
  };

  const handleViewRecommendation = (recommendationId) => {
    console.log('View recommendation:', recommendationId);
  };

  const handleDismissRecommendation = (recommendationId) => {
    console.log('Dismiss recommendation:', recommendationId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-full mx-auto">
          {/* Page Header */}
          <div className="bg-surface border-b border-border px-6 py-6">
            <div className="max-w-7xl mx-auto">
              <Breadcrumb />
              
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-text-primary mb-2">
                    Property Search & Discovery
                  </h1>
                  <p className="text-text-secondary">
                    Find and analyze investment opportunities with AI-powered search and advanced filtering
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowSavedSearches(!showSavedSearches)}
                  >
                    <Icon name="Bookmark" size={16} className="mr-2" />
                    Saved Searches
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setShowAIRecommendations(!showAIRecommendations)}
                  >
                    <Icon name="Sparkles" size={16} className="mr-2" />
                    AI Recommendations
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <SearchBar
                onSearch={handleSearch}
                onSuggestionSelect={handleSuggestionSelect}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
              />
            </div>
          </div>

          {/* Saved Searches Panel */}
          {showSavedSearches && (
            <div className="bg-background border-b border-border px-6 py-4">
              <div className="max-w-7xl mx-auto">
                <SavedSearches
                  onLoadSearch={handleLoadSavedSearch}
                  onDeleteSearch={handleDeleteSavedSearch}
                />
              </div>
            </div>
          )}

          {/* AI Recommendations Panel */}
          {showAIRecommendations && (
            <div className="bg-background border-b border-border px-6 py-4">
              <div className="max-w-7xl mx-auto">
                <AIRecommendations
                  onViewProperty={handleViewRecommendation}
                  onDismissRecommendation={handleDismissRecommendation}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex h-[calc(100vh-200px)]">
            {/* Filter Sidebar */}
            <FilterSidebar
              isExpanded={isFilterSidebarExpanded}
              onToggle={() => setIsFilterSidebarExpanded(!isFilterSidebarExpanded)}
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />

            {/* Results Grid */}
            <ResultsGrid
              properties={mockProperties}
              totalResults={totalResults}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onSortChange={handleSortChange}
              sortBy={sortBy}
              selectedProperties={selectedProperties}
              onPropertySelect={handlePropertySelect}
              onBulkAction={handleBulkAction}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      <QuickActionToolbar />
    </div>
  );
};

export default PropertySearchAndDiscoveryEngine;