import React, { useState, useRef } from 'react';
import { Upload, X, File, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const FileUploadModal = ({ isOpen, onClose, onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

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
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const validTypes = ['.csv', '.geojson', '.json', '.xlsx', '.xls', '.pdf', '.zip'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();

    if (validTypes.includes(fileExt)) {
      setSelectedFile(file);
      setUploadStatus(null);
      setUploadMessage('');
    } else {
      setUploadStatus('error');
      setUploadMessage(`Invalid file type. Supported: ${validTypes.join(', ')}`);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/upload-data`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadStatus('success');
      setUploadMessage(response.data.message || 'File uploaded successfully!');

      // Call callback after 1.5 seconds
      setTimeout(() => {
        if (onUploadComplete) onUploadComplete();
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadStatus('error');
      setUploadMessage(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Upload failed. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploadStatus(null);
    setUploadMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-lg w-full border border-gray-800 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Upload Property Data</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-teal-500 bg-teal-500/10'
                : 'border-gray-700 hover:border-gray-600 bg-gray-800/50'
            }`}
          >
            <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-teal-400' : 'text-gray-400'}`} />
            <p className="text-gray-200 font-medium mb-2">
              {selectedFile ? selectedFile.name : 'Drop files here or click to browse'}
            </p>
            <p className="text-sm text-gray-400">
              Supported: CSV, GeoJSON, Excel, PDF, ZIP
            </p>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInputChange}
            accept=".csv,.geojson,.json,.xlsx,.xls,.pdf,.zip"
            className="hidden"
          />

          {/* File Info */}
          {selectedFile && (
            <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
              <File className="w-5 h-5 text-teal-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              {!uploading && uploadStatus !== 'success' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Status Message */}
          {uploadMessage && (
            <div
              className={`flex items-start gap-3 p-3 rounded-lg ${
                uploadStatus === 'success'
                  ? 'bg-teal-500/10 border border-teal-500/20'
                  : 'bg-red-500/10 border border-red-500/20'
              }`}
            >
              {uploadStatus === 'success' ? (
                <Check className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${uploadStatus === 'success' ? 'text-teal-100' : 'text-red-100'}`}>
                {uploadMessage}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-800">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading || uploadStatus === 'success'}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </>
            ) : uploadStatus === 'success' ? (
              <>
                <Check className="w-4 h-4" />
                Uploaded
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
