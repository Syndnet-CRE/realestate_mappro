import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActionToolbar from '../../components/ui/QuickActionToolbar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import PropertyDetailsPanel from './components/PropertyDetailsPanel';
import AnalysisToolsPanel from './components/AnalysisToolsPanel';
import PropertySearchBar from './components/PropertySearchBar';
import SavedAnalysisTemplates from './components/SavedAnalysisTemplates';

const PropertyAnalysisWorkbench = () => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeView, setActiveView] = useState('split'); // split, property, analysis
  const [showTemplates, setShowTemplates] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [currentTemplate, setCurrentTemplate] = useState(null);

  // Mock analysis history
  const mockAnalysisHistory = [
    {
      id: 1,
      property: "1247 Oak Street, Austin, TX",
      analysisType: "Financial Calculator",
      date: "2024-07-11",
      roi: 8.5,
      status: "completed"
    },
    {
      id: 2,
      property: "892 Pine Avenue, Austin, TX",
      analysisType: "Comparable Analysis",
      date: "2024-07-10",
      roi: 6.2,
      status: "completed"
    },
    {
      id: 3,
      property: "1456 Elm Drive, Austin, TX",
      analysisType: "Risk Assessment",
      date: "2024-07-09",
      roi: 9.1,
      status: "in-progress"
    }
  ];

  useEffect(() => {
    setAnalysisHistory(mockAnalysisHistory);
  }, []);

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    if (activeView === 'analysis') {
      setActiveView('split');
    }
  };

  const handleTemplateSelect = (template) => {
    setCurrentTemplate(template);
    setShowTemplates(false);
  };

  const handleExportAnalysis = () => {
    // Mock export functionality
    console.log('Exporting analysis for:', selectedProperty?.address);
  };

  const handleSaveAnalysis = () => {
    if (selectedProperty) {
      const newAnalysis = {
        id: analysisHistory.length + 1,
        property: selectedProperty.address,
        analysisType: "Financial Calculator",
        date: new Date().toISOString().split('T')[0],
        roi: 8.5,
        status: "completed"
      };
      setAnalysisHistory([newAnalysis, ...analysisHistory]);
    }
  };

  const renderViewToggle = () => (
    <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
      <button
        onClick={() => setActiveView('property')}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
          activeView === 'property' ?'bg-surface text-text-primary shadow-sm' :'text-text-secondary hover:text-text-primary'
        }`}
      >
        <Icon name="Home" size={16} />
        <span>Property</span>
      </button>
      
      <button
        onClick={() => setActiveView('split')}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
          activeView === 'split' ?'bg-surface text-text-primary shadow-sm' :'text-text-secondary hover:text-text-primary'
        }`}
      >
        <Icon name="Columns" size={16} />
        <span>Split View</span>
      </button>
      
      <button
        onClick={() => setActiveView('analysis')}
        className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
          activeView === 'analysis' ?'bg-surface text-text-primary shadow-sm' :'text-text-secondary hover:text-text-primary'
        }`}
      >
        <Icon name="BarChart3" size={16} />
        <span>Analysis</span>
      </button>
    </div>
  );

  const renderAnalysisHistory = () => (
    <div className="bg-surface border border-border rounded-lg">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-text-primary">Recent Analysis</h3>
      </div>
      <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
        {analysisHistory.map((analysis) => (
          <div
            key={analysis.id}
            className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer transition-colors duration-150"
          >
            <div className="flex-1">
              <div className="text-sm font-medium text-text-primary line-clamp-1">
                {analysis.property}
              </div>
              <div className="text-xs text-text-secondary">
                {analysis.analysisType} • {analysis.date}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm font-semibold text-success">
                {analysis.roi}% ROI
              </div>
              <div className={`w-2 h-2 rounded-full ${
                analysis.status === 'completed' ? 'bg-success' : 'bg-warning'
              }`}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16">
        {/* Search Bar */}
        <PropertySearchBar 
          onPropertySelect={handlePropertySelect}
          onFilterChange={(filters) => console.log('Filters changed:', filters)}
        />

        {/* Main Content */}
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-6">
            <Breadcrumb />
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-text-primary mb-2">Property Analysis Workbench</h1>
                <p className="text-text-secondary">
                  Comprehensive analytical interface for detailed property evaluation and investment decision-making
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                {renderViewToggle()}
                
                <Button
                  variant="outline"
                  onClick={() => setShowTemplates(!showTemplates)}
                >
                  <Icon name="FileText" size={16} />
                  Templates
                </Button>
                
                {selectedProperty && (
                  <>
                    <Button variant="outline" onClick={handleSaveAnalysis}>
                      <Icon name="Save" size={16} />
                      Save
                    </Button>
                    
                    <Button variant="outline" onClick={handleExportAnalysis}>
                      <Icon name="Download" size={16} />
                      Export
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Templates Sidebar */}
          {showTemplates && (
            <div className="fixed right-0 top-16 bottom-0 w-80 bg-surface border-l border-border shadow-elevation-2 z-30">
              <SavedAnalysisTemplates
                onTemplateSelect={handleTemplateSelect}
                onTemplateCreate={(template) => console.log('Template created:', template)}
              />
            </div>
          )}

          {/* Main Workspace */}
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-280px)]">
            {/* Sidebar - Analysis History */}
            <div className="col-span-12 lg:col-span-3">
              {renderAnalysisHistory()}
            </div>

            {/* Main Content Area */}
            <div className="col-span-12 lg:col-span-9">
              {activeView === 'split' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
                  {/* Property Details Panel */}
                  <div className="bg-surface border border-border rounded-lg overflow-hidden">
                    <PropertyDetailsPanel
                      selectedProperty={selectedProperty}
                      onPropertySelect={handlePropertySelect}
                    />
                  </div>

                  {/* Analysis Tools Panel */}
                  <div className="bg-surface border border-border rounded-lg overflow-hidden">
                    <AnalysisToolsPanel selectedProperty={selectedProperty} />
                  </div>
                </div>
              )}

              {activeView === 'property' && (
                <div className="bg-surface border border-border rounded-lg overflow-hidden h-full">
                  <PropertyDetailsPanel
                    selectedProperty={selectedProperty}
                    onPropertySelect={handlePropertySelect}
                  />
                </div>
              )}

              {activeView === 'analysis' && (
                <div className="bg-surface border border-border rounded-lg overflow-hidden h-full">
                  <AnalysisToolsPanel selectedProperty={selectedProperty} />
                </div>
              )}

              {/* No Property Selected State */}
              {!selectedProperty && (
                <div className="bg-surface border border-border rounded-lg h-full flex items-center justify-center">
                  <div className="text-center">
                    <Icon name="Search" size={64} className="text-text-secondary mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-text-primary mb-2">No Property Selected</h3>
                    <p className="text-text-secondary mb-6 max-w-md">
                      Search for a property above or select one from your recent analysis to begin your evaluation
                    </p>
                    <Button
                      variant="default"
                      onClick={() => navigate('/property-search-and-discovery-engine')}
                    >
                      <Icon name="Search" size={16} />
                      Browse Properties
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <QuickActionToolbar />
    </div>
  );
};

export default PropertyAnalysisWorkbench;