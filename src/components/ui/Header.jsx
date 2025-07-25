import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

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

  const isActiveSection = (items) => {
    return items.some(item => location.pathname === item.path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border shadow-elevation-1">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <Icon name="MapPin" size={20} color="white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-text-primary leading-tight">RealEstate</span>
            <span className="text-sm font-medium text-accent leading-tight">MapPro</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navigationItems.map((section, index) => (
            <div key={index} className="relative group">
              <button
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                  isActiveSection(section.items)
                    ? 'text-primary bg-primary/5' :'text-text-secondary hover:text-text-primary hover:bg-muted'
                }`}
              >
                <span>{section.label}</span>
                <Icon name="ChevronDown" size={16} />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-1 w-64 bg-popover border border-border rounded-lg shadow-elevation-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 ease-out">
                <div className="py-2">
                  {section.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 text-sm transition-colors duration-150 ${
                        location.pathname === item.path
                          ? 'text-primary bg-primary/5 border-r-2 border-primary' :'text-text-secondary hover:text-text-primary hover:bg-muted'
                      }`}
                    >
                      <Icon name={item.icon} size={16} />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        {/* User Context Panel */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Icon name="Bell" size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-error rounded-full"></span>
          </Button>

          {/* User Menu */}
          <div className="relative group">
            <Button variant="ghost" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <span className="hidden md:block text-sm font-medium text-text-primary">John Analyst</span>
              <Icon name="ChevronDown" size={16} />
            </Button>
            
            {/* User Dropdown */}
            <div className="absolute top-full right-0 mt-1 w-48 bg-popover border border-border rounded-lg shadow-elevation-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 ease-out">
              <div className="py-2">
                <div className="px-4 py-2 border-b border-border">
                  <p className="text-sm font-medium text-text-primary">John Analyst</p>
                  <p className="text-xs text-text-secondary">Investment Analyst</p>
                </div>
                <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-muted transition-colors duration-150">
                  <Icon name="User" size={16} />
                  <span>Profile</span>
                </button>
                <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-muted transition-colors duration-150">
                  <Icon name="Settings" size={16} />
                  <span>Settings</span>
                </button>
                <div className="border-t border-border mt-2 pt-2">
                  <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-error hover:bg-error/5 transition-colors duration-150">
                    <Icon name="LogOut" size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleMobileMenu}
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-surface border-t border-border">
          <div className="px-4 py-4 space-y-4">
            {navigationItems.map((section, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-sm font-semibold text-text-primary px-2">{section.label}</h3>
                <div className="space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      to={item.path}
                      className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors duration-150 ${
                        location.pathname === item.path
                          ? 'text-primary bg-primary/5' :'text-text-secondary hover:text-text-primary hover:bg-muted'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
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
      )}
    </header>
  );
};

export default Header;