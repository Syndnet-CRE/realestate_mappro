import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActionToolbar from '../../components/ui/QuickActionToolbar';
import DealPipelineStages from './components/DealPipelineStages';
import PropertySummaryHeader from './components/PropertySummaryHeader';
import DealStageContent from './components/DealStageContent';
import BulkOperationsPanel from './components/BulkOperationsPanel';
import SearchAndFilters from './components/SearchAndFilters';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const DealRoomManagementHub = () => {
  const [selectedStage, setSelectedStage] = useState('initial-interest');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for deals
  const mockDeals = [
    {
      id: 'DR-2025-001',
      propertyAddress: '1234 Maple Street',
      city: 'Austin',
      state: 'TX',
      propertyType: 'Single Family',
      stage: 'initial-interest',
      priority: 'high',
      askingPrice: 450000,
      estimatedValue: 485000,
      squareFeet: 2400,
      daysActive: 12,
      createdDate: '2025-07-01',
      lastUpdated: '2 hours ago',
      propertyImage: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop',
      teamMembers: ['Sarah Johnson', 'Mike Chen', 'Lisa Rodriguez'],
      documentsCount: 8,
      commentsCount: 15,
      hasNewActivity: true
    },
    {
      id: 'DR-2025-002',
      propertyAddress: '5678 Oak Avenue',
      city: 'Dallas',
      state: 'TX',
      propertyType: 'Multi Family',
      stage: 'due-diligence',
      priority: 'medium',
      askingPrice: 1200000,
      estimatedValue: 1350000,
      squareFeet: 8500,
      daysActive: 28,
      createdDate: '2025-06-15',
      lastUpdated: '4 hours ago',
      propertyImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
      teamMembers: ['David Kim', 'Sarah Johnson'],
      documentsCount: 12,
      commentsCount: 23,
      hasNewActivity: false
    },
    {
      id: 'DR-2025-003',
      propertyAddress: '9012 Pine Boulevard',
      city: 'Houston',
      state: 'TX',
      propertyType: 'Commercial',
      stage: 'negotiation',
      priority: 'high',
      askingPrice: 2800000,
      estimatedValue: 3100000,
      squareFeet: 15000,
      daysActive: 45,
      createdDate: '2025-05-28',
      lastUpdated: '1 day ago',
      propertyImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
      teamMembers: ['Mike Chen', 'Lisa Rodriguez', 'John Analyst'],
      documentsCount: 18,
      commentsCount: 31,
      hasNewActivity: true
    },
    {
      id: 'DR-2025-004',
      propertyAddress: '3456 Cedar Lane',
      city: 'San Antonio',
      state: 'TX',
      propertyType: 'Single Family',
      stage: 'under-contract',
      priority: 'medium',
      askingPrice: 325000,
      estimatedValue: 340000,
      squareFeet: 1800,
      daysActive: 67,
      createdDate: '2025-05-05',
      lastUpdated: '3 hours ago',
      propertyImage: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop',
      teamMembers: ['Sarah Johnson', 'David Kim'],
      documentsCount: 22,
      commentsCount: 18,
      hasNewActivity: false
    },
    {
      id: 'DR-2025-005',
      propertyAddress: '7890 Elm Street',
      city: 'Fort Worth',
      state: 'TX',
      propertyType: 'Industrial',
      stage: 'closing',
      priority: 'low',
      askingPrice: 1850000,
      estimatedValue: 1900000,
      squareFeet: 25000,
      daysActive: 89,
      createdDate: '2025-04-12',
      lastUpdated: '6 hours ago',
      propertyImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      teamMembers: ['Mike Chen', 'John Analyst'],
      documentsCount: 35,
      commentsCount: 42,
      hasNewActivity: true
    }
  ];

  const [deals, setDeals] = useState(mockDeals);

  useEffect(() => {
    // Auto-select first deal when stage changes
    const stageDeals = deals.filter(deal => deal.stage === selectedStage);
    if (stageDeals.length > 0 && (!selectedDeal || selectedDeal.stage !== selectedStage)) {
      setSelectedDeal(stageDeals[0]);
    }
  }, [selectedStage, deals, selectedDeal]);

  const handleStageSelect = (stageId) => {
    setSelectedStage(stageId);
    setSelectedDeals([]); // Clear bulk selection when changing stages
  };

  const handleDealSelect = (deal) => {
    setSelectedDeal(deal);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (query.trim()) {
        const filteredDeals = mockDeals.filter(deal =>
          deal.propertyAddress.toLowerCase().includes(query.toLowerCase()) ||
          deal.city.toLowerCase().includes(query.toLowerCase()) ||
          deal.id.toLowerCase().includes(query.toLowerCase())
        );
        setDeals(filteredDeals);
      } else {
        setDeals(mockDeals);
      }
      setIsLoading(false);
    }, 500);
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setIsLoading(true);
    
    // Simulate API call with filters
    setTimeout(() => {
      let filteredDeals = [...mockDeals];
      
      if (newFilters.propertyType && newFilters.propertyType !== 'all') {
        filteredDeals = filteredDeals.filter(deal => 
          deal.propertyType.toLowerCase().replace(' ', '-') === newFilters.propertyType
        );
      }
      
      if (newFilters.stage && newFilters.stage !== 'all') {
        filteredDeals = filteredDeals.filter(deal => deal.stage === newFilters.stage);
      }
      
      if (newFilters.priority && newFilters.priority !== 'all') {
        filteredDeals = filteredDeals.filter(deal => deal.priority === newFilters.priority);
      }
      
      if (newFilters.minPrice) {
        filteredDeals = filteredDeals.filter(deal => deal.askingPrice >= parseInt(newFilters.minPrice));
      }
      
      if (newFilters.maxPrice) {
        filteredDeals = filteredDeals.filter(deal => deal.askingPrice <= parseInt(newFilters.maxPrice));
      }
      
      setDeals(filteredDeals);
      setIsLoading(false);
    }, 500);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setDeals(mockDeals);
  };

  const handleBulkAction = (actionData) => {
    console.log('Bulk action:', actionData);
    
    // Simulate bulk operation
    if (actionData.action === 'move-stage' && actionData.targetStage) {
      const updatedDeals = deals.map(deal => 
        actionData.dealIds.includes(deal.id) 
          ? { ...deal, stage: actionData.targetStage }
          : deal
      );
      setDeals(updatedDeals);
    }
    
    // Clear selection after action
    setSelectedDeals([]);
  };

  const handleClearSelection = () => {
    setSelectedDeals([]);
  };

  const toggleDealSelection = (deal) => {
    setSelectedDeals(prev => {
      const isSelected = prev.some(d => d.id === deal.id);
      if (isSelected) {
        return prev.filter(d => d.id !== deal.id);
      } else {
        return [...prev, deal];
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Breadcrumb />
          
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text-primary">Deal Room Management Hub</h1>
                <p className="text-text-secondary mt-1">
                  Manage property deals from initial interest through closing
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button variant="outline" iconName="Settings" iconPosition="left">
                  Settings
                </Button>
                <Button variant="default" iconName="Plus" iconPosition="left">
                  New Deal Room
                </Button>
              </div>
            </div>
          </div>

          <SearchAndFilters
            onSearch={handleSearch}
            onFilter={handleFilter}
            filters={filters}
            onClearFilters={handleClearFilters}
          />

          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)]">
            {/* Left Sidebar - Pipeline Stages */}
            <div className="col-span-12 lg:col-span-3">
              <div className="bg-surface rounded-lg border border-border h-full">
                <DealPipelineStages
                  deals={deals}
                  selectedStage={selectedStage}
                  onStageSelect={handleStageSelect}
                  onDealSelect={handleDealSelect}
                  selectedDeal={selectedDeal}
                />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="col-span-12 lg:col-span-9">
              <div className="bg-surface rounded-lg border border-border h-full flex flex-col">
                {/* Property Summary Header */}
                <PropertySummaryHeader deal={selectedDeal} />

                {/* Deal Stage Content */}
                <div className="flex-1 overflow-hidden">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Icon name="Loader2" size={32} className="text-primary animate-spin mx-auto mb-2" />
                        <p className="text-text-secondary">Loading deal information...</p>
                      </div>
                    </div>
                  ) : (
                    <DealStageContent deal={selectedDeal} stage={selectedStage} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Operations Panel */}
      <BulkOperationsPanel
        selectedDeals={selectedDeals}
        onBulkAction={handleBulkAction}
        onClearSelection={handleClearSelection}
      />

      {/* Quick Action Toolbar */}
      <QuickActionToolbar />
    </div>
  );
};

export default DealRoomManagementHub;