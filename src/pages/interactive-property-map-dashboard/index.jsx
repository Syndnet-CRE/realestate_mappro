import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Sidebar from '../../components/Sidebar';
import MapView from '../../components/MapView';
import ChatPanel from '../../components/ChatPanel';

const InteractivePropertyMapDashboard = () => {
  const [queryResults, setQueryResults] = useState(null);

  const handleQueryResults = (geojson) => {
    setQueryResults(geojson);
  };

  return (
    <>
      <Helmet>
        <title>ScoutGPT | Real Estate Intelligence Platform</title>
        <meta name="description" content="AI-powered property analysis with interactive mapping and intelligent search." />
      </Helmet>

      {/* Three-Column Layout: Sidebar | Map | Chat */}
      <div className="flex h-screen bg-gray-950 overflow-hidden">
        {/* Left Sidebar - Fixed width */}
        <Sidebar />

        {/* Center Map - Flexes to fill space */}
        <div className="flex-1 relative">
          <MapView queryResults={queryResults} />
        </div>

        {/* Right Chat Panel - Fixed width */}
        <ChatPanel onQueryResults={handleQueryResults} />
      </div>
    </>
  );
};

export default InteractivePropertyMapDashboard;