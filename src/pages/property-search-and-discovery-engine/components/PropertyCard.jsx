import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PropertyCard = ({ property, onAddToWatchlist, onQuickAnalysis, isSelected, onSelect }) => {
  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price.toLocaleString()}`;
  };

  const getInvestmentScoreColor = (score) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPropertyTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'single-family': return 'Home';
      case 'multi-family': return 'Building';
      case 'commercial': return 'Building2';
      case 'industrial': return 'Factory';
      case 'land': return 'TreePine';
      default: return 'Home';
    }
  };

  return (
    <div className={`bg-surface border border-border rounded-lg overflow-hidden shadow-elevation-1 hover:shadow-elevation-2 transition-all duration-200 ${
      isSelected ? 'ring-2 ring-primary' : ''
    }`}>
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Actions */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button
            variant="secondary"
            size="icon"
            className="w-8 h-8 bg-white/90 hover:bg-white"
            onClick={() => onAddToWatchlist(property.id)}
          >
            <Icon name={property.isWatchlisted ? "Heart" : "HeartOff"} size={14} />
          </Button>
          
          <Button
            variant="secondary"
            size="icon"
            className="w-8 h-8 bg-white/90 hover:bg-white"
            onClick={() => onSelect(property.id)}
          >
            <Icon name={isSelected ? "CheckSquare" : "Square"} size={14} />
          </Button>
        </div>

        {/* Property Type Badge */}
        <div className="absolute top-3 left-3">
          <div className="flex items-center space-x-1 bg-white/90 px-2 py-1 rounded-md text-xs font-medium">
            <Icon name={getPropertyTypeIcon(property.type)} size={12} />
            <span>{property.type}</span>
          </div>
        </div>

        {/* Investment Score */}
        <div className="absolute bottom-3 right-3">
          <div className={`px-2 py-1 rounded-md text-xs font-semibold ${getInvestmentScoreColor(property.investmentScore)}`}>
            Score: {property.investmentScore}/10
          </div>
        </div>

        {/* Status Badges */}
        <div className="absolute bottom-3 left-3 flex space-x-1">
          {property.isOffMarket && (
            <span className="bg-primary text-white px-2 py-1 rounded-md text-xs font-medium">
              Off-Market
            </span>
          )}
          {property.isNew && (
            <span className="bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium">
              New
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Price */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-text-primary mb-1 line-clamp-1">
            {property.title}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              {formatPrice(property.price)}
            </span>
            <div className="text-sm text-text-secondary">
              ${property.pricePerSqFt}/sq ft
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center space-x-2 mb-3 text-text-secondary">
          <Icon name="MapPin" size={14} />
          <span className="text-sm">{property.location}</span>
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-text-primary">{property.beds}</div>
            <div className="text-text-secondary">Beds</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-text-primary">{property.baths}</div>
            <div className="text-text-secondary">Baths</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-text-primary">{property.sqFt.toLocaleString()}</div>
            <div className="text-text-secondary">Sq Ft</div>
          </div>
        </div>

        {/* Investment Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <div className="text-text-secondary">Cap Rate</div>
            <div className="font-semibold text-green-600">{property.capRate}%</div>
          </div>
          <div>
            <div className="text-text-secondary">Cash Flow</div>
            <div className={`font-semibold ${property.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${property.cashFlow.toLocaleString()}/mo
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {property.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="bg-muted text-text-secondary px-2 py-1 rounded-md text-xs"
              >
                {feature}
              </span>
            ))}
            {property.features.length > 3 && (
              <span className="text-text-secondary text-xs px-2 py-1">
                +{property.features.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onQuickAnalysis(property.id)}
          >
            <Icon name="Calculator" size={14} className="mr-2" />
            Analyze
          </Button>
          
          <Link
            to={`/property-analysis-workbench?id=${property.id}`}
            className="flex-1"
          >
            <Button variant="default" size="sm" className="w-full">
              <Icon name="Eye" size={14} className="mr-2" />
              View Details
            </Button>
          </Link>
        </div>

        {/* Last Updated */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Updated {property.lastUpdated}</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${property.dataSync === 'synced' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span>{property.dataSync === 'synced' ? 'Synced' : 'Pending'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;