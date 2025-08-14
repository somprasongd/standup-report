"use client";

import { useState, useEffect } from "react";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import StandupListContent from "./StandupListContent";
import { Calendar } from "lucide-react";

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
    <div className="card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-foreground">Standup Entries</h2>
        <div className="flex items-center gap-2">
          <label htmlFor="date" className="text-sm font-medium text-foreground/80 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Select Date:
          </label>
          <input
            type="date"
            id="date"
            value={format(selectedDate, "yyyy-MM-dd")}
            onChange={handleDateChange}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            max={format(new Date(), "yyyy-MM-dd")}
          />
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground/90">
          {formatDateLabel(selectedDate)}
        </h3>
      </div>
      <StandupListContent selectedDate={selectedDate} key={`${selectedDate.getTime()}-${refreshFlag}`} />
    </div>
  );
}