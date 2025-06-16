import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartData } from '../../types';

interface DonutChartProps {
  data: ChartData[];
  onSegmentClick?: (data: ChartData) => void;
}

const COLORS = ['#3B82F6', '#14B8A6', '#F97316', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F59E0B'];

const DonutChart: React.FC<DonutChartProps> = ({ data, onSegmentClick }) => {
  const handleClick = (data: ChartData) => {
    if (onSegmentClick) {
      onSegmentClick(data);
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          onClick={handleClick}
          className="cursor-pointer"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={COLORS[index % COLORS.length]}
              className="hover:opacity-80 transition-opacity"
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [
            new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
            }).format(value),
            'Revenue'
          ]}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{
            fontSize: '12px',
            paddingTop: '10px',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DonutChart;