import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import InteractiveMap from './components/InteractiveMap';
import PropertyDetailsPanel from './components/PropertyDetailsPanel';
import MapToolbar from './components/MapToolbar';

const InteractivePropertyMapDashboard = () => {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeLayers, setActiveLayers] = useState(['properties']);
  const [activeFilters, setActiveFilters] = useState({});
  const [activeTool, setActiveTool] = useState('select');
  const [showPropertyDetails, setShowPropertyDetails] = useState(false);

  const handlePropertySelect = (property) => {
    setSelectedProperty(property);
    setShowPropertyDetails(true);
  };

  const handleLayerToggle = (layerId) => {
    setActiveLayers(prev => 
      prev.includes(layerId) 
        ? prev.filter(id => id !== layerId)
        : [...prev, layerId]
    );
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleToolChange = (tool) => {
    setActiveTool(tool);
  };

  return (
    <>
      <Helmet>
        <title>Interactive Property Map Dashboard | Real Estate Platform</title>
        <meta name="description" content="Explore properties on an interactive map with advanced filtering and analysis tools." />
      </Helmet>

      {/* Full Screen Map Layout with proper height calculation */}
      <div className="relative" style={{ height: '100vh' }}>
        {/* Map Toolbar - Fixed at top */}
        <div className="absolute top-0 left-0 right-0 z-40 bg-surface border-b border-border shadow-sm">
          <MapToolbar 
            activeTool={activeTool}
            onToolChange={handleToolChange}
            onLayerToggle={handleLayerToggle}
            activeLayers={activeLayers}
          />
        </div>

        {/* Interactive Map - Full screen with proper height calculation */}
        <div className="absolute inset-0" style={{ top: '80px', height: 'calc(100vh - 80px)' }}>
          <InteractiveMap
            activeLayers={activeLayers}
            activeFilters={activeFilters}
            activeTool={activeTool}
            onPropertySelect={handlePropertySelect}
            selectedProperty={selectedProperty}
          />
        </div>

        {/* Property Details Panel - Overlay */}
        {showPropertyDetails && selectedProperty && (
          <div className="fixed bottom-4 left-4 z-50 w-96">
            <PropertyDetailsPanel
              property={selectedProperty}
              onClose={() => setShowPropertyDetails(false)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default InteractivePropertyMapDashboard;