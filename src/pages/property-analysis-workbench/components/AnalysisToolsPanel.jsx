import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const AnalysisToolsPanel = ({ selectedProperty }) => {
  const [activeAnalysis, setActiveAnalysis] = useState('financial');
  const [calculatorInputs, setCalculatorInputs] = useState({
    purchasePrice: 875000,
    downPayment: 175000,
    interestRate: 6.5,
    loanTerm: 30,
    monthlyRent: 3200,
    vacancy: 5,
    maintenance: 1000,
    management: 320
  });

  const analysisTypes = [
    { id: 'financial', label: 'Financial Calculator', icon: 'Calculator' },
    { id: 'comparables', label: 'Comparable Analysis', icon: 'BarChart3' },
    { id: 'risk', label: 'Risk Assessment', icon: 'AlertTriangle' },
    { id: 'market', label: 'Market Trends', icon: 'TrendingUp' },
    { id: 'bulk', label: 'Bulk Analysis', icon: 'Grid3X3' }
  ];

  // Mock data for charts
  const comparableData = [
    { address: '1247 Oak St', price: 875000, sqft: 2450, pricePerSqft: 357 },
    { address: '1251 Oak St', price: 890000, sqft: 2500, pricePerSqft: 356 },
    { address: '1239 Oak St', price: 825000, sqft: 2300, pricePerSqft: 359 },
    { address: '1255 Oak St', price: 910000, sqft: 2600, pricePerSqft: 350 },
    { address: '1243 Oak St', price: 850000, sqft: 2400, pricePerSqft: 354 }
  ];

  const marketTrendData = [
    { month: 'Jan', price: 820000, volume: 45 },
    { month: 'Feb', price: 835000, volume: 52 },
    { month: 'Mar', price: 850000, volume: 48 },
    { month: 'Apr', price: 865000, volume: 55 },
    { month: 'May', price: 875000, volume: 62 },
    { month: 'Jun', price: 890000, volume: 58 },
    { month: 'Jul', price: 885000, volume: 51 }
  ];

  const riskData = [
    { name: 'Market Risk', value: 25, color: '#ef4444' },
    { name: 'Location Risk', value: 15, color: '#f97316' },
    { name: 'Financial Risk', value: 20, color: '#eab308' },
    { name: 'Environmental Risk', value: 10, color: '#22c55e' },
    { name: 'Legal Risk', value: 5, color: '#3b82f6' },
    { name: 'Other', value: 25, color: '#8b5cf6' }
  ];

  const calculateROI = () => {
    const loanAmount = calculatorInputs.purchasePrice - calculatorInputs.downPayment;
    const monthlyPayment = (loanAmount * (calculatorInputs.interestRate / 100 / 12)) / 
      (1 - Math.pow(1 + (calculatorInputs.interestRate / 100 / 12), -calculatorInputs.loanTerm * 12));
    
    const annualRent = calculatorInputs.monthlyRent * 12;
    const effectiveRent = annualRent * (1 - calculatorInputs.vacancy / 100);
    const annualExpenses = (monthlyPayment * 12) + (calculatorInputs.maintenance * 12) + (calculatorInputs.management * 12);
    const netIncome = effectiveRent - annualExpenses;
    const roi = (netIncome / calculatorInputs.downPayment) * 100;
    
    return {
      monthlyPayment: Math.round(monthlyPayment),
      annualRent: Math.round(annualRent),
      effectiveRent: Math.round(effectiveRent),
      annualExpenses: Math.round(annualExpenses),
      netIncome: Math.round(netIncome),
      roi: Math.round(roi * 100) / 100
    };
  };

  const handleInputChange = (field, value) => {
    setCalculatorInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const renderFinancialCalculator = () => {
    const calculations = calculateROI();
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Investment Parameters</h3>
            
            <Input
              label="Purchase Price"
              type="number"
              value={calculatorInputs.purchasePrice}
              onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
              className="mb-4"
            />
            
            <Input
              label="Down Payment"
              type="number"
              value={calculatorInputs.downPayment}
              onChange={(e) => handleInputChange('downPayment', e.target.value)}
              className="mb-4"
            />
            
            <Input
              label="Interest Rate (%)"
              type="number"
              step="0.1"
              value={calculatorInputs.interestRate}
              onChange={(e) => handleInputChange('interestRate', e.target.value)}
              className="mb-4"
            />
            
            <Input
              label="Loan Term (years)"
              type="number"
              value={calculatorInputs.loanTerm}
              onChange={(e) => handleInputChange('loanTerm', e.target.value)}
              className="mb-4"
            />
            
            <Input
              label="Monthly Rent"
              type="number"
              value={calculatorInputs.monthlyRent}
              onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
              className="mb-4"
            />
            
            <Input
              label="Vacancy Rate (%)"
              type="number"
              value={calculatorInputs.vacancy}
              onChange={(e) => handleInputChange('vacancy', e.target.value)}
              className="mb-4"
            />
          </div>

          {/* Results Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-primary">Analysis Results</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-text-secondary">Monthly Payment</div>
                <div className="text-2xl font-bold text-text-primary">${calculations.monthlyPayment.toLocaleString()}</div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-text-secondary">Annual Rent</div>
                <div className="text-2xl font-bold text-success">${calculations.annualRent.toLocaleString()}</div>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-text-secondary">Net Annual Income</div>
                <div className={`text-2xl font-bold ${calculations.netIncome >= 0 ? 'text-success' : 'text-error'}`}>
                  ${calculations.netIncome.toLocaleString()}
                </div>
              </div>
              
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="text-sm text-text-secondary">Return on Investment</div>
                <div className={`text-3xl font-bold ${calculations.roi >= 0 ? 'text-success' : 'text-error'}`}>
                  {calculations.roi}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComparableAnalysis = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Comparable Properties Analysis</h3>
        <Button variant="outline" size="sm">
          <Icon name="Download" size={16} />
          Export
        </Button>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparableData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="address" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Price per Sq Ft']} />
            <Bar dataKey="pricePerSqft" fill="var(--color-primary)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-text-secondary">Address</th>
              <th className="text-right py-3 px-4 font-medium text-text-secondary">Price</th>
              <th className="text-right py-3 px-4 font-medium text-text-secondary">Sq Ft</th>
              <th className="text-right py-3 px-4 font-medium text-text-secondary">Price/Sq Ft</th>
              <th className="text-right py-3 px-4 font-medium text-text-secondary">Variance</th>
            </tr>
          </thead>
          <tbody>
            {comparableData.map((property, index) => (
              <tr key={index} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4 font-medium text-text-primary">{property.address}</td>
                <td className="py-3 px-4 text-right text-text-primary">${property.price.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-text-primary">{property.sqft.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-text-primary">${property.pricePerSqft}</td>
                <td className="py-3 px-4 text-right">
                  <span className={`${property.pricePerSqft > 357 ? 'text-error' : 'text-success'}`}>
                    {property.pricePerSqft > 357 ? '+' : ''}{((property.pricePerSqft - 357) / 357 * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRiskAssessment = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-primary">Risk Assessment Matrix</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-4">Risk Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-text-secondary mb-4">Risk Factors</h4>
          <div className="space-y-3">
            {riskData.map((risk, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: risk.color }}
                  ></div>
                  <span className="text-sm font-medium text-text-primary">{risk.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-text-primary">{risk.value}%</span>
                  <Icon 
                    name={risk.value > 20 ? "AlertTriangle" : risk.value > 10 ? "AlertCircle" : "CheckCircle"} 
                    size={16} 
                    className={risk.value > 20 ? "text-error" : risk.value > 10 ? "text-warning" : "text-success"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-1">Risk Summary</h4>
            <p className="text-sm text-text-secondary">
              This property shows moderate overall risk with primary concerns in market volatility and financial leverage. 
              Consider diversification strategies and maintain adequate cash reserves.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMarketTrends = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-text-primary">Market Trend Analysis</h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={marketTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="price" orientation="left" />
            <YAxis yAxisId="volume" orientation="right" />
            <Tooltip />
            <Line 
              yAxisId="price" 
              type="monotone" 
              dataKey="price" 
              stroke="var(--color-primary)" 
              strokeWidth={3}
              name="Average Price"
            />
            <Line 
              yAxisId="volume" 
              type="monotone" 
              dataKey="volume" 
              stroke="var(--color-accent)" 
              strokeWidth={2}
              name="Sales Volume"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="text-sm text-text-secondary">Price Trend</div>
          <div className="text-2xl font-bold text-success">+8.5%</div>
          <div className="text-xs text-text-secondary">6-month growth</div>
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <div className="text-sm text-text-secondary">Market Activity</div>
          <div className="text-2xl font-bold text-text-primary">54</div>
          <div className="text-xs text-text-secondary">avg monthly sales</div>
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <div className="text-sm text-text-secondary">Days on Market</div>
          <div className="text-2xl font-bold text-text-primary">28</div>
          <div className="text-xs text-text-secondary">average days</div>
        </div>
      </div>
    </div>
  );

  const renderBulkAnalysis = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Bulk Property Analysis</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Icon name="Upload" size={16} />
            Import List
          </Button>
          <Button variant="default" size="sm">
            <Icon name="Plus" size={16} />
            Add Properties
          </Button>
        </div>
      </div>

      <div className="p-4 bg-muted rounded-lg">
        <div className="text-center">
          <Icon name="Grid3X3" size={48} className="text-text-secondary mx-auto mb-4" />
          <h4 className="text-lg font-medium text-text-primary mb-2">Bulk Analysis Tool</h4>
          <p className="text-sm text-text-secondary mb-4">
            Upload a CSV file or manually add up to 100 properties for simultaneous analysis
          </p>
          <Button variant="default">
            <Icon name="Upload" size={16} />
            Upload Property List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border border-border rounded-lg">
          <h4 className="text-sm font-medium text-text-primary mb-2">Analysis Features</h4>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span>Automated valuation for all properties</span>
            </li>
            <li className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span>Comparative market analysis</span>
            </li>
            <li className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span>Risk assessment scoring</span>
            </li>
            <li className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span>Investment ranking algorithm</span>
            </li>
          </ul>
        </div>

        <div className="p-4 border border-border rounded-lg">
          <h4 className="text-sm font-medium text-text-primary mb-2">Export Options</h4>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-center space-x-2">
              <Icon name="FileText" size={16} className="text-primary" />
              <span>Detailed property reports</span>
            </li>
            <li className="flex items-center space-x-2">
              <Icon name="BarChart3" size={16} className="text-primary" />
              <span>Executive summary dashboard</span>
            </li>
            <li className="flex items-center space-x-2">
              <Icon name="Download" size={16} className="text-primary" />
              <span>CSV data export</span>
            </li>
            <li className="flex items-center space-x-2">
              <Icon name="Presentation" size={16} className="text-primary" />
              <span>Presentation-ready slides</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderAnalysisContent = () => {
    switch (activeAnalysis) {
      case 'financial':
        return renderFinancialCalculator();
      case 'comparables':
        return renderComparableAnalysis();
      case 'risk':
        return renderRiskAssessment();
      case 'market':
        return renderMarketTrends();
      case 'bulk':
        return renderBulkAnalysis();
      default:
        return renderFinancialCalculator();
    }
  };

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Analysis Tools</h2>
        
        {/* Analysis Type Selector */}
        <div className="flex flex-wrap gap-2">
          {analysisTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveAnalysis(type.id)}
              className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                activeAnalysis === type.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-text-secondary hover:text-text-primary hover:bg-muted/80'
              }`}
            >
              <Icon name={type.icon} size={16} />
              <span>{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderAnalysisContent()}
      </div>
    </div>
  );
};

export default AnalysisToolsPanel;