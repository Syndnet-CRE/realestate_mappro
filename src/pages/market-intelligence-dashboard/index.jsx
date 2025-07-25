import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import QuickActionToolbar from '../../components/ui/QuickActionToolbar';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import MarketOverviewCard from './components/MarketOverviewCard';
import MarketTrendChart from './components/MarketTrendChart';
import OpportunityHeatMap from './components/OpportunityHeatMap';
import AlertsPanel from './components/AlertsPanel';
import PortfolioPerformanceWidget from './components/PortfolioPerformanceWidget';
import MarketComparison from './components/MarketComparison';

const MarketIntelligenceDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6_months');
  const [selectedRegion, setSelectedRegion] = useState('all_regions');
  const [dashboardLayout, setDashboardLayout] = useState('default');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const timeframeOptions = [
    { value: '1_month', label: 'Last Month' },
    { value: '3_months', label: 'Last 3 Months' },
    { value: '6_months', label: 'Last 6 Months' },
    { value: '12_months', label: 'Last 12 Months' },
    { value: '24_months', label: 'Last 24 Months' }
  ];

  const regionOptions = [
    { value: 'all_regions', label: 'All Regions' },
    { value: 'downtown_core', label: 'Downtown Core' },
    { value: 'tech_quarter', label: 'Tech Quarter' },
    { value: 'riverside_district', label: 'Riverside District' },
    { value: 'waterfront', label: 'Waterfront' },
    { value: 'university_area', label: 'University Area' }
  ];

  const layoutOptions = [
    { value: 'default', label: 'Default Layout' },
    { value: 'executive', label: 'Executive View' },
    { value: 'analyst', label: 'Analyst View' },
    { value: 'regional', label: 'Regional Manager View' }
  ];

  // Mock data for charts
  const marketTrendData = [
    { month: 'Jan', value: 785000 },
    { month: 'Feb', value: 812000 },
    { month: 'Mar', value: 798000 },
    { month: 'Apr', value: 825000 },
    { month: 'May', value: 847000 },
    { month: 'Jun', value: 863000 }
  ];

  const volumeTrendData = [
    { month: 'Jan', value: 245 },
    { month: 'Feb', value: 268 },
    { month: 'Mar', value: 234 },
    { month: 'Apr', value: 289 },
    { month: 'May', value: 312 },
    { month: 'Jun', value: 298 }
  ];

  const overviewCards = [
    {
      title: 'Market Value',
      value: '$863M',
      change: '+2.1%',
      changeType: 'positive',
      icon: 'DollarSign',
      trend: 78
    },
    {
      title: 'Active Listings',
      value: '1,247',
      change: '-5.3%',
      changeType: 'negative',
      icon: 'Home',
      trend: 65
    },
    {
      title: 'Avg Days on Market',
      value: '28 days',
      change: '-12%',
      changeType: 'positive',
      icon: 'Calendar',
      trend: 45
    },
    {
      title: 'Price per Sq Ft',
      value: '$425',
      change: '+8.7%',
      changeType: 'positive',
      icon: 'Square',
      trend: 82
    }
  ];

  const quickActions = [
    { icon: 'Search', label: 'Property Search', path: '/property-search-and-discovery-engine' },
    { icon: 'Map', label: 'Interactive Map', path: '/interactive-property-map-dashboard' },
    { icon: 'BarChart3', label: 'Analysis Tools', path: '/property-analysis-workbench' },
    { icon: 'Briefcase', label: 'Deal Rooms', path: '/deal-room-management-hub' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading market intelligence...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb />
          
          {/* Dashboard Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Market Intelligence Dashboard</h1>
              <p className="text-text-secondary">
                Real-time market insights and performance analytics for informed investment decisions
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              <Select
                options={timeframeOptions}
                value={selectedTimeframe}
                onChange={setSelectedTimeframe}
                className="w-40"
              />
              <Select
                options={regionOptions}
                value={selectedRegion}
                onChange={setSelectedRegion}
                className="w-40"
              />
              <Select
                options={layoutOptions}
                value={dashboardLayout}
                onChange={setDashboardLayout}
                className="w-48"
              />
              <Button variant="outline" iconName="Download" iconSize={16}>
                Export
              </Button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="p-4 bg-card border border-border rounded-lg hover:shadow-elevation-2 transition-all duration-150 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-150">
                    <Icon name={action.icon} size={20} className="text-primary" />
                  </div>
                  <span className="font-medium text-text-primary">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Market Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {overviewCards.map((card, index) => (
              <MarketOverviewCard
                key={index}
                title={card.title}
                value={card.value}
                change={card.change}
                changeType={card.changeType}
                icon={card.icon}
                trend={card.trend}
              />
            ))}
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Market Trends */}
            <div className="lg:col-span-2 space-y-6">
              <MarketTrendChart
                title="Market Value Trends"
                data={marketTrendData}
                type="area"
                height={320}
              />
              <MarketTrendChart
                title="Transaction Volume"
                data={volumeTrendData}
                type="line"
                height={280}
              />
            </div>

            {/* Alerts Panel */}
            <div>
              <AlertsPanel />
            </div>
          </div>

          {/* Opportunity Heat Map */}
          <div className="mb-8">
            <OpportunityHeatMap />
          </div>

          {/* Portfolio Performance and Market Comparison */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <PortfolioPerformanceWidget />
            <MarketComparison />
          </div>

          {/* Market Insights Summary */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Market Insights Summary</h3>
              <Button variant="ghost" size="sm" iconName="RefreshCw" iconSize={16}>
                Refresh
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-text-primary">Key Trends</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-center space-x-2">
                    <Icon name="TrendingUp" size={14} className="text-success" />
                    <span>Tech Quarter showing 15.8% growth</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Icon name="TrendingUp" size={14} className="text-success" />
                    <span>University Area demand increasing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Icon name="AlertTriangle" size={14} className="text-warning" />
                    <span>Downtown inventory levels low</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-text-primary">Opportunities</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-center space-x-2">
                    <Icon name="Target" size={14} className="text-primary" />
                    <span>24 off-market properties identified</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Icon name="Target" size={14} className="text-primary" />
                    <span>Waterfront undervalued by 12%</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Icon name="Target" size={14} className="text-primary" />
                    <span>Industrial zone expansion potential</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-text-primary">Recommendations</h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={14} className="text-success" />
                    <span>Focus on Tech Quarter acquisitions</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={14} className="text-success" />
                    <span>Monitor Riverside District closely</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={14} className="text-success" />
                    <span>Consider mixed-use developments</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <QuickActionToolbar />
    </div>
  );
};

export default MarketIntelligenceDashboard;