"use client";

import { addDays, format, isToday, isYesterday, subDays } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import StandupListContent from "./StandupListContent";

export default function StandupList() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

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

  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  const goToPreviousDay = () => {
    setIsLoading(true);
    setSelectedDate(prevDate => {
      const newDate = subDays(prevDate, 1);
      return newDate;
    });
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 300);
  };

  const goToNextDay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDate = addDays(selectedDate, 1);
    nextDate.setHours(0, 0, 0, 0);
    
    // Don't allow navigation to future dates
    if (nextDate > today) {
      return;
    }
    
    setIsLoading(true);
    setSelectedDate(nextDate);
    // Simulate loading delay
    setTimeout(() => setIsLoading(false), 300);
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

  // Check if we can navigate to the next day (not in the future)
  const canGoToNextDay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextDate = addDays(selectedDate, 1);
    nextDate.setHours(0, 0, 0, 0);
    return nextDate <= today;
  };

  return (
    <div className="card p-6 mb-4 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4 flex-shrink-0">
        <h2 className="text-2xl font-bold text-foreground">Standup Entries</h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={goToPreviousDay}
            disabled={isLoading}
            className="p-2 rounded-md bg-secondary text-foreground hover:bg-primary/10 transition-colors disabled:opacity-50"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={openDatePicker}
              className="flex items-center gap-1 px-3 py-2 border border-border rounded-md bg-background text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              <Calendar className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground/80">
                {format(selectedDate, "MMM d, yyyy")}
              </span>
            </button>
            
            <input
              ref={dateInputRef}
              type="date"
              value={format(selectedDate, "yyyy-MM-dd")}
              onChange={handleDateChange}
              className="absolute opacity-0 pointer-events-none"
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </div>
          
          <button 
            onClick={goToNextDay}
            disabled={!canGoToNextDay() || isLoading}
            className="p-2 rounded-md bg-secondary text-foreground hover:bg-primary/10 transition-colors disabled:opacity-50"
            aria-label="Next day"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
      
      <div className="mb-2 flex-shrink-0">
        <h3 className="text-lg font-semibold text-foreground/90">
          {formatDateLabel(selectedDate)}
        </h3>
      </div>
      <div className="flex-grow overflow-hidden">
        <StandupListContent selectedDate={selectedDate} key={`${selectedDate.getTime()}-${refreshFlag}`} />
      </div>
    </div>
  );
}