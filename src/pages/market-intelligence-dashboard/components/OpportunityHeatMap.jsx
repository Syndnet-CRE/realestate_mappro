import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const OpportunityHeatMap = () => {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [viewMode, setViewMode] = useState('opportunities');

  const regions = [
    { id: 1, name: 'Downtown Core', opportunities: 24, avgPrice: 850000, growth: 12.5, x: 45, y: 30, intensity: 'high' },
    { id: 2, name: 'Riverside District', opportunities: 18, avgPrice: 650000, growth: 8.2, x: 25, y: 45, intensity: 'medium' },
    { id: 3, name: 'Tech Quarter', opportunities: 31, avgPrice: 1200000, growth: 15.8, x: 65, y: 25, intensity: 'high' },
    { id: 4, name: 'Historic District', opportunities: 12, avgPrice: 750000, growth: 6.1, x: 35, y: 60, intensity: 'low' },
    { id: 5, name: 'Waterfront', opportunities: 22, avgPrice: 950000, growth: 10.3, x: 55, y: 70, intensity: 'medium' },
    { id: 6, name: 'University Area', opportunities: 28, avgPrice: 580000, growth: 14.2, x: 75, y: 50, intensity: 'high' },
    { id: 7, name: 'Industrial Zone', opportunities: 8, avgPrice: 420000, growth: 4.5, x: 20, y: 75, intensity: 'low' },
    { id: 8, name: 'Suburban North', opportunities: 16, avgPrice: 680000, growth: 7.8, x: 50, y: 15, intensity: 'medium' }
  ];

  const getIntensityColor = (intensity) => {
    switch (intensity) {
      case 'high':
        return 'bg-error/80 border-error';
      case 'medium':
        return 'bg-warning/80 border-warning';
      case 'low':
        return 'bg-success/80 border-success';
      default:
        return 'bg-muted border-border';
    }
  };

  const getIntensitySize = (intensity) => {
    switch (intensity) {
      case 'high':
        return 'w-6 h-6';
      case 'medium':
        return 'w-5 h-5';
      case 'low':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Opportunity Heat Map</h3>
        <div className="flex items-center space-x-2">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'opportunities' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('opportunities')}
            >
              Opportunities
            </Button>
            <Button
              variant={viewMode === 'growth' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('growth')}
            >
              Growth
            </Button>
          </div>
          <button className="p-2 hover:bg-muted rounded-lg transition-colors duration-150">
            <Icon name="Maximize2" size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heat Map Visualization */}
        <div className="lg:col-span-2">
          <div className="relative bg-muted/30 rounded-lg h-80 overflow-hidden">
            {/* Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 opacity-50"></div>
            
            {/* Grid Lines */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Region Markers */}
            {regions.map((region) => (
              <div
                key={region.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full border-2 cursor-pointer transition-all duration-150 hover:scale-110 ${getIntensityColor(region.intensity)} ${getIntensitySize(region.intensity)}`}
                style={{ left: `${region.x}%`, top: `${region.y}%` }}
                onClick={() => setSelectedRegion(region)}
                title={region.name}
              >
                <div className="w-full h-full rounded-full animate-pulse"></div>
              </div>
            ))}

            {/* Selected Region Info */}
            {selectedRegion && (
              <div 
                className="absolute bg-popover border border-border rounded-lg p-3 shadow-elevation-2 z-10 min-w-48"
                style={{ 
                  left: `${selectedRegion.x + 5}%`, 
                  top: `${selectedRegion.y - 10}%`,
                  transform: selectedRegion.x > 70 ? 'translateX(-100%)' : 'none'
                }}
              >
                <h4 className="font-semibold text-text-primary mb-2">{selectedRegion.name}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Opportunities:</span>
                    <span className="font-medium text-text-primary">{selectedRegion.opportunities}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Avg Price:</span>
                    <span className="font-medium text-text-primary">${(selectedRegion.avgPrice / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Growth:</span>
                    <span className="font-medium text-success">+{selectedRegion.growth}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center space-x-6 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-error/80 rounded-full"></div>
              <span className="text-sm text-text-secondary">High Activity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-warning/80 rounded-full"></div>
              <span className="text-sm text-text-secondary">Medium Activity</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-success/80 rounded-full"></div>
              <span className="text-sm text-text-secondary">Low Activity</span>
            </div>
          </div>
        </div>

        {/* Region List */}
        <div className="space-y-3">
          <h4 className="font-medium text-text-primary mb-3">Top Regions</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {regions
              .sort((a, b) => b.opportunities - a.opportunities)
              .map((region) => (
                <div
                  key={region.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-150 hover:shadow-elevation-1 ${
                    selectedRegion?.id === region.id
                      ? 'border-primary bg-primary/5' :'border-border bg-surface hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedRegion(region)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-text-primary text-sm">{region.name}</span>
                    <div className={`w-2 h-2 rounded-full ${getIntensityColor(region.intensity).split(' ')[0]}`}></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>{region.opportunities} opportunities</span>
                    <span className="text-success">+{region.growth}%</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityHeatMap;