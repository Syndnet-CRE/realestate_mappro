import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const MapView = ({ queryResults }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [layers, setLayers] = useState([]);
  const [resultCount, setResultCount] = useState(0);

  useEffect(() => {
    if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your-mapbox-token-here') {
      console.warn('Mapbox token not set. Please set VITE_MAPBOX_TOKEN in .env');
      return;
    }

    if (map.current) return; // Initialize map only once

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-122.4194, 37.7749], // San Francisco
      zoom: 12,
      pitch: 45,
      bearing: 0,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add scale control
    map.current.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'imperial',
      }),
      'bottom-right'
    );

    map.current.on('load', () => {
      setMapLoaded(true);
      fetchAndLoadLayers();
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  const fetchAndLoadLayers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/layers`);
      const layersData = response.data || [];
      setLayers(layersData);

      // Load the first layer as an example
      if (layersData.length > 0) {
        const firstLayer = layersData[0];
        loadGeoJSONLayer(firstLayer);
      }
    } catch (err) {
      console.error('Error fetching layers:', err);
      // Add a demo layer for visualization
      addDemoLayer();
    }
  };

  const loadGeoJSONLayer = async (layer) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/layers/${layer.id}/features`);
      const geojsonData = response.data;

      if (!map.current.getSource(layer.name)) {
        map.current.addSource(layer.name, {
          type: 'geojson',
          data: geojsonData,
        });

        // Add fill layer for polygons
        map.current.addLayer({
          id: `${layer.name}-fill`,
          type: 'fill',
          source: layer.name,
          paint: {
            'fill-color': '#0ea5e9',
            'fill-opacity': 0.3,
          },
        });

        // Add outline layer
        map.current.addLayer({
          id: `${layer.name}-outline`,
          type: 'line',
          source: layer.name,
          paint: {
            'line-color': '#14b8a6',
            'line-width': 2,
          },
        });
      }
    } catch (err) {
      console.error(`Error loading layer ${layer.name}:`, err);
    }
  };

  const addDemoLayer = () => {
    // Add a demo polygon for visualization if no layers are available
    if (!map.current) return;

    const demoGeoJSON = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [-122.42, 37.78],
                [-122.42, 37.77],
                [-122.41, 37.77],
                [-122.41, 37.78],
                [-122.42, 37.78],
              ],
            ],
          },
          properties: {
            name: 'Demo Parcel',
          },
        },
      ],
    };

    if (!map.current.getSource('demo-layer')) {
      map.current.addSource('demo-layer', {
        type: 'geojson',
        data: demoGeoJSON,
      });

      map.current.addLayer({
        id: 'demo-layer-fill',
        type: 'fill',
        source: 'demo-layer',
        paint: {
          'fill-color': '#14b8a6',
          'fill-opacity': 0.4,
        },
      });

      map.current.addLayer({
        id: 'demo-layer-outline',
        type: 'line',
        source: 'demo-layer',
        paint: {
          'line-color': '#0ea5e9',
          'line-width': 2,
        },
      });
    }
  };

  // Effect to display query results on map
  useEffect(() => {
    console.log('🗺️ MapView received queryResults:', queryResults);
    console.log('🗺️ Map loaded:', mapLoaded);
    console.log('🗺️ Map current:', !!map.current);

    if (!map.current || !mapLoaded || !queryResults) {
      console.log('⚠️ Not rendering results - missing:', {
        hasMap: !!map.current,
        mapLoaded,
        hasQueryResults: !!queryResults
      });
      return;
    }

    console.log('✅ Rendering query results on map!', queryResults.features?.length, 'features');

    const SOURCE_ID = 'query-results';
    const LAYER_ID = 'query-results-layer';
    const LAYER_LABEL_ID = 'query-results-labels';

    // Remove existing layers and source
    if (map.current.getLayer(LAYER_LABEL_ID)) {
      map.current.removeLayer(LAYER_LABEL_ID);
    }
    if (map.current.getLayer(LAYER_ID)) {
      map.current.removeLayer(LAYER_ID);
    }
    if (map.current.getSource(SOURCE_ID)) {
      map.current.removeSource(SOURCE_ID);
    }

    // Add new source with query results
    map.current.addSource(SOURCE_ID, {
      type: 'geojson',
      data: queryResults
    });

    // Detect if we have points or polygons
    const hasPolygons = queryResults.features.some(f =>
      f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'
    );

    if (hasPolygons) {
      // Add fill layer for polygons (flood zones, parcels, etc.)
      map.current.addLayer({
        id: LAYER_ID,
        type: 'fill',
        source: SOURCE_ID,
        filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
        paint: {
          'fill-color': [
            'match',
            ['get', 'flood_risk'],
            'High', '#ef4444',      // red for high risk
            'Moderate', '#f59e0b',  // orange for moderate
            'Low', '#10b981',       // green for low
            '#14b8a6'               // default teal
          ],
          'fill-opacity': 0.3
        }
      });

      // Add outline layer for polygons
      map.current.addLayer({
        id: `${LAYER_ID}-outline`,
        type: 'line',
        source: SOURCE_ID,
        filter: ['in', ['geometry-type'], ['literal', ['Polygon', 'MultiPolygon']]],
        paint: {
          'line-color': [
            'match',
            ['get', 'flood_risk'],
            'High', '#dc2626',
            'Moderate', '#ea580c',
            'Low', '#059669',
            '#14b8a6'
          ],
          'line-width': 2
        }
      });
    } else {
      // Add circle layer for points (POIs, buildings, etc.)
      map.current.addLayer({
        id: LAYER_ID,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['==', ['geometry-type'], 'Point'],
        paint: {
          'circle-radius': 8,
          'circle-color': '#14b8a6', // teal
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff'
        }
      });

      // Add labels layer for points
      map.current.addLayer({
        id: LAYER_LABEL_ID,
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['==', ['geometry-type'], 'Point'],
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
          'text-size': 12
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#000000',
          'text-halo-width': 1
        }
      });
    }

    // Fit map to show all results
    if (queryResults.features && queryResults.features.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      queryResults.features.forEach(feature => {
        if (feature.geometry.type === 'Point') {
          bounds.extend(feature.geometry.coordinates);
        } else if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates[0].forEach(coord => bounds.extend(coord));
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach(polygon => {
            polygon[0].forEach(coord => bounds.extend(coord));
          });
        }
      });

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: hasPolygons ? 12 : 15,
          duration: 1000
        });
      }

      setResultCount(queryResults.features.length);
    }

    // Add click handler for popups
    map.current.on('click', LAYER_ID, (e) => {
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: [LAYER_ID]
      });

      if (!features.length) return;

      const feature = features[0];
      const props = feature.properties;

      // Popup content varies based on feature type
      let popupHTML = '<div class="p-3 max-w-sm">';

      if (props.avm_value !== undefined || props.bedrooms !== undefined) {
        // ATTOM property popup
        const formatCurrency = (val) => val ? `$${val.toLocaleString()}` : 'N/A';
        const formatNumber = (val) => val || 'N/A';

        popupHTML += `
          <h3 class="font-bold text-gray-900 text-base mb-2">${props.address || 'Property'}</h3>
          <p class="text-xs text-gray-500 mb-3">${props.city || ''}, ${props.state || 'TX'} ${props.zip_code || ''}</p>

          ${props.avm_value ? `
            <div class="mb-3 pb-3 border-b border-gray-200">
              <p class="text-xs font-semibold text-gray-700 uppercase mb-1">Estimated Value (AVM)</p>
              <p class="text-lg font-bold text-teal-600">${formatCurrency(props.avm_value)}</p>
              ${props.avm_low && props.avm_high ? `
                <p class="text-xs text-gray-500">Range: ${formatCurrency(props.avm_low)} - ${formatCurrency(props.avm_high)}</p>
              ` : ''}
            </div>
          ` : ''}

          <div class="grid grid-cols-2 gap-2 mb-3 text-xs">
            ${props.bedrooms !== null && props.bedrooms !== undefined ? `
              <div>
                <p class="text-gray-500">Beds</p>
                <p class="font-semibold text-gray-900">${props.bedrooms}</p>
              </div>
            ` : ''}
            ${props.bathrooms !== null && props.bathrooms !== undefined ? `
              <div>
                <p class="text-gray-500">Baths</p>
                <p class="font-semibold text-gray-900">${props.bathrooms}</p>
              </div>
            ` : ''}
            ${props.square_feet ? `
              <div>
                <p class="text-gray-500">Sqft</p>
                <p class="font-semibold text-gray-900">${formatNumber(props.square_feet)}</p>
              </div>
            ` : ''}
            ${props.year_built ? `
              <div>
                <p class="text-gray-500">Built</p>
                <p class="font-semibold text-gray-900">${props.year_built}</p>
              </div>
            ` : ''}
          </div>

          ${props.property_type ? `
            <p class="text-xs text-gray-600 mb-2"><span class="font-medium">Type:</span> ${props.property_type}</p>
          ` : ''}

          ${props.assessed_total_value ? `
            <p class="text-xs text-gray-600 mb-2"><span class="font-medium">Tax Assessment:</span> ${formatCurrency(props.assessed_total_value)}</p>
          ` : ''}

          ${props.sale_price ? `
            <p class="text-xs text-gray-600 mb-2"><span class="font-medium">Last Sale:</span> ${formatCurrency(props.sale_price)}</p>
          ` : ''}

          ${props.flood_zone ? `
            <div class="mt-3 pt-3 border-t border-gray-200">
              <p class="text-xs">
                <span class="font-medium text-gray-700">Flood Zone:</span>
                <span class="${props.flood_risk === 'High' ? 'text-red-600' : props.flood_risk === 'Moderate' ? 'text-orange-600' : 'text-green-600'} font-semibold">
                  ${props.flood_zone} (${props.flood_risk || 'Unknown'} Risk)
                </span>
              </p>
            </div>
          ` : ''}

          ${props.owner_name ? `
            <p class="text-xs text-gray-500 mt-2">Owner: ${props.owner_name}</p>
          ` : ''}
        `;
      } else if (props.flood_risk && !props.avm_value) {
        // Flood zone popup (standalone, not property-linked)
        popupHTML += `
          <h3 class="font-semibold text-gray-900">Flood Zone ${props.FLD_ZONE || 'Unknown'}</h3>
          <p class="text-sm font-medium ${props.flood_risk === 'High' ? 'text-red-600' : props.flood_risk === 'Moderate' ? 'text-orange-600' : 'text-green-600'}">
            ${props.flood_risk} Risk
          </p>
          ${props.description ? `<p class="text-sm text-gray-600 mt-1">${props.description}</p>` : ''}
        `;
      } else {
        // POI/Building popup
        popupHTML += `
          <h3 class="font-semibold text-gray-900">${props.name || 'Unnamed'}</h3>
          <p class="text-sm text-gray-600">${props.type || ''}</p>
          ${props.address ? `<p class="text-sm text-gray-600">${props.address}</p>` : ''}
        `;
      }

      popupHTML += '</div>';

      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(popupHTML)
        .addTo(map.current);
    });

    // Change cursor on hover
    map.current.on('mouseenter', LAYER_ID, () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', LAYER_ID, () => {
      map.current.getCanvas().style.cursor = '';
    });

  }, [queryResults, mapLoaded]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      {(!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your-mapbox-token-here') && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-95">
          <div className="text-center p-8 max-w-md">
            <div className="text-red-400 text-lg font-semibold mb-2">
              Mapbox Token Required
            </div>
            <div className="text-gray-400 text-sm">
              Please set VITE_MAPBOX_TOKEN in your .env file to use the map.
            </div>
          </div>
        </div>
      )}

      {mapLoaded && (
        <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-400">
            {resultCount > 0 ? (
              <span className="text-teal-400 font-semibold">{resultCount} results found</span>
            ) : (
              <span>{layers.length} layer{layers.length !== 1 ? 's' : ''} loaded</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
