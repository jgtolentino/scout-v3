import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartData } from '../../types';

interface BarChartProps {
  data: ChartData[];
  onBarClick?: (data: ChartData) => void;
  color?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, onBarClick, color = '#3B82F6' }) => {
  const handleClick = (data: ChartData) => {
    if (onBarClick) {
      onBarClick(data);
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          interval={0}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => 
            new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
              notation: 'compact',
            }).format(value)
          }
        />
        <Tooltip
          formatter={(value: number) => [
            new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
            }).format(value),
            'Revenue'
          ]}
          labelStyle={{ color: '#374151' }}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '12px',
          }}
        />
        <Bar
          dataKey="value"
          fill={color}
          onClick={handleClick}
          className="cursor-pointer hover:opacity-80 transition-opacity"
          radius={[4, 4, 0, 0]}
        />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;