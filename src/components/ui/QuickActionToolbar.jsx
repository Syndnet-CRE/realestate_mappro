import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const QuickActionToolbar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const getActionsForPath = (pathname) => {
    switch (pathname) {
      case '/interactive-property-map-dashboard':
        return [
          { icon: 'Search', label: 'Quick Search', shortcut: 'Ctrl+K', primary: true },
          { icon: 'Filter', label: 'Filters', shortcut: 'F' },
          { icon: 'Layers', label: 'Map Layers', shortcut: 'L' },
          { icon: 'Bookmark', label: 'Save View', shortcut: 'Ctrl+S' },
          { icon: 'Share', label: 'Share Map', shortcut: 'Ctrl+Shift+S' }
        ];
      case '/property-search-and-discovery-engine':
        return [
          { icon: 'Plus', label: 'New Search', shortcut: 'Ctrl+N', primary: true },
          { icon: 'Save', label: 'Save Search', shortcut: 'Ctrl+S' },
          { icon: 'Filter', label: 'Advanced Filters', shortcut: 'F' },
          { icon: 'Download', label: 'Export Results', shortcut: 'Ctrl+E' },
          { icon: 'Bell', label: 'Set Alert', shortcut: 'A' }
        ];
      case '/property-analysis-workbench':
        return [
          { icon: 'FileText', label: 'New Analysis', shortcut: 'Ctrl+N', primary: true },
          { icon: 'Calculator', label: 'Financial Model', shortcut: 'M' },
          { icon: 'BarChart3', label: 'Generate Report', shortcut: 'R' },
          { icon: 'Compare', label: 'Compare Properties', shortcut: 'C' },
          { icon: 'Download', label: 'Export Analysis', shortcut: 'Ctrl+E' }
        ];
      case '/deal-room-management-hub':
        return [
          { icon: 'Plus', label: 'New Deal', shortcut: 'Ctrl+N', primary: true },
          { icon: 'Users', label: 'Invite Members', shortcut: 'I' },
          { icon: 'Upload', label: 'Upload Documents', shortcut: 'U' },
          { icon: 'MessageSquare', label: 'Add Comment', shortcut: 'Ctrl+/' },
          { icon: 'Calendar', label: 'Schedule Meeting', shortcut: 'S' }
        ];
      case '/market-intelligence-dashboard':
        return [
          { icon: 'RefreshCw', label: 'Refresh Data', shortcut: 'R', primary: true },
          { icon: 'Filter', label: 'Market Filters', shortcut: 'F' },
          { icon: 'TrendingUp', label: 'Trend Analysis', shortcut: 'T' },
          { icon: 'FileText', label: 'Generate Report', shortcut: 'Ctrl+R' },
          { icon: 'Bell', label: 'Market Alerts', shortcut: 'A' }
        ];
      case '/system-configuration-and-integration-hub':
        return [
          { icon: 'Plus', label: 'Add Integration', shortcut: 'Ctrl+N', primary: true },
          { icon: 'Settings', label: 'System Settings', shortcut: 'S' },
          { icon: 'Users', label: 'User Management', shortcut: 'U' },
          { icon: 'Shield', label: 'Security Settings', shortcut: 'Ctrl+S' },
          { icon: 'Download', label: 'Export Config', shortcut: 'E' }
        ];
      default:
        return [];
    }
  };

  const actions = getActionsForPath(location.pathname);
  
  if (actions.length === 0) return null;

  const primaryActions = actions.filter(action => action.primary);
  const secondaryActions = actions.filter(action => !action.primary);
  const visibleActions = isExpanded ? actions : [...primaryActions, ...secondaryActions.slice(0, 2)];
  const hasMoreActions = secondaryActions.length > 2;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <div className="flex flex-col-reverse items-end space-y-reverse space-y-2">
        {/* Action Buttons */}
        <div className={`flex flex-col space-y-2 transition-all duration-300 ease-in-out ${
          isExpanded ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'
        }`}>
          {visibleActions.map((action, index) => (
            <div
              key={index}
              className="group relative"
            >
              <Button
                variant={action.primary ? "default" : "secondary"}
                size="icon"
                className={`w-12 h-12 shadow-elevation-2 hover:shadow-elevation-3 transition-all duration-150 ${
                  action.primary ? 'bg-primary hover:bg-primary/90' : 'bg-surface hover:bg-muted'
                }`}
                title={`${action.label} (${action.shortcut})`}
              >
                <Icon 
                  name={action.icon} 
                  size={20} 
                  color={action.primary ? 'white' : 'currentColor'} 
                />
              </Button>
              
              {/* Tooltip */}
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 pointer-events-none">
                <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-elevation-2 whitespace-nowrap">
                  <div className="text-sm font-medium text-text-primary">{action.label}</div>
                  <div className="text-xs text-text-secondary font-mono">{action.shortcut}</div>
                </div>
                <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-l-border border-y-4 border-y-transparent"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Expand/Collapse Button */}
        {hasMoreActions && (
          <Button
            variant="outline"
            size="icon"
            className="w-10 h-10 bg-surface border-border shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-150"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Icon 
              name={isExpanded ? "ChevronDown" : "MoreHorizontal"} 
              size={16} 
              className={`transition-transform duration-150 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </Button>
        )}
      </div>

      {/* Mobile Responsive - Show as horizontal bar on small screens */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4">
        <div className="flex items-center justify-between space-x-2 overflow-x-auto">
          {actions.slice(0, 4).map((action, index) => (
            <Button
              key={index}
              variant={action.primary ? "default" : "ghost"}
              size="sm"
              className="flex-shrink-0 flex items-center space-x-2"
            >
              <Icon name={action.icon} size={16} />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
          {actions.length > 4 && (
            <Button variant="ghost" size="sm">
              <Icon name="MoreHorizontal" size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActionToolbar;