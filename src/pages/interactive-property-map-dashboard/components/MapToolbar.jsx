import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const MapToolbar = ({ onToolSelect, activeTool, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const location = useLocation();

  // Navigation items for easy app/page switching
  const navigationItems = [
    {
      label: 'Map Intelligence',
      items: [
        { name: 'Interactive Property Map', path: '/interactive-property-map-dashboard', icon: 'Map' },
        { name: 'Property Search', path: '/property-search-and-discovery-engine', icon: 'Search' },
        { name: 'Property Analysis', path: '/property-analysis-workbench', icon: 'BarChart3' }
      ]
    },
    {
      label: 'Deal Management',
      items: [
        { name: 'Deal Room Hub', path: '/deal-room-management-hub', icon: 'Briefcase' }
      ]
    },
    {
      label: 'Market Dashboard',
      items: [
        { name: 'Market Intelligence', path: '/market-intelligence-dashboard', icon: 'TrendingUp' }
      ]
    },
    {
      label: 'System Admin',
      items: [
        { name: 'Configuration Hub', path: '/system-configuration-and-integration-hub', icon: 'Settings' }
      ]
    }
  ];

  const tools = [
    { id: 'select', icon: 'MousePointer', label: 'Select', shortcut: 'V' },
    { id: 'pan', icon: 'Move', label: 'Pan', shortcut: 'H' },
    { id: 'draw', icon: 'Edit3', label: 'Draw', shortcut: 'D' },
    { id: 'measure', icon: 'Ruler', label: 'Measure', shortcut: 'M' },
    { id: 'polygon', icon: 'Pentagon', label: 'Polygon Select', shortcut: 'P' }
  ];

  const quickActions = [
    { id: 'zoom-in', icon: 'ZoomIn', label: 'Zoom In' },
    { id: 'zoom-out', icon: 'ZoomOut', label: 'Zoom Out' },
    { id: 'fit-bounds', icon: 'Maximize2', label: 'Fit to Bounds' },
    { id: 'my-location', icon: 'MapPin', label: 'My Location' }
  ];

  const searchSuggestions = [
    "Austin, TX",
    "1247 Oak Street, Austin, TX",
    "Downtown Austin",
    "Zilker Park Area",
    "78701 ZIP Code"
  ];

  const isActiveSection = (items) => {
    return items.some(item => location.pathname === item.path);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleToolSelect = (toolId) => {
    onToolSelect?.(toolId);
  };

  return (
    <div className="bg-surface border border-border shadow-sm p-3">
      <div className="flex items-center justify-between space-x-4">
        {/* App Navigation */}
        <div className="flex items-center space-x-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Icon name="MapPin" size={16} color="white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-text-primary leading-tight">RealEstate</span>
              <span className="text-xs font-medium text-accent leading-tight">MapPro</span>
            </div>
          </Link>

          {/* Navigation Dropdown */}
          <div className="relative group">
            <button
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 text-text-secondary hover:text-text-primary hover:bg-muted"
            >
              <Icon name="Grid3x3" size={16} />
              <span>Apps</span>
              <Icon name="ChevronDown" size={16} />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 mt-1 w-72 bg-popover border border-border rounded-lg shadow-elevation-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 ease-out z-50">
              <div className="py-2">
                {navigationItems.map((section, index) => (
                  <div key={index} className="px-2 py-1">
                    <h3 className="text-xs font-semibold text-text-secondary px-2 py-1 uppercase tracking-wider">
                      {section.label}
                    </h3>
                    <div className="space-y-1">
                      {section.items.map((item, itemIndex) => (
                        <Link
                          key={itemIndex}
                          to={item.path}
                          className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors duration-150 ${
                            location.pathname === item.path
                              ? 'text-primary bg-primary/5 border-l-2 border-primary' :'text-text-secondary hover:text-text-primary hover:bg-muted'
                          }`}
                        >
                          <Icon name={item.icon} size={16} />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <div className="relative">
            <Icon 
              name="Search" 
              size={16} 
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <Input
              type="search"
              placeholder="Search properties, addresses, or areas..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className="pl-10 pr-4"
            />
          </div>
          
          {/* Search Suggestions */}
          {isSearchFocused && searchQuery.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-elevation-2 z-50">
              <div className="py-2">
                {searchSuggestions
                  .filter(suggestion => 
                    suggestion.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .slice(0, 5)
                  .map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(suggestion)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors duration-150"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon name="MapPin" size={14} className="text-text-secondary" />
                        <span>{suggestion}</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawing Tools */}
        <div className="flex items-center space-x-1 border-l border-border pl-4">
          {tools.map((tool) => (
            <Button
              key={tool.id}
              variant={activeTool === tool.id ? "default" : "ghost"}
              size="sm"
              onClick={() => handleToolSelect(tool.id)}
              title={`${tool.label} (${tool.shortcut})`}
              className="relative"
            >
              <Icon name={tool.icon} size={16} />
            </Button>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-1 border-l border-border pl-4">
          {quickActions.map((action) => (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              onClick={() => onToolSelect(action.id)}
              title={action.label}
            >
              <Icon name={action.icon} size={16} />
            </Button>
          ))}
        </div>

        {/* Bulk Operations */}
        <div className="flex items-center space-x-2 border-l border-border pl-4">
          <Button variant="outline" size="sm">
            <Icon name="CheckSquare" size={16} className="mr-1" />
            Bulk Select
          </Button>
          <Button variant="outline" size="sm">
            <Icon name="Download" size={16} className="mr-1" />
            Export
          </Button>
        </div>

        {/* Map Settings */}
        <div className="border-l border-border pl-4">
          <Button variant="ghost" size="sm" title="Map Settings">
            <Icon name="Settings" size={16} />
          </Button>
        </div>
      </div>

      {/* Active Tool Indicator */}
      {activeTool && activeTool !== 'select' && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <Icon name="Info" size={14} />
              <span>
                {activeTool === 'draw' && 'Click to start drawing on the map'}
                {activeTool === 'measure' && 'Click points to measure distance'}
                {activeTool === 'polygon' && 'Draw a polygon to select multiple properties'}
                {activeTool === 'pan' && 'Drag to pan the map'}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleToolSelect('select')}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapToolbar;