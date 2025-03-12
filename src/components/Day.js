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
    multiDaySelection,
    setMultiDaySelection,
    dispatchCalEvent,
    dispatchCalTask,
  } = useContext(GlobalContext);

  useEffect(() => {
    setDayEvents(events);
    setDayTasks(tasks);
  }, [events, tasks]);

  function getCurrentDayClass() {
    return day.format("DD-MM-YY") === dayjs().format("DD-MM-YY")
      ? "bg-blue-600 text-white rounded-full w-7"
      : "";
  }

  function handleDayClick() {
    setDaySelected(day);
    setShowEventModal(true);
  }

  function handleEventClick(event) {
    setSelectedEvent(event);
    setShowEventModal(true);
  }

  function handleTaskClick(task) {
    setSelectedTask(task);
    setShowTaskModal(true);
  }

  function handleDayMouseDown() {
    setMultiDaySelection([day]);
  }

  function handleDayMouseUp() {
    if (multiDaySelection.length > 1) {
      setShowEventModal(true);
    }
  }

  function handleMouseEnter() {
    if (multiDaySelection.length > 0) {
      setMultiDaySelection((prev) => {
        if (!prev.some((d) => d.isSame(day, "day"))) {
          return [...prev, day];
        }
        return prev;
      });
    }
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
      className="border border-gray-200 flex flex-col"
      onMouseDown={handleDayMouseDown}
      onMouseUp={handleDayMouseUp}
      onMouseEnter={handleMouseEnter}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleDayClick} // Add this line to handle day click
    >
      <header className="flex flex-col items-center">
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
        {dayEvents.map((evt, idx) => (
          <div
            key={idx}
            className={`bg-${evt.label}-500 p-1 mr-3 text-white font-bold text-sm rounded mb-1 truncate`}
            onClick={() => handleEventClick(evt)}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", JSON.stringify({ ...evt, type: "event" }));
            }}
          >
            {evt.title}
          </div>
        ))}
        {dayTasks.map((task, idx) => (
          <div
            key={idx}
            className={`bg-${task.label}-500 p-1 mr-3 text-white font-bold text-sm rounded mb-1 truncate`}
            onClick={() => handleTaskClick(task)}
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
  );
}