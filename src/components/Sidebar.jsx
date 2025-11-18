import React, { useState, useEffect, useRef } from 'react';
import { Map, Database, Settings, Layers, Search, Upload, CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const Sidebar = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'success', 'error'
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type - accept more formats now
    const validTypes = ['.geojson', '.json', '.csv', '.zip', '.pdf', '.xlsx', '.xls', '.shp'];
    const fileExt = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!validTypes.includes(fileExt)) {
      setUploadStatus('error');
      setUploadMessage('Invalid file type. Please upload .geojson, .json, .csv, .zip, .pdf, .xlsx, or .shp files');
      setTimeout(() => setUploadStatus(null), 5000);
      return;
    }

    // Validate file size (350MB max)
    const maxSize = 350 * 1024 * 1024; // 350MB
    if (file.size > maxSize) {
      setUploadStatus('error');
      setUploadMessage('File too large. Maximum size is 350MB');
      setTimeout(() => setUploadStatus(null), 5000);
      return;
    }

    try {
      setUploadStatus('uploading');
      setUploadMessage(`Uploading ${file.name}...`);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        `${API_BASE_URL}/api/upload-data`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      setUploadStatus('success');
      const { processed } = response.data;
      let message = 'Success! ';
      if (processed.properties > 0) message += `${processed.properties} properties, `;
      if (processed.documents > 0) message += `${processed.documents} documents, `;
      if (processed.chunks > 0) message += `${processed.chunks} chunks`;
      setUploadMessage(message);

      // Clear success message after 10 seconds
      setTimeout(() => setUploadStatus(null), 10000);

      console.log('Upload response:', response.data);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus('error');
      setUploadMessage(
        err.response?.data?.detail || 'Upload failed. Please try again.'
      );
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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

      {/* Upload Section */}
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Upload Data
        </h3>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".geojson,.json,.csv,.zip,.pdf,.xlsx,.xls,.shp"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Drag and drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all ${
            isDragging
              ? 'border-teal-500 bg-teal-500/10'
              : uploadStatus === 'uploading'
              ? 'border-blue-500 bg-blue-500/5'
              : uploadStatus === 'success'
              ? 'border-green-500 bg-green-500/5'
              : uploadStatus === 'error'
              ? 'border-red-500 bg-red-500/5'
              : 'border-gray-700 bg-gray-900 hover:border-gray-600 hover:bg-gray-800'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            {uploadStatus === 'uploading' ? (
              <>
                <Loader className="w-6 h-6 text-blue-400 animate-spin" />
                <div className="text-xs text-blue-400 font-medium">
                  {uploadProgress}%
                </div>
              </>
            ) : uploadStatus === 'success' ? (
              <CheckCircle className="w-6 h-6 text-green-400" />
            ) : uploadStatus === 'error' ? (
              <XCircle className="w-6 h-6 text-red-400" />
            ) : (
              <Upload className="w-6 h-6 text-gray-400" />
            )}

            <div className="text-center">
              {uploadStatus && uploadMessage ? (
                <p
                  className={`text-xs font-medium ${
                    uploadStatus === 'uploading'
                      ? 'text-blue-400'
                      : uploadStatus === 'success'
                      ? 'text-green-400'
                      : uploadStatus === 'error'
                      ? 'text-red-400'
                      : 'text-gray-400'
                  }`}
                >
                  {uploadMessage}
                </p>
              ) : (
                <>
                  <p className="text-xs font-medium text-gray-300">
                    Drop files here
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    or click to browse
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    ZIP, PDF, CSV, GeoJSON, Excel, Shapefiles
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Datasets */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Datasets
          </h3>
          <Database className="w-4 h-4 text-gray-500" />
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
    </div>
  );
};

export default Sidebar;
