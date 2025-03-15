import dayjs from "dayjs";
import React, { useContext, useState, useEffect } from "react";
import GlobalContext from "../context/GlobalContext";

export default function Day({ day, rowIdx, events, tasks }) {
  const [dayEvents, setDayEvents] = useState([]);
  const [dayTasks, setDayTasks] = useState([]);
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

  function getEventClass(event) {
    const colorMap = {
      indigo: 'bg-indigo-600',
      red: 'bg-red-600',
      green: 'bg-green-600',
      yellow: 'bg-yellow-600',
      pink: 'bg-pink-600',
      purple: 'bg-purple-600',
      blue: 'bg-blue-600'
    };
    return `p-1 text-white font-bold text-sm truncate ${colorMap[event.label] || 'bg-blue-600'} mx-1 rounded-md`;
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
          {dayEvents.map((evt, idx) => (
            <div
              key={evt.id}
              className={getEventClass(evt)}
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
        </div>
      </div>
    </div>
  );
}