import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const InteractiveMap = ({
  activeLayers,
  activeFilters,
  activeTool,
  onPropertySelect,
  selectedProperty, meta
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [hoveredProperty, setHoveredProperty] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [tokenValid, setTokenValid] = useState(true);
  const markersRef = useRef([]);

  // Use the provided Mapbox access token directly
  const getMapboxToken = () => {
    const token = 'pk.eyJ1IjoiYnJhZHlpcndpbiIsImEiOiJjbHhoMHdnengxOWNoMnFwdDl3OHJzMjdnIn0.h1jF3M0Xq5ufU2klu3V5Tw';
    return token;
  };

  // Validate token format
  const validateToken = (token) => {
    if (!token) return false;
    // Mapbox tokens start with 'pk.' for public tokens
    return token.startsWith('pk.') && token.length > 10;
  };

  // Mock property data with Austin coordinates
  const mockProperties = [
  {
    id: 1,
    lng: -97.7431,
    lat: 30.2672,
    address: "1247 Oak Street, Austin, TX 78701",
    price: 875000,
    sqft: 2400,
    type: "Single Family",
    status: "Off-Market",
    cluster: false
  },
  {
    id: 2,
    lng: -97.7381,
    lat: 30.2682,
    address: "3456 Commerce Blvd, Austin, TX 78701",
    price: 1250000,
    sqft: 4800,
    type: "Commercial",
    status: "Listed",
    cluster: false
  },
  {
    id: 3,
    lng: -97.7481,
    lat: 30.2662,
    address: "789 Industrial Way, Austin, TX 78701",
    price: 2100000,
    sqft: 12000,
    type: "Industrial",
    status: "Under Contract",
    cluster: false
  },
  {
    id: 4,
    lng: -97.7331,
    lat: 30.2652,
    address: "456 Residential Ave, Austin, TX 78701",
    price: 650000,
    sqft: 1800,
    type: "Single Family",
    status: "Off-Market",
    cluster: false
  },
  {
    id: 5,
    lng: -97.7431,
    lat: 30.2632,
    address: "321 Mixed Use Blvd, Austin, TX 78701",
    price: 1800000,
    sqft: 8500,
    type: "Mixed Use",
    status: "Listed",
    cluster: false
  },
  {
    id: 6,
    lng: -97.7281,
    lat: 30.2692,
    address: "987 Corporate Plaza, Austin, TX 78701",
    price: 1500000,
    sqft: 6200,
    type: "Commercial",
    status: "Listed",
    cluster: false
  },
  {
    id: 7,
    lng: -97.7531,
    lat: 30.2622,
    address: "654 Warehouse District, Austin, TX 78701",
    price: 950000,
    sqft: 3200,
    type: "Industrial",
    status: "Off-Market",
    cluster: false
  },
  {
    id: 8,
    lng: -97.7231,
    lat: 30.2662,
    address: "741 Residential Square, Austin, TX 78701",
    price: 720000,
    sqft: 2100,
    type: "Single Family",
    status: "Under Contract",
    cluster: false
  }];


  const getPropertyColor = (property) => {
    switch (property.status) {
      case 'Off-Market':return '#2563eb'; // blue-600
      case 'Listed':return '#16a34a'; // green-600
      case 'Under Contract':return '#ea580c'; // orange-600
      default:return '#6b7280'; // gray-500
    }
  };

  const getPropertyIcon = (property) => {
    switch (property.type) {
      case 'Single Family':return 'Home';
      case 'Commercial':return 'Building';
      case 'Industrial':return 'Factory';
      case 'Mixed Use':return 'Building2';
      default:return 'MapPin';
    }
  };

  const createMarkerElement = (property) => {
    const el = document.createElement('div');
    el.className = 'property-marker';
    el.style.cssText = `
      width: 32px;
      height: 32px;
      background-color: ${getPropertyColor(property)};
      border: 2px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      z-index: 10;
    `;

    // Add icon using a simple approach
    el.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        ${property.type === 'Single Family' ? '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>' :
    '<path d="M6 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><rect x="8" y="6" width="4" height="2"/><rect x="8" y="10" width="4" height="2"/><rect x="8" y="14" width="4" height="2"/>'}
      </svg>
    `;


    // Add hover effects
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.1)';
      el.style.zIndex = '20';
      setHoveredProperty(property);
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.zIndex = '10';
      setHoveredProperty(null);
    });

    // Add click handler
    el.addEventListener('click', () => {
      onPropertySelect?.(property);
    });

    return el;
  };

  const addPropertyMarkers = () => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    const visibleProperties = mockProperties.filter((property) =>
    activeLayers?.includes('properties') !== false
    );

    visibleProperties.forEach((property) => {
      const el = createMarkerElement(property);

      const marker = new mapboxgl.Marker(el).
      setLngLat([property.lng, property.lat]).
      addTo(map.current);

      markersRef.current.push(marker);
    });
  };

  const initializeMap = () => {
    const token = getMapboxToken();

    if (!token) {
      setMapError('Mapbox access token is not configured.');
      setTokenValid(false);
      return;
    }

    if (!validateToken(token)) {
      setMapError('Invalid Mapbox access token format. Please check your token and try again.');
      setTokenValid(false);
      return;
    }

    // Set the access token
    mapboxgl.accessToken = token;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/bradyirwin/cmabvzjn0005601qu8k7f7o5w', // Using the provided custom style
        center: [-97.7431, 30.2672], // Austin, TX
        zoom: 12,
        pitch: 0,
        bearing: 0
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        setMapError(null);
        setTokenValid(true);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        if (e.error?.message?.includes('token')) {
          setMapError('Invalid Mapbox access token. Please check your token and try again.');
          setTokenValid(false);
        } else {
          setMapError('Failed to load map. Please check your internet connection and try again.');
        }
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    } catch (error) {
      console.error('Map initialization error:', error);
      setMapError('Failed to initialize map. Please check your configuration and try again.');
      setTokenValid(false);
    }
  };

  useEffect(() => {
    if (map.current) return; // Initialize map only once
    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapLoaded) {
      addPropertyMarkers();
    }
  }, [mapLoaded, activeLayers]);

  useEffect(() => {
    if (map.current && selectedProperty) {
      map.current.flyTo({
        center: [selectedProperty.lng, selectedProperty.lat],
        zoom: 15,
        duration: 1000
      });
    }
  }, [selectedProperty]);

  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  const handleFitBounds = () => {
    if (map.current) {
      const bounds = new mapboxgl.LngLatBounds();
      mockProperties.forEach((property) => {
        bounds.extend([property.lng, property.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  };

  const handleRetryMap = () => {
    setMapError(null);
    setTokenValid(true);
    setMapLoaded(false);

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    setTimeout(() => {
      initializeMap();
    }, 100);
  };

  const toggleSidePanel = () => {
    setShowSidePanel(!showSidePanel);
  };

  const handleLayerToggle = (layerName) => {
    console.log('Layer toggled:', layerName);
    // Trigger re-render of markers
    if (layerName === 'properties') {
      setTimeout(() => addPropertyMarkers(), 100);
    }
  };

  const visibleProperties = mockProperties.filter((property) =>
  activeLayers?.includes('properties') !== false
  );

  // Render error state
  if (mapError || !tokenValid) {
    return (
      <div className="relative w-full h-full bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="mb-4">
            <Icon name="AlertTriangle" size={48} className="text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Configuration Error</h3>
            <p className="text-gray-600 text-sm mb-4">{mapError}</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-yellow-800 mb-2">Map Configuration:</h4>
            <p className="text-sm text-yellow-700 text-left">
              The map is configured with a custom Mapbox token and style. If you're seeing this error, 
              there may be an issue with the token or network connectivity.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleRetryMap}
              className="flex items-center space-x-2">
              <Icon name="RefreshCw" size={16} />
              <span>Retry</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://docs.mapbox.com/api/overview/#access-tokens-and-token-scopes', '_blank')}>
              <Icon name="ExternalLink" size={16} className="mr-2" />
              View Documentation
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-background overflow-hidden">
      {/* Map Container */}
      <div
        ref={mapContainer}
        className={`absolute inset-0 transition-all duration-300 ${
        showSidePanel ? 'right-80' : 'right-0'}`
        }
        style={{
          left: 0,
          top: 0,
          bottom: 0,
          right: showSidePanel ? '320px' : '0',
          width: showSidePanel ? 'calc(100% - 320px)' : '100%',
          height: '100%'
        }} />

      {/* Loading Indicator */}
      {!mapLoaded && !mapError &&
      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      }

      {/* Side Panel Toggle Button */}
      <Button
        variant="secondary"
        size="icon"
        onClick={toggleSidePanel}
        className={`absolute top-4 z-50 bg-white shadow-lg transition-all duration-300 ${
        showSidePanel ? 'right-84' : 'right-4'}`
        }
        title={showSidePanel ? 'Hide Panel' : 'Show Panel'}>

        <Icon name={showSidePanel ? "ChevronRight" : "ChevronLeft"} size={16} />
      </Button>

      {/* Map Controls */}
      <div className="absolute top-16 right-4 flex flex-col space-y-2 z-40">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          className="bg-white shadow-lg"
          title="Zoom In"
          disabled={!mapLoaded}>

          <Icon name="Plus" size={16} />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          className="bg-white shadow-lg"
          title="Zoom Out"
          disabled={!mapLoaded}>

          <Icon name="Minus" size={16} />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleFitBounds}
          className="bg-white shadow-lg"
          title="Fit to Bounds"
          disabled={!mapLoaded}>

          <Icon name="Maximize2" size={16} />
        </Button>
      </div>

      {/* Toggleable Side Panel */}
      <div className={`absolute top-0 right-0 h-full w-80 bg-white border-l border-gray-200 shadow-lg transform transition-transform duration-300 z-30 ${
      showSidePanel ? 'translate-x-0' : 'translate-x-full'}`
      }>
        <div className="p-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Map Layers</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidePanel}
              className="text-gray-500 hover:text-gray-700">

              <Icon name="X" size={16} />
            </Button>
          </div>
          
          {/* Layer Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Property Markers</label>
              <input
                type="checkbox"
                defaultChecked
                className="rounded"
                onChange={(e) => handleLayerToggle('properties')} />

            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Heat Map</label>
              <input type="checkbox" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">School Districts</label>
              <input type="checkbox" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Transit Lines</label>
              <input type="checkbox" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Zoning</label>
              <input type="checkbox" className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-600">Demographics</label>
              <input type="checkbox" className="rounded" />
            </div>
          </div>

          {/* Property Legend */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Property Status</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span>Off-Market</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span>Listed</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                <span>Under Contract</span>
              </div>
            </div>
          </div>

          {/* Property Count */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-900">
              {visibleProperties.length} Properties Visible
            </div>
            <div className="text-xs text-gray-500 mt-1">
              In current map view
            </div>
          </div>

          {/* Map Tools */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Map Tools</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="text-xs"
                disabled={!mapLoaded}>

                <Icon name="Plus" size={14} className="mr-1" />
                Zoom In
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="text-xs"
                disabled={!mapLoaded}>

                <Icon name="Minus" size={14} className="mr-1" />
                Zoom Out
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFitBounds}
                className="text-xs"
                disabled={!mapLoaded}>

                <Icon name="Compass" size={14} className="mr-1" />
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFitBounds}
                className="text-xs"
                disabled={!mapLoaded}>

                <Icon name="Maximize2" size={14} className="mr-1" />
                Fit All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Property Tooltip */}
      {hoveredProperty &&
      <div
        className="absolute z-50 pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -120%)'
        }}>

          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 whitespace-nowrap mb-2">
            <div className="text-sm font-medium text-gray-900">
              {hoveredProperty.address}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              ${hoveredProperty.price?.toLocaleString()} • {hoveredProperty.sqft?.toLocaleString()} sq ft
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {hoveredProperty.type} • {hoveredProperty.status}
            </div>
          </div>
        </div>
      }

      {/* Active Tool Indicator */}
      {activeTool && activeTool !== 'select' &&
      <div className="absolute top-4 left-4 z-40">
          <div className="bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <Icon
              name={
              activeTool === 'draw' ? 'Edit3' :
              activeTool === 'measure' ? 'Ruler' :
              activeTool === 'polygon' ? 'Pentagon' : 'Move'
              }
              size={16} />

              <span className="text-sm font-medium capitalize">{activeTool} Mode</span>
            </div>
          </div>
        </div>
      }
    </div>
  );
};

export default InteractiveMap;