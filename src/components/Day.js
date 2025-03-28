import dayjs from "dayjs";
import React, { useContext, useState, useEffect } from "react";
import GlobalContext from "../context/GlobalContext";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

// Extend dayjs with the isSameOrAfter plugin
dayjs.extend(isSameOrAfter);

export default function Day({ day, rowIdx, events, tasks, venues}) {
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
    return day.format("DD-MM-YY") === dayjs().format("DD-MM-YY")
      ? "bg-blue-600 text-white rounded-full w-7"
      : "";
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
      className="border border-gray-200 flex flex-col relative min-h-[100px]"
      onClick={handleDayClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <header className="flex flex-col items-center relative z-20">
        {rowIdx === 0 && (
          <p className="text-sm mt-1">
            {day.format("ddd").toUpperCase()}
          </p>
        )}
        <p
          className={`text-sm p-1 my-1 text-center ${getCurrentDayClass()}`}
        >
          {day.format("DD")}
        </p>
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
              key={task.id}
              className={`bg-${task.label}-600 p-1 mx-1 text-white font-bold text-sm rounded mb-1 truncate`}
              onClick={(e) => handleTaskClick(task, e)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", JSON.stringify({ ...task, type: "task" }));
              }}
            >
              {task.title}
            </div>
          ))}

          {/* Venues */}
          <div className="flex-1">
          {venues.map((venue, idx) => (
            <div
              key={idx}
              className={`bg-${venue.label}-600 p-1 mx-1 text-white font-bold text-sm rounded mb-1 truncate`}
              //onClick={(e) => onVenueClick(venue, e)} // Handle venue click
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