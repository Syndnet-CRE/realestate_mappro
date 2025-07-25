import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PortfolioPerformanceWidget = () => {
  const [viewMode, setViewMode] = useState('overview');

  const portfolioData = [
    { name: 'Residential', value: 45, amount: 12500000, color: '#1E3A8A' },
    { name: 'Commercial', value: 30, amount: 8750000, color: '#0EA5E9' },
    { name: 'Industrial', value: 15, amount: 4200000, color: '#059669' },
    { name: 'Mixed Use', value: 10, amount: 2800000, color: '#D97706' }
  ];

  const performanceData = [
    { month: 'Jan', value: 2.1, target: 2.5 },
    { month: 'Feb', value: 2.8, target: 2.5 },
    { month: 'Mar', value: 3.2, target: 2.5 },
    { month: 'Apr', value: 2.9, target: 2.5 },
    { month: 'May', value: 3.5, target: 2.5 },
    { month: 'Jun', value: 4.1, target: 2.5 }
  ];

  const metrics = [
    { label: 'Total Portfolio Value', value: '$28.25M', change: '+5.2%', changeType: 'positive' },
    { label: 'Monthly ROI', value: '4.1%', change: '+0.6%', changeType: 'positive' },
    { label: 'Occupancy Rate', value: '94.2%', change: '+1.8%', changeType: 'positive' },
    { label: 'Properties', value: '127', change: '+3', changeType: 'positive' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevation-2">
          <p className="text-sm font-medium text-text-primary">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === 'value' ? 'Actual' : 'Target'}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Portfolio Performance</h3>
        <div className="flex items-center space-x-2">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'overview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('overview')}
            >
              Overview
            </Button>
            <Button
              variant={viewMode === 'performance' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('performance')}
            >
              Performance
            </Button>
          </div>
          <Button variant="ghost" size="icon">
            <Icon name="MoreHorizontal" size={16} />
          </Button>
        </div>
      </div>

      {viewMode === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Portfolio Composition */}
          <div>
            <h4 className="font-medium text-text-primary mb-4">Portfolio Composition</h4>
            <div className="h-48">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={portfolioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {portfolioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, name]}
                    labelFormatter={() => ''}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {portfolioData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-text-secondary">{item.name}</span>
                  <span className="text-sm font-medium text-text-primary">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div>
            <h4 className="font-medium text-text-primary mb-4">Key Metrics</h4>
            <div className="space-y-4">
              {metrics.map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-text-secondary">{metric.label}</p>
                    <p className="text-lg font-semibold text-text-primary">{metric.value}</p>
                  </div>
                  <div className={`flex items-center space-x-1 text-sm ${
                    metric.changeType === 'positive' ? 'text-success' : 'text-error'
                  }`}>
                    <Icon 
                      name={metric.changeType === 'positive' ? 'TrendingUp' : 'TrendingDown'} 
                      size={14} 
                    />
                    <span>{metric.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h4 className="font-medium text-text-primary mb-4">Monthly Performance vs Target</h4>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="target" fill="var(--color-border)" name="Target" />
                <Bar dataKey="value" fill="var(--color-primary)" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-text-secondary">Avg Performance</p>
              <p className="text-xl font-semibold text-text-primary">3.1%</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-text-secondary">Best Month</p>
              <p className="text-xl font-semibold text-success">4.1%</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-text-secondary">vs Target</p>
              <p className="text-xl font-semibold text-success">+0.6%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPerformanceWidget;