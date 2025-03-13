import React, { useContext } from "react";
import dayjs from "dayjs";
import GlobalContext from "../context/GlobalContext";

export default function CalendarEvent({ event }) {
  const { setSelectedEvent, setSelectedTask,setShowEventModal } = useContext(GlobalContext);

  function handleDragStart(e) {
    e.dataTransfer.setData("text/plain", JSON.stringify(event));
  }

  function handleClick() {
    setSelectedEvent(event);
    setSelectedTask(task);
    setShowEventModal(true);
  }

  const startTime = dayjs(event.startTime).format("h:mm A");
  const endTime = dayjs(event.endTime).format("h:mm A");
  
  return (
    <div
      className={`calendar-event border-rounded-500 text-black-900 bg-${event.label}-500 hover:bg-${event.label}-500 cursor-pointer`}
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
    >
      <span className="font-bold">{event.title}</span>
      <span className="text-white/90">{event.startTime} - {event.endTime}</span>
    </div>
    
  );
}