import React, { useState } from 'react';
import { format, addDays, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

const Calendar = ({ onSelectDate, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Get days in current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Navigate to previous month
  const prevMonth = () => {
    const prevMonthDate = new Date(currentMonth);
    prevMonthDate.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(prevMonthDate);
  };
  
  // Navigate to next month
  const nextMonth = () => {
    const nextMonthDate = new Date(currentMonth);
    nextMonthDate.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(nextMonthDate);
  };
  
  // Navigate to today
  const goToToday = () => {
    setCurrentMonth(new Date());
    onSelectDate(new Date());
  };
  
  return (
    <div className="bg-dark-200 rounded-lg p-4">
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={prevMonth}
          className="p-1 hover:bg-dark-300 rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        
        <button 
          onClick={nextMonth}
          className="p-1 hover:bg-dark-300 rounded"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Today Button */}
      <button 
        onClick={goToToday}
        className="w-full py-1 mb-3 bg-dark-300 hover:bg-dark-400 rounded text-sm"
      >
        Today
      </button>
      
      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs text-gray-400">
        <div>Su</div>
        <div>Mo</div>
        <div>Tu</div>
        <div>We</div>
        <div>Th</div>
        <div>Fr</div>
        <div>Sa</div>
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the start of month */}
        {Array.from({ length: monthStart.getDay() }).map((_, index) => (
          <div key={`empty-start-${index}`} className="h-8 rounded"></div>
        ))}
        
        {/* Days of the month */}
        {daysInMonth.map((day) => {
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          
          return (
            <button
              key={day.toString()}
              onClick={() => onSelectDate(day)}
              className={`
                h-8 rounded flex items-center justify-center text-sm
                ${isToday ? 'border border-primary' : ''}
                ${isSelected ? 'bg-primary text-white' : 'hover:bg-dark-300'}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
        
        {/* Empty cells for days after the end of month */}
        {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
          <div key={`empty-end-${index}`} className="h-8 rounded"></div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;