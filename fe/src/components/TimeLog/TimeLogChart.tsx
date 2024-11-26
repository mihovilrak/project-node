import React from 'react';
import { Cell } from 'recharts';
import {
  Box,
  Paper,
  Typography,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  ChartData,
  TimeLogChartProps,
} from '../../types/timeLog';

const TimeLogChart: React.FC<TimeLogChartProps> = ({ timeLogs, activityTypes }) => {
  const prepareChartData = (): ChartData[] => {
    const timeByActivity = timeLogs.reduce((acc, log) => {
      acc[log.activity_type_id] = (acc[log.activity_type_id] || 0) + log.spent_time;
      return acc;
    }, {} as Record<number, number>);

    return activityTypes
      .map(type => ({
        name: type.name,
        hours: Math.round((timeByActivity[type.id] || 0) / 60 * 100) / 100,
        color: type.color
      }))
      .filter(data => data.hours > 0)
      .sort((a, b) => b.hours - a.hours);
  };

  const data = prepareChartData();

  return (
    <Paper sx={{ p: 2, height: 400, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Time Distribution by Activity
      </Typography>
      <Box sx={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              formatter={(value: number) => [`${value} hours`, 'Time Spent']}
            />
            <Legend />
            <Bar
              dataKey="hours"
              fill="#8884d8"
              name="Hours Spent"
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default TimeLogChart; 