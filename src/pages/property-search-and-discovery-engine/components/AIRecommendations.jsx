import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const AIRecommendations = ({ onViewProperty, onDismissRecommendation }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const recommendations = [
    {
      id: 1,
      title: "Modern Duplex Investment",
      location: "East Austin, TX",
      price: 485000,
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop",
      confidenceScore: 92,
      reason: "Matches your preference for multi-family properties in Austin with high cap rates",
      keyMetrics: {
        capRate: 8.4,
        cashFlow: 1250,
        roi: 12.8
      },
      aiInsights: [
        "Property is in a rapidly gentrifying neighborhood",
        "Recent comparable sales show 15% appreciation",
        "Strong rental demand from young professionals"
      ],
      matchFactors: ["Location preference", "Property type", "Investment criteria", "Price range"]
    },
    {
      id: 2,
      title: "Value-Add Commercial Building",
      location: "Downtown Dallas, TX",
      price: 1250000,
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop",
      confidenceScore: 87,
      reason: "Identified as undervalued commercial property with renovation potential",
      keyMetrics: {
        capRate: 9.2,
        cashFlow: 8500,
        roi: 15.3
      },
      aiInsights: [
        "Building is 40% below market value for the area",
        "Zoning allows for mixed-use development",
        "Major infrastructure improvements planned nearby"
      ],
      matchFactors: ["Investment criteria", "Value-add opportunity", "Commercial focus"]
    },
    {
      id: 3,
      title: "Distressed Single Family",
      location: "Phoenix, AZ",
      price: 195000,
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop",
      confidenceScore: 78,
      reason: "Perfect fix-and-flip opportunity in growing market",
      keyMetrics: {
        capRate: 7.8,
        cashFlow: 950,
        roi: 18.5
      },
      aiInsights: [
        "ARV estimated at $285K after $35K renovation",
        "Neighborhood median home price up 12% YoY",
        "Low inventory creating seller\'s market"
      ],
      matchFactors: ["Distressed properties", "Single family", "High ROI potential"]
    }
  ];

  const getConfidenceColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`;
    }
    return `$${price.toLocaleString()}`;
  };

  return (
    <div className="bg-surface border border-border rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Icon name="Sparkles" size={16} color="white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary">AI Recommendations</h3>
              <p className="text-sm text-text-secondary">Personalized property suggestions based on your activity</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
          </Button>
        </div>
      </div>

      {/* Recommendations */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {recommendations.map(recommendation => (
            <div
              key={recommendation.id}
              className="border border-border rounded-lg p-4 hover:shadow-elevation-1 transition-shadow duration-200"
            >
              <div className="flex space-x-4">
                {/* Property Image */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-lg overflow-hidden">
                    <Image
                      src={recommendation.image}
                      alt={recommendation.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-text-primary">{recommendation.title}</h4>
                      <div className="flex items-center space-x-2 text-sm text-text-secondary">
                        <Icon name="MapPin" size={14} />
                        <span>{recommendation.location}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        {formatPrice(recommendation.price)}
                      </div>
                      <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getConfidenceColor(recommendation.confidenceScore)}`}>
                        <Icon name="Target" size={12} className="mr-1" />
                        {recommendation.confidenceScore}% match
                      </div>
                    </div>
                  </div>

                  {/* AI Reason */}
                  <div className="mb-3">
                    <p className="text-sm text-text-secondary italic">
                      "{recommendation.reason}"
                    </p>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-green-600">
                        {recommendation.keyMetrics.capRate}%
                      </div>
                      <div className="text-xs text-text-secondary">Cap Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-green-600">
                        ${recommendation.keyMetrics.cashFlow.toLocaleString()}
                      </div>
                      <div className="text-xs text-text-secondary">Cash Flow</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-green-600">
                        {recommendation.keyMetrics.roi}%
                      </div>
                      <div className="text-xs text-text-secondary">ROI</div>
                    </div>
                  </div>

                  {/* AI Insights */}
                  <div className="mb-3">
                    <h5 className="text-xs font-semibold text-text-primary mb-2 flex items-center">
                      <Icon name="Brain" size={12} className="mr-1" />
                      AI Insights
                    </h5>
                    <ul className="space-y-1">
                      {recommendation.aiInsights.map((insight, index) => (
                        <li key={index} className="text-xs text-text-secondary flex items-start">
                          <Icon name="ArrowRight" size={10} className="mr-1 mt-0.5 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Match Factors */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {recommendation.matchFactors.map((factor, index) => (
                        <span
                          key={index}
                          className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onViewProperty(recommendation.id)}
                    >
                      <Icon name="Eye" size={14} className="mr-2" />
                      View Property
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewProperty(recommendation.id)}
                    >
                      <Icon name="Calculator" size={14} className="mr-2" />
                      Analyze
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDismissRecommendation(recommendation.id)}
                      className="text-text-secondary hover:text-text-primary"
                    >
                      <Icon name="X" size={14} className="mr-2" />
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Learn More */}
          <div className="text-center pt-4 border-t border-border">
            <Button variant="outline" size="sm">
              <Icon name="Settings" size={14} className="mr-2" />
              Customize AI Preferences
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;