import React from 'react';
import {
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { 
  CalendarMonth,
  NavigateBefore,
  NavigateNext,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface TimeLogCalendarHeaderProps {
  currentDate: Date;
  totalHours: number;
  onNavigateMonth: (direction: number) => void;
}

const TimeLogCalendarHeader: React.FC<TimeLogCalendarHeaderProps> = ({
  currentDate,
  totalHours,
  onNavigateMonth,
}) => {
  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 2
      }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
          <CalendarMonth sx={{ mr: 1 }} />
          Time Log Calendar
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => onNavigateMonth(-1)}>
            <NavigateBefore />
          </IconButton>
          <Typography variant="h6" sx={{ mx: 2 }}>
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={() => onNavigateMonth(1)}>
            <NavigateNext />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="textSecondary">
          Total hours this month: {totalHours.toFixed(1)}h
        </Typography>
      </Box>
    </>
  );
};

export default TimeLogCalendarHeader;
