import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const MapLayerControls = ({ onLayerToggle, activeLayers }) => {
  const [expandedSections, setExpandedSections] = useState({
    base: true,
    property: true,
    market: false,
    environmental: false
  });

  const layerSections = [
    {
      id: 'base',
      title: 'Base Layers',
      icon: 'Map',
      layers: [
        { id: 'satellite', name: 'Satellite View', description: 'High-resolution satellite imagery' },
        { id: 'streets', name: 'Street Map', description: 'Detailed street and road network' },
        { id: 'terrain', name: 'Terrain', description: 'Topographical elevation data' },
        { id: 'parcels', name: 'Parcel Boundaries', description: 'Property boundary lines' }
      ]
    },
    {
      id: 'property',
      title: 'Property Data',
      icon: 'Building',
      layers: [
        { id: 'ownership', name: 'Ownership Info', description: 'Current property owners' },
        { id: 'zoning', name: 'Zoning Districts', description: 'Municipal zoning classifications' },
        { id: 'landuse', name: 'Land Use', description: 'Current property usage types' },
        { id: 'assessments', name: 'Tax Assessments', description: 'Property tax valuations' }
      ]
    },
    {
      id: 'market',
      title: 'Market Intelligence',
      icon: 'TrendingUp',
      layers: [
        { id: 'sales', name: 'Recent Sales', description: 'Comparable sales data' },
        { id: 'listings', name: 'Active Listings', description: 'Properties currently for sale' },
        { id: 'offmarket', name: 'Off-Market Leads', description: 'Potential acquisition targets' },
        { id: 'pricing', name: 'Price Heat Map', description: 'Property value visualization' }
      ]
    },
    {
      id: 'environmental',
      title: 'Environmental Risk',
      icon: 'AlertTriangle',
      layers: [
        { id: 'flood', name: 'Flood Zones', description: 'FEMA flood risk areas' },
        { id: 'hazards', name: 'Environmental Hazards', description: 'Contamination and risk sites' },
        { id: 'utilities', name: 'Utilities', description: 'Water, sewer, and power lines' },
        { id: 'transportation', name: 'Transportation', description: 'Roads, transit, and airports' }
      ]
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleLayerToggle = (layerId, checked) => {
    onLayerToggle(layerId, checked);
  };

  return (
    <div className="bg-surface border border-border rounded-lg shadow-sm">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-text-primary">Map Layers</h3>
          <Button variant="ghost" size="sm" className="text-xs">
            Reset All
          </Button>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {layerSections.map((section) => (
          <div key={section.id} className="border-b border-border last:border-b-0">
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors duration-150"
            >
              <div className="flex items-center space-x-2">
                <Icon name={section.icon} size={16} className="text-text-secondary" />
                <span className="text-sm font-medium text-text-primary">{section.title}</span>
              </div>
              <Icon 
                name="ChevronDown" 
                size={16} 
                className={`text-text-secondary transition-transform duration-150 ${
                  expandedSections[section.id] ? 'rotate-180' : ''
                }`}
              />
            </button>

            {expandedSections[section.id] && (
              <div className="px-3 pb-3 space-y-2">
                {section.layers.map((layer) => (
                  <div key={layer.id} className="flex items-start space-x-2">
                    <Checkbox
                      checked={activeLayers.includes(layer.id)}
                      onChange={(e) => handleLayerToggle(layer.id, e.target.checked)}
                      size="sm"
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-text-primary">{layer.name}</div>
                      <div className="text-xs text-text-secondary">{layer.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border bg-muted/30">
        <div className="text-xs text-text-secondary">
          <div className="flex items-center justify-between">
            <span>Active Layers: {activeLayers.length}</span>
            <span>Last Updated: 2 min ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapLayerControls;