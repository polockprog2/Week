import React, { useContext, useState } from "react";
import dayjs from "dayjs";
import GlobalContext from "../context/GlobalContext";
import EventPopover from "./EventPopover";

export default function CustomCalendar() {
  const { savedEvents, setShowEventModal, setSelectedEvent } = useContext(GlobalContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverContent, setPopoverContent] = useState(null);

  const daysInMonth = dayjs().daysInMonth();
  const startOfMonth = dayjs().startOf("month").day();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleDayClick = (day) => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEventClick = (event, el) => {
    setSelectedEvent(event);
    setPopoverContent(event);
    setAnchorEl(el);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setPopoverContent(null);
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="calendar-header-day">
            {day}
          </div>
        ))}
      </div>
      <div className="calendar-body">
        {Array.from({ length: startOfMonth }).map((_, i) => (
          <div key={i} className="calendar-day empty"></div>
        ))}
        {daysArray.map((day) => (
          <div key={day} className="calendar-day" onClick={() => handleDayClick(day)}>
            <div className="calendar-day-number">{day}</div>
            <div className="calendar-events">
              {savedEvents
                .filter((event) => dayjs(event.date).date() === day)
                .map((event) => (
                  <div
                    key={event.id}
                    className="calendar-event"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event, e.currentTarget);
                    }}
                  >
                    {event.title}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
      <EventPopover
        anchorEl={anchorEl}
        event={popoverContent}
        onClose={handleClosePopover}
      />
    </div>
  );
}