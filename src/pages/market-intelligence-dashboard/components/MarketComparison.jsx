import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const MarketComparison = () => {
  const [selectedMetric, setSelectedMetric] = useState('median_price');
  const [timeframe, setTimeframe] = useState('6_months');

  const metricOptions = [
    { value: 'median_price', label: 'Median Price' },
    { value: 'price_per_sqft', label: 'Price per Sq Ft' },
    { value: 'days_on_market', label: 'Days on Market' },
    { value: 'inventory_levels', label: 'Inventory Levels' }
  ];

  const timeframeOptions = [
    { value: '3_months', label: 'Last 3 Months' },
    { value: '6_months', label: 'Last 6 Months' },
    { value: '12_months', label: 'Last 12 Months' },
    { value: '24_months', label: 'Last 24 Months' }
  ];

  const comparisonData = {
    median_price: [
      { region: 'Downtown Core', current: 850000, previous: 795000, change: 6.9 },
      { region: 'Tech Quarter', current: 1200000, previous: 1050000, change: 14.3 },
      { region: 'Riverside District', current: 650000, previous: 620000, change: 4.8 },
      { region: 'Waterfront', current: 950000, previous: 890000, change: 6.7 },
      { region: 'University Area', current: 580000, previous: 545000, change: 6.4 },
      { region: 'Historic District', current: 750000, previous: 715000, change: 4.9 }
    ],
    price_per_sqft: [
      { region: 'Downtown Core', current: 425, previous: 398, change: 6.8 },
      { region: 'Tech Quarter', current: 520, previous: 465, change: 11.8 },
      { region: 'Riverside District', current: 285, previous: 275, change: 3.6 },
      { region: 'Waterfront', current: 380, previous: 355, change: 7.0 },
      { region: 'University Area', current: 245, previous: 235, change: 4.3 },
      { region: 'Historic District', current: 315, previous: 305, change: 3.3 }
    ]
  };

  const currentData = comparisonData[selectedMetric] || comparisonData.median_price;

  const formatValue = (value, metric) => {
    switch (metric) {
      case 'median_price':
        return `$${(value / 1000).toFixed(0)}K`;
      case 'price_per_sqft':
        return `$${value}`;
      case 'days_on_market':
        return `${value} days`;
      case 'inventory_levels':
        return `${value} units`;
      default:
        return value;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevation-2">
          <p className="text-sm font-medium text-text-primary mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm">
              Current: <span className="font-medium">{formatValue(data.current, selectedMetric)}</span>
            </p>
            <p className="text-sm">
              Previous: <span className="font-medium">{formatValue(data.previous, selectedMetric)}</span>
            </p>
            <p className={`text-sm ${data.change >= 0 ? 'text-success' : 'text-error'}`}>
              Change: <span className="font-medium">{data.change >= 0 ? '+' : ''}{data.change}%</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-primary">Market Comparison</h3>
        <div className="flex items-center space-x-3">
          <Select
            options={metricOptions}
            value={selectedMetric}
            onChange={setSelectedMetric}
            className="w-40"
          />
          <Select
            options={timeframeOptions}
            value={timeframe}
            onChange={setTimeframe}
            className="w-40"
          />
          <Button variant="ghost" size="icon">
            <Icon name="Download" size={16} />
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer>
          <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="region" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
              tickFormatter={(value) => formatValue(value, selectedMetric)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="current" 
              fill="var(--color-primary)" 
              name="Current"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="previous" 
              fill="var(--color-secondary)" 
              name="Previous"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 font-medium text-text-primary">Region</th>
              <th className="text-right py-3 px-2 font-medium text-text-primary">Current</th>
              <th className="text-right py-3 px-2 font-medium text-text-primary">Previous</th>
              <th className="text-right py-3 px-2 font-medium text-text-primary">Change</th>
              <th className="text-right py-3 px-2 font-medium text-text-primary">Trend</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, index) => (
              <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-3 px-2 font-medium text-text-primary">{item.region}</td>
                <td className="py-3 px-2 text-right text-text-primary">
                  {formatValue(item.current, selectedMetric)}
                </td>
                <td className="py-3 px-2 text-right text-text-secondary">
                  {formatValue(item.previous, selectedMetric)}
                </td>
                <td className={`py-3 px-2 text-right font-medium ${
                  item.change >= 0 ? 'text-success' : 'text-error'
                }`}>
                  {item.change >= 0 ? '+' : ''}{item.change}%
                </td>
                <td className="py-3 px-2 text-right">
                  <Icon 
                    name={item.change >= 0 ? 'TrendingUp' : 'TrendingDown'} 
                    size={16} 
                    className={item.change >= 0 ? 'text-success' : 'text-error'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketComparison;