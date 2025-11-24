import React, { useState, useEffect } from 'react';
import { Map, Database, Settings, Layers, Search, Upload } from 'lucide-react';
import axios from 'axios';
import FileUploadModal from './FileUploadModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const Sidebar = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/datasets`);
      setDatasets(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching datasets:', err);
      setError('Failed to load datasets');
      // Set placeholder data for demo
      setDatasets([
        { id: 1, name: 'SF Parcels', status: 'ready' },
        { id: 2, name: 'Zoning Data', status: 'processing' },
        { id: 3, name: 'OSM Buildings', status: 'ready' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { icon: Map, label: 'Map', active: true },
    { icon: Search, label: 'Search', active: false },
    { icon: Layers, label: 'Layers', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <div className="w-60 h-screen bg-gray-950 border-r border-gray-800 flex flex-col">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Map className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-semibold text-white">ScoutGPT</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-gray-800">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                item.active
                  ? 'bg-teal-500/10 text-teal-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Datasets */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Datasets
          </h3>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors group"
            title="Upload data"
          >
            <Upload className="w-4 h-4 text-gray-500 group-hover:text-teal-400" />
          </button>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-400">{error}</div>
        ) : (
          <div className="space-y-2">
            {datasets.map((dataset) => (
              <div
                key={dataset.id}
                className="p-3 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-200 font-medium">
                    {dataset.name}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    dataset.status === 'ready'
                      ? 'bg-teal-500'
                      : 'bg-yellow-500 animate-pulse'
                  }`} />
                </div>
                <div className="text-xs text-gray-500 mt-1 capitalize">
                  {dataset.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="text-xs text-gray-500">
          v1.0.0 · {datasets.length} datasets
        </div>
      </div>

      {/* Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={() => {
          fetchDatasets(); // Refresh datasets after upload
        }}
      />
    </div>
  );
};

export default Sidebar;
