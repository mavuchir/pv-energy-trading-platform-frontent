// src/components/ui/calendar.js
import React from 'react';
import { Calendar as ReactCalendar } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const Calendar = ({ mode, selected, onSelect, initialFocus }) => {
  return (
    <div className="calendar">
      <ReactCalendar
        mode={mode}
        value={selected}
        onChange={onSelect}
        className="rounded-md border border-gray-300"
        // Additional props can be added as needed
      />
    </div>
  );
};

export default Calendar;