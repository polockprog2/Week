import React, { useState, useContext, useCallback } from "react";
import dayjs from "dayjs";
import Day from "./Day";
import GlobalContext from "../context/GlobalContext";

export default function Month({ month }) {
  const [selectedDays, setSelectedDays] = useState([]);
  const [dragging, setDragging] = useState(false);
  const { filteredEvents, filteredTasks, setShowEventModal, setShowTaskModal, setSelectedEvent, setSelectedTask } = useContext(GlobalContext);

  function handleMouseDown(day) {
    setDragging(true);
    setSelectedDays([day]);
  }

  function handleMouseEnter(day) {
    if (dragging) {
      setSelectedDays((prevDays) => {
        if (!prevDays.includes(day)) {
          return [...prevDays, day];
        }
        return prevDays;
      });
    }
  }

  function handleMouseUp() {
    setDragging(false);
    console.log("Selected Days:", selectedDays);
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

  return (
    <div
      className="flex-1 grid grid-cols-7 grid-rows-5 border-rounded-md shadow-md"
      onMouseUp={handleMouseUp}
    >
      {month.map((row, i) => (
        <React.Fragment key={i}>
          {row.map((day, idx) => (
            <Day
              day={day}
              key={idx}
              rowIdx={i}
              onMouseDown={() => handleMouseDown(day)}
              onMouseEnter={() => handleMouseEnter(day)}
              isSelected={selectedDays.includes(day)}
              events={filteredEvents.filter(
                (evt) => dayjs(evt.day).format("DD-MM-YY") === day.format("DD-MM-YY")
              )}
              tasks={filteredTasks.filter(
                (task) => dayjs(task.dueDate).format("DD-MM-YY") === day.format("DD-MM-YY")
              )}
              onEventClick={handleEventClick}
              onTaskClick={handleTaskClick}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}