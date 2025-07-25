import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = () => {
  const location = useLocation();
  
  const pathMap = {
    '/interactive-property-map-dashboard': {
      title: 'Interactive Property Map',
      parent: null,
      section: 'Map Intelligence'
    },
    '/property-search-and-discovery-engine': {
      title: 'Property Search & Discovery',
      parent: null,
      section: 'Map Intelligence'
    },
    '/property-analysis-workbench': {
      title: 'Property Analysis Workbench',
      parent: null,
      section: 'Map Intelligence'
    },
    '/deal-room-management-hub': {
      title: 'Deal Room Management Hub',
      parent: null,
      section: 'Deal Management'
    },
    '/market-intelligence-dashboard': {
      title: 'Market Intelligence Dashboard',
      parent: null,
      section: 'Market Dashboard'
    },
    '/system-configuration-and-integration-hub': {
      title: 'System Configuration & Integration',
      parent: null,
      section: 'System Admin'
    }
  };

  const currentPath = pathMap[location.pathname];
  
  if (!currentPath) return null;

  const breadcrumbItems = [
    { title: 'Dashboard', path: '/', isHome: true },
    { title: currentPath.section, path: null, isSection: true },
    { title: currentPath.title, path: location.pathname, isCurrent: true }
  ];

  return (
    <nav className="flex items-center space-x-2 text-sm text-text-secondary mb-6" aria-label="Breadcrumb">
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <Icon name="ChevronRight" size={16} className="text-border" />
          )}
          
          {item.isHome ? (
            <Link
              to={item.path}
              className="flex items-center space-x-1 hover:text-text-primary transition-colors duration-150"
            >
              <Icon name="Home" size={14} />
              <span>{item.title}</span>
            </Link>
          ) : item.isCurrent ? (
            <span className="text-text-primary font-medium" aria-current="page">
              {item.title}
            </span>
          ) : item.isSection ? (
            <span className="text-text-secondary">
              {item.title}
            </span>
          ) : (
            <Link
              to={item.path}
              className="hover:text-text-primary transition-colors duration-150"
            >
              {item.title}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;