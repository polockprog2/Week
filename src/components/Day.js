import dayjs from "dayjs";
import React, { useContext, useState, useEffect } from "react";
import GlobalContext from "../context/GlobalContext";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

// Extend dayjs with the isSameOrAfter plugin
dayjs.extend(isSameOrAfter);

export default function Day({ day, rowIdx, events, tasks, venues }) {
  const [dayEvents, setDayEvents] = useState([]);
  const [dayTasks, setDayTasks] = useState([]);
  const dayVenues = venues.filter((venue) =>
    dayjs(venue.day).isSame(day, "day")
  );
  const {
    setDaySelected,
    setShowEventModal,
    setShowTaskModal,
    setSelectedEvent,
    setSelectedTask,
    dispatchCalEvent,
    dispatchCalTask,
  } = useContext(GlobalContext);

  useEffect(() => {
    // Filter events for this day
      const filteredEvents = events.filter(evt => {
      const eventStart = dayjs(evt.day);
      return day.isSame(eventStart, 'day');
    });

    setDayEvents(filteredEvents);
    setDayTasks(tasks);
  }, [events, tasks, day]);

  function getCurrentDayClass() {
    return day.isSame(dayjs(), 'day')
      ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto font-bold shadow'
      : 'text-gray-900';
  }

 
  function handleDayClick() {
    setDaySelected(day);
    setShowEventModal(true);
  }

  function handleEventClick(event, e) {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowEventModal(true);
  }

  function handleTaskClick(task, e) {
    e.stopPropagation();
    setSelectedTask(task);
    setShowTaskModal(true);
  }

  function handleDrop(e) {
    e.preventDefault();
    const eventData = JSON.parse(e.dataTransfer.getData("text/plain"));
    if (eventData.type === "event") {
      eventData.day = day.valueOf();
      dispatchCalEvent({ type: "update", payload: eventData });
    } else if (eventData.type === "task") {
      eventData.dueDate = day.valueOf();
      dispatchCalTask({ type: "update", payload: eventData });
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
  }

  return (
    <div
      className={`border border-gray-200 flex flex-col relative min-h-[100px] transition-colors duration-150 hover:bg-blue-50`}
      onClick={handleDayClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <header className="flex flex-col items-center relative z-20">
        {rowIdx === 0 && (
          <p className="text-xs mt-1 text-gray-500 tracking-wide font-semibold select-none">
            {day.format("ddd").toUpperCase()}
          </p>
        )}
        <div className="flex items-center justify-center mt-1 mb-1">
          <span className={`text-base ${getCurrentDayClass()}`}
            style={{ minWidth: '2rem', minHeight: '2rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {day.format("D")}
          </span>
        </div>
      </header>
      <div className="flex-1 cursor-pointer">
        <div>
          {/*Event*/}
          {dayEvents.map((evt, idx) => (
            <div
              key={evt.id}
              className={`bg-${evt.label}-600 p-1 mx-1 text-white font-bold text-sm rounded mb-1 truncate`}
              onClick={(e) => handleEventClick(evt, e)}
              draggable
              onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", JSON.stringify({ ...evt, type: "event" }));
              }}
            >
              {evt.title}
            </div>
          ))}

          {/* Tasks */}
          {dayTasks.map((task, idx) => (
            <div
              key={task.taskId}
              className={`bg-${task.label}-600 p-1 mx-1 text-white font-bold text-sm rounded mb-1 truncate`}
              onClick={(e) => handleTaskClick(task, e)}
              draggable
              onDragStart={(e) => {
                // Always include taskId, not just ...task
                e.dataTransfer.setData(
                  "text/plain",
                  JSON.stringify({ ...task, type: "task", taskId: task.taskId })
                );
              }}
            >
              {task.title}
            </div>
          ))}

          {/* Venues */}
          <div className="flex-1">
          {venues.map((venue) => (
            <div
              key={venue.id || `${venue.title}-${venue.venueName}-${venue.day}`}
              className={`bg-${venue.label}-600 p-1 mx-1 text-white font-bold text-sm rounded mb-1 truncate`}
              //onClick={(e) => onVenueClick(venue, e)}
            >
              {venue.title} ({venue.venueName})
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
}