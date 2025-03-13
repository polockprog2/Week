import React, { useContext, useState, useEffect, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import GlobalContext from "../context/GlobalContext";

export default function WeekView() {
  const { 
    savedEvents, 
    savedTasks, 
    setShowEventModal, 
    setDaySelected,
    setSelectedEvent,
    dispatchCalEvent,
    dispatchCalTask,
    handleTaskClick,
    viewMode,
  } = useContext(GlobalContext);
  
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [startOfWeek, setStartOfWeek] = useState(dayjs().startOf("week"));
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [resizingEvent, setResizingEvent] = useState(null);
  const [resizeType, setResizeType] = useState(null); // 'start' or 'end'

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 60000);
    return () => clearInterval(timer);
  }, []);

  const daysOfWeek = useMemo(() => 
    Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, "day")), 
    [startOfWeek]
  );

  const hoursOfDay = useMemo(() => 
    Array.from({ length: 24 }, (_, i) => i), 
    []
  );

  const currentTimePosition = useMemo(() => 
    `${(currentTime.hour() + currentTime.minute() / 60) * 50}px`, 
    [currentTime]
  );

  const handlePrevWeek = useCallback(() => {
    setStartOfWeek(startOfWeek.subtract(1, "week"));
  }, [startOfWeek]);

  const handleNextWeek = useCallback(() => {
    setStartOfWeek(startOfWeek.add(1, "week"));
  }, [startOfWeek]);

  const handleTimeSlotClick = useCallback((day, hour, minute = 0) => {
    if (viewMode !== 'week') return; // Only allow creating events in week view
    
    const selectedDateTime = day.hour(hour).minute(minute).second(0).millisecond(0);
    setDaySelected(selectedDateTime);
    setSelectedEvent(null); // Clear any selected event
    setTimeout(() => setShowEventModal(true), 0); // Delay to ensure modal opens after state update
  }, [setDaySelected, setShowEventModal, setSelectedEvent, viewMode]);

  const handleEventClick = useCallback((event, e) => {
    e?.stopPropagation(); // Prevent time slot click
    if (viewMode !== 'week') return;
    if (draggedEvent || resizingEvent) return; // Don't open modal while dragging/resizing
    
    setSelectedEvent(event); // Set the selected event
    setTimeout(() => setShowEventModal(true), 0); // Open the modal
  }, [setSelectedEvent, setShowEventModal, draggedEvent, resizingEvent, viewMode]);

  const getOverlappingEvents = useCallback((event, events) => {
    return events.filter(evt => {
      if (evt.id === event.id) return false;
      const eventStart = dayjs(event.startTime || event.day);
      const eventEnd = dayjs(event.endTime || eventStart.add(1, 'hour'));
      const evtStart = dayjs(evt.startTime || evt.day);
      const evtEnd = dayjs(evt.endTime || evtStart.add(1, 'hour'));
      return (eventStart.isBefore(evtEnd) && eventEnd.isAfter(evtStart));
    });
  }, []);

  const getEventStyle = useCallback((event, day) => {
    const startTime = dayjs(event.startTime || event.day);
    const endTime = dayjs(event.endTime || startTime.add(1, 'hour'));
    const startMinutes = startTime.hour() * 60 + startTime.minute();
    const endMinutes = endTime.hour() * 60 + endTime.minute();
    const durationMinutes = Math.max(endMinutes - startMinutes, 30);
    
    const overlappingEvents = getOverlappingEvents(event, savedEvents.filter(evt => dayjs(evt.day).isSame(day, 'day')));
    const totalOverlapping = overlappingEvents.length + 1;
    const position = overlappingEvents.findIndex(evt => evt.id < event.id) + 1;
    const width = totalOverlapping > 1 ? `${90 / totalOverlapping}%` : '90%';
    
    return {
      top: `${startMinutes / 60 * 50}px`,
      height: `${durationMinutes / 60 * 50}px`,
      width,
      left: position ? `${(position * 95) / (overlappingEvents.length + 1)}%` : '2.5%',
      zIndex: draggedEvent?.id === event.id ? 30 : 20
    };
  }, [savedEvents, draggedEvent, getOverlappingEvents]);

  const snapToGrid = useCallback((minutes) => {
    return Math.round(minutes / 15) * 15;
  }, []);

  const handleDragStart = useCallback((event, e) => {
    e.stopPropagation();
    setDraggedEvent(event);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset(e.clientY - rect.top);
  }, []);

  const handleDrag = useCallback((e) => {
    if (!draggedEvent) return;
    
    const gridRect = e.currentTarget.getBoundingClientRect();
    const y = Math.max(0, e.clientY - gridRect.top - dragOffset);
    const minutes = snapToGrid(Math.floor(y));
    
    const updatedEvent = {
      ...draggedEvent,
      startTime: dayjs(draggedEvent.startTime || draggedEvent.day)
        .hour(Math.floor(minutes / 60))
        .minute(minutes % 60)
        .format('YYYY-MM-DD HH:mm'),
      endTime: dayjs(draggedEvent.endTime || draggedEvent.startTime || draggedEvent.day)
        .hour(Math.floor(minutes / 60))
        .minute(minutes % 60)
        .add(dayjs(draggedEvent.endTime).diff(dayjs(draggedEvent.startTime), 'minute'), 'minute')
        .format('YYYY-MM-DD HH:mm')
    };
    
    setDraggedEvent(updatedEvent);
  }, [draggedEvent, dragOffset, snapToGrid]);

  const handleDragEnd = useCallback(() => {
    if (draggedEvent) {
      dispatchCalEvent({ type: 'update', payload: draggedEvent });
      setDraggedEvent(null);
      setDragOffset(0);
    }
  }, [draggedEvent, dispatchCalEvent]);

  const handleResizeStart = useCallback((event, type, e) => {
    e.stopPropagation();
    setResizingEvent(event);
    setResizeType(type);
  }, []);

  const handleResize = useCallback((e) => {
    if (!resizingEvent) return;
    
    const gridRect = e.currentTarget.getBoundingClientRect();
    const y = Math.max(0, e.clientY - gridRect.top);
    const minutes = snapToGrid(Math.floor(y));
    
    const updatedEvent = {
      ...resizingEvent,
      [resizeType === 'start' ? 'startTime' : 'endTime']: dayjs(resizingEvent[resizeType === 'start' ? 'startTime' : 'endTime'])
        .hour(Math.floor(minutes / 60))
        .minute(minutes % 60)
        .format('YYYY-MM-DD HH:mm')
    };
    
    setResizingEvent(updatedEvent);
  }, [resizingEvent, resizeType, snapToGrid]);

  const handleResizeEnd = useCallback(() => {
    if (resizingEvent) {
      dispatchCalEvent({ type: 'update', payload: resizingEvent });
      setResizingEvent(null);
      setResizeType(null);
    }
  }, [resizingEvent, dispatchCalEvent]);
  
  return (
    <div className="flex-1 h-screen overflow-y-auto" onMouseMove={handleDrag} onMouseUp={handleDragEnd}>
      <header className="flex items-center justify-between px-4 py-2 border-b sticky top-0 bg-white z-10">
        <div className="flex items-center space-x-4">
          <button onClick={handlePrevWeek} className="p-2 hover:bg-gray-100 rounded-full">
            <span className="material-icons-outlined">chevron_left</span>
          </button>
          <button onClick={handleNextWeek} className="p-2 hover:bg-gray-100 rounded-full">
            <span className="material-icons-outlined">chevron_right</span>
          </button>
          <h2 className="text-xl font-semibold">
            {startOfWeek.format("MMMM YYYY")}
          </h2>
        </div>
        <button 
          onClick={() => setStartOfWeek(dayjs().startOf("week"))}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Today
        </button>
      </header>
      {/* Week days header */}
      <div className="flex border-b sticky top-16 bg-white z-10">
        <div className="w-20" /> {/* Time gutter */}
        {daysOfWeek.map(day => (
          <div key={day.format("YYYY-MM-DD")} className="flex-1 text-center py-2">
            <div className="text-sm font-medium">{day.format("ddd")}</div>
            <div className={`text-2xl font-bold ${
              day.isSame(dayjs(), 'day') ? 'text-blue-600' : ''
            }`}>
              {day.format("D")}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-1 relative z-0">
  
        {daysOfWeek.map(day => (
          <div key={day.format("YYYY-MM-DD")} className="flex-1 relative">
            {day.isSame(dayjs(), 'day') && (
              <div 
                className="absolute w-full border-t-2 border-red-500 z-10"
                style={{ top: currentTimePosition }}
              >
                <div className="absolute -left-2 -top-2 w-4 h-4 bg-red-500 rounded-full" />
              </div>
            )}
            {hoursOfDay.map(hour => (
              <div 
                key={hour}
                className="h-[50px] border-t border-l border-gray-200 relative group"
                onClick={() => handleTimeSlotClick(day, hour)}
              >
                <div className="absolute w-full h-[1px] top-1/2 bg-gray-100" />

                {savedEvents
                  .filter(evt => dayjs(evt.day).isSame(day, 'day') && dayjs(evt.day).hour() === hour)
                  .map(event => {
                    const isBeingDragged = draggedEvent?.id === event.id;
                    const isBeingResized = resizingEvent?.id === event.id;
                    const eventToRender = isBeingDragged ? draggedEvent : 
                                        isBeingResized ? resizingEvent : event;

                    return (
                      <div
                        key={event.id}
                        className={`absolute rounded-lg p-2 text-sm 
                          bg-${event.label}-600 border border-${event.label}-600 
                          ${isBeingDragged || isBeingResized ? 'shadow-lg opacity-90' : 'hover:shadow-md'}
                          transition-all cursor-move overflow-hidden`}
                        style={getEventStyle(eventToRender, day)}
                        onMouseDown={(e) => handleDragStart(event, e)}
                        onClick={(e) => !draggedEvent && !resizingEvent && handleEventClick(event, e)}
                      >
                        <div 
                          className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-gray-200/50"
                          onMouseDown={(e) => handleResizeStart(event, 'start', e)}
                        />
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-gray-200/50"
                          onMouseDown={(e) => handleResizeStart(event, 'end', e)}
                        />
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-full absolute left-0 top-0 bg-gray-400 opacity-50" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text=xs text-white truncate">{event.title}</div>
                            <div className="text-xs text-white font-bold">
                              {dayjs(event.startTime || event.day).format("h:mm A")} - 
                              {dayjs(event.endTime || event.day).format("h:mm A")}
                            </div>
                            {event.location && (
                              <div className="text-xs text-white font-bold truncate mt-1">
                                📍 {event.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}