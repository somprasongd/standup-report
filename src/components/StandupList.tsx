"use client";

import { useState, useEffect } from "react";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import StandupListContent from "./StandupListContent";

export default function StandupList() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshFlag, setRefreshFlag] = useState(false);

  // Function to trigger refresh
  const triggerRefresh = () => {
    setRefreshFlag(prev => !prev);
  };

  useEffect(() => {
    // Listen for the custom event to trigger refresh
    const handleStandupEntryUpdated = () => {
      triggerRefresh();
    };
    
    window.addEventListener('standupEntryUpdated', handleStandupEntryUpdated);
    
    return () => {
      window.removeEventListener('standupEntryUpdated', handleStandupEntryUpdated);
    };
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(e.target.value));
  };

  const formatDateLabel = (date: Date) => {
    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "EEEE, MMMM d, yyyy");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Standup Entries</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="date" className="text-sm font-medium text-gray-700">
            Select Date:
          </label>
          <input
            type="date"
            id="date"
            value={format(selectedDate, "yyyy-MM-dd")}
            onChange={handleDateChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            max={format(new Date(), "yyyy-MM-dd")}
          />
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-700">
          {formatDateLabel(selectedDate)}
        </h3>
      </div>
      <StandupListContent selectedDate={selectedDate} key={`${selectedDate.getTime()}-${refreshFlag}`} />
    </div>
  );
}