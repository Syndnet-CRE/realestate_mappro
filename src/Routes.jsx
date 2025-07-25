import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
// Add your imports here
import InteractivePropertyMapDashboard from "pages/interactive-property-map-dashboard";
import MarketIntelligenceDashboard from "pages/market-intelligence-dashboard";
import SystemConfigurationAndIntegrationHub from "pages/system-configuration-and-integration-hub";
import PropertyAnalysisWorkbench from "pages/property-analysis-workbench";
import DealRoomManagementHub from "pages/deal-room-management-hub";
import PropertySearchAndDiscoveryEngine from "pages/property-search-and-discovery-engine";
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your routes here */}
        <Route path="/" element={<InteractivePropertyMapDashboard />} />
        <Route path="/interactive-property-map-dashboard" element={<InteractivePropertyMapDashboard />} />
        <Route path="/market-intelligence-dashboard" element={<MarketIntelligenceDashboard />} />
        <Route path="/system-configuration-and-integration-hub" element={<SystemConfigurationAndIntegrationHub />} />
        <Route path="/property-analysis-workbench" element={<PropertyAnalysisWorkbench />} />
        <Route path="/deal-room-management-hub" element={<DealRoomManagementHub />} />
        <Route path="/property-search-and-discovery-engine" element={<PropertySearchAndDiscoveryEngine />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;