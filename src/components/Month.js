import React, { useState, useContext } from "react";
import dayjs from "dayjs";
import Day from "./Day";
import GlobalContext from "../context/GlobalContext";

export default function Month({ month }) {
  const [selectedDays, setSelectedDays] = useState([]);
  const [dragging, setDragging] = useState(false);
  const { filteredEvents, filteredTasks } = useContext(GlobalContext);

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
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}