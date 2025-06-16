import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimeSeriesData } from '../../types';

interface LineChartProps {
  data: TimeSeriesData[];
  onPointClick?: (data: TimeSeriesData) => void;
  color?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, onPointClick, color = '#3B82F6' }) => {
  const handleClick = (data: TimeSeriesData) => {
    if (onPointClick) {
      onPointClick(data);
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12 }}
          interval="preserveStartEnd"
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
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={{ fill: color, strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: 'white' }}
          onClick={handleClick}
          className="cursor-pointer"
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;