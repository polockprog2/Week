import React, { useState, useContext, useCallback } from "react";
import dayjs from "dayjs";
import Day from "./Day";
import GlobalContext from "../context/GlobalContext";

export default function Month({ month,venues }) {
  const [selectedDays, setSelectedDays] = useState([]);
  const [dragging, setDragging] = useState(false);
  
  const { 
    filteredEvents, 
    filteredTasks, 
    setShowEventModal, 
    setShowTaskModal, 
    setSelectedEvent, 
    setSelectedTask,
    setSelectedVenue,
    setShowVenueModal,
    setDaySelected,
    setMultiDaySelection
  } = useContext(GlobalContext);

  function handleMouseDown(day) {
    setDragging(true);
    setSelectedDays([day]);
    setMultiDaySelection([day]);
  }

  function handleMouseEnter(day) {
    if (dragging) {
      const startDay = selectedDays[0];
      const days = [];
      let currentDay = startDay;
      
      // If dragging backwards
      if (day.isBefore(startDay)) {
        while (currentDay.isAfter(day)) {
          currentDay = currentDay.subtract(1, 'day');
          days.unshift(currentDay);
        }
      } else {
        // If dragging forwards
        while (currentDay.isBefore(day)) {
          currentDay = currentDay.add(1, 'day');
          days.push(currentDay);
        }
      }
      
      const newSelection = [startDay, ...days];
      setSelectedDays(newSelection);
      setMultiDaySelection(newSelection);
    }
  }

  function handleMouseUp() {
    if (dragging && selectedDays.length > 0) {
      const sortedDays = [...selectedDays].sort((a, b) => a.valueOf() - b.valueOf());
      setDaySelected(sortedDays[0]);
      setMultiDaySelection(sortedDays);
      if (sortedDays.length > 1) {
        setShowEventModal(true);
      }
    }
    setDragging(false);
  }

  const handleEventClick = useCallback((event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setTimeout(() => setShowEventModal(true), 0);
  }, [setSelectedEvent, setShowEventModal]);

  const handleTaskClick = useCallback((task, e) => {
    e.stopPropagation();
    setSelectedTask(task);
    setTimeout(() => setShowTaskModal(true), 0);
  }, [setSelectedTask, setShowTaskModal]);
  
  const handleVenueClick = useCallback((venues, e) => {
    e.stopPropagation();
    setSelectedVenue(venues);
    setTimeout(() => setShowVenueModal(true), 0);
  }, [setSelectedVenue, setShowVenueModal]);
  return (
    <div
      className="flex-1 grid grid-cols-7 grid-rows-5 border-rounded-md shadow-md"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {month.map((row, i) => (
        <React.Fragment key={i}>
          {row.map((day, idx) => {
            const isSelected = selectedDays.some(d => d.isSame(day, 'day'));
            const selectionIndex = selectedDays.findIndex(d => d.isSame(day, 'day'));
            const isSelectionStart = selectionIndex === 0;
            const isSelectionEnd = selectionIndex === selectedDays.length - 1;
            
            return (
              <Day
                day={day}
                key={idx}
                rowIdx={i}
                onMouseDown={() => handleMouseDown(day)}
                onMouseEnter={() => handleMouseEnter(day)}
                isSelected={isSelected}
                isSelecting={dragging}
                isSelectionStart={isSelectionStart}
                isSelectionEnd={isSelectionEnd}
                events={filteredEvents.filter(
                  (evt) => dayjs(evt.day).format("DD-MM-YY") === day.format("DD-MM-YY")
                )}
                tasks={filteredTasks.filter(
                  (task) => dayjs(task.dueDate).format("DD-MM-YY") === day.format("DD-MM-YY")
                )}
                venues = {venues.filter(
                  (venue) => dayjs(venue.day).format("DD-MM-YY") === day.format("DD-MM-YY")
                )}

                onEventClick={handleEventClick}
                onTaskClick={handleTaskClick}
                onVenueClick={handleVenueClick}
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
    
  );
}