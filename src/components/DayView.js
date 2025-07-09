import React, { useContext, useState, useEffect, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import GlobalContext from "../context/GlobalContext";

export default function DayView() {
  const { 
    daySelected, 
    savedEvents, 
    savedTasks, 
    setShowEventModal, 
    setDaySelected,
    setSelectedEvent,
    dispatchCalEvent,
    viewMode,
    setShowTaskModal,
  } = useContext(GlobalContext);
  
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [resizingEvent, setResizingEvent] = useState(null);
  const [resizeType, setResizeType] = useState(null); // 'start' or 'end'

  // Filter events for current day with proper time comparison
  const dayEvents = useMemo(() => 
    savedEvents.filter(event => event && dayjs(event.day).format('YYYY-MM-DD') === daySelected.format('YYYY-MM-DD'))
      .sort((a, b) => {
        const aStart = dayjs(a.startTime || a.day);
        const bStart = dayjs(b.startTime || b.day);
        return aStart.diff(bStart);
      }),
    [savedEvents, daySelected]
  );

  // Filter tasks for current day
  const dayTasks = useMemo(() => 
    savedTasks.filter(task => task && dayjs(task.dueDate).format('YYYY-MM-DD') === daySelected.format('YYYY-MM-DD')),
    [savedTasks, daySelected]
  );

  // Handle time slot click
  const handleTimeSlotClick = useCallback((hour, minute = 0) => {
    if (viewMode !== 'day') return; // Only allow creating events in day view
    
    const selectedDateTime = daySelected
      .hour(hour)
      .minute(minute)
      .second(0)
      .millisecond(0);

    setDaySelected(selectedDateTime);
    setSelectedEvent(null); // Clear any selected event
    setTimeout(() => setShowEventModal(true), 0); // Delay to ensure modal opens after state update
  }, [daySelected, setDaySelected, setShowEventModal, setSelectedEvent, viewMode]);

  // Handle event click
  const handleEventClick = useCallback((event, e) => {
    e?.stopPropagation(); // Prevent time slot click
    if (viewMode !== 'day') return;
    if (draggedEvent || resizingEvent) return; // Don't open modal while dragging/resizing
    
    setSelectedEvent(event);
    // Then show the modal
    setTimeout(() => setShowEventModal(true), 0);
  }, [setSelectedEvent, setShowEventModal, draggedEvent, resizingEvent, viewMode]);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hoursOfDay = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const quarterHours = useMemo(() => [0, 15, 30, 45], []);
  
  // Calculate overlapping events
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

  // Enhanced time position calculation with validation
  const getTimePosition = useCallback((time) => {
    if (!time || !dayjs.isDayjs(time)) return '0px';
    const minutes = Math.min(Math.max(time.hour() * 60 + time.minute(), 0), 1439); // Limit to 23:59
    return `${minutes}px`;
  }, []);

  // Snap time to nearest 15 minutes
  const snapToGrid = useCallback((minutes) => {
    return Math.round(minutes / 15) * 15;
  }, []);

  // Fixed event style calculation
  const getEventStyle = useCallback((event) => {
    if (!event) return {};
    const startTime = dayjs(event.startTime || event.day);
    const endTime = dayjs(event.endTime || startTime.add(1, 'hour'));
    const startMinutes = Math.min(Math.max(startTime.hour() * 60 + startTime.minute(), 0), 1439);
    const endMinutes = Math.min(Math.max(endTime.hour() * 60 + endTime.minute(), 0), 1439);
    const durationMinutes = Math.max(endMinutes - startMinutes, 30);
    const overlappingEvents = getOverlappingEvents(event, dayEvents);
    const totalOverlapping = overlappingEvents.length + 1;
    const position = overlappingEvents.findIndex(evt => evt.id < event.id) + 1;
    const width = totalOverlapping > 1 ? `${90 / totalOverlapping}%` : '90%';
    return {
      top: `${startMinutes}px`,
      height: `${Math.max(durationMinutes, 30)}px`,
      width,
      left: position ? `${(position * 95) / (overlappingEvents.length + 1)}%` : '2.5%',
      zIndex: draggedEvent?.id === event.id ? 30 : 20
    };
  }, [dayEvents, draggedEvent, getOverlappingEvents]);

  // Drag handlers
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
      startTime: daySelected
        .hour(Math.floor(minutes / 60))
        .minute(minutes % 60)
        .format('YYYY-MM-DD HH:mm'),
      endTime: daySelected
        .hour(Math.floor(minutes / 60))
        .minute(minutes % 60)
        .add(dayjs(draggedEvent.endTime).diff(draggedEvent.startTime, 'minute'), 'minute')
        .format('YYYY-MM-DD HH:mm')
    };
    
    setDraggedEvent(updatedEvent);
  }, [draggedEvent, dragOffset, daySelected, snapToGrid]);

  const handleDragEnd = useCallback(() => {
    if (draggedEvent) {
      dispatchCalEvent({ type: 'update', payload: draggedEvent });
      setDraggedEvent(null);
      setDragOffset(0);
    }
  }, [draggedEvent, dispatchCalEvent]);

  // Resize handlers
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
      [resizeType === 'start' ? 'startTime' : 'endTime']: daySelected
        .hour(Math.floor(minutes / 60))
        .minute(minutes % 60)
        .format('YYYY-MM-DD HH:mm')
    };
    
    setResizingEvent(updatedEvent);
  }, [resizingEvent, resizeType, daySelected, snapToGrid]);

  const handleResizeEnd = useCallback(() => {
    if (resizingEvent) {
      dispatchCalEvent({ type: 'update', payload: resizingEvent });
      setResizingEvent(null);
      setResizeType(null);
    }
  }, [resizingEvent, dispatchCalEvent]);

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gray-50">
      <header className="flex items-center justify-between px-4 py-2 border-b sticky top-0 bg-white z-20 shadow-sm">
        <div className="flex items-center space-x-5 ml-12">
          <button 
            onClick={() => setDaySelected(daySelected.subtract(1, "day"))}
            className="p-2 hover:bg-blue-50 rounded-full transition-colors"
            title="Previous Day"
          >
            <span className="material-icons-outlined text-blue-500">chevron_left</span>
          </button>
          <button 
            onClick={() => setDaySelected(daySelected.add(1, "day"))}
            className="p-2 hover:bg-blue-50 rounded-full transition-colors"
            title="Next Day"
          >
            <span className="material-icons-outlined text-blue-500">chevron_right</span>
          </button>
          <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <span className="material-icons-outlined text-blue-400">calendar_today</span>
            {daySelected.format("dddd, MMMM D, YYYY")}
          </h2>
        </div>
      </header>

      <div className="flex flex-1 relative z-0">
        {/* Time labels */}
        <div className="w-20 border-r bg-white sticky left-0 z-20">
          {hoursOfDay.map(hour => (
            <div key={hour} className={`h-[60px] border-t border-gray-200 ${currentTime.hour() === hour && daySelected.isSame(currentTime, 'day') ? 'bg-blue-50' : ''}`}>
              <div className="text-xs text-gray-500 text-right pr-2 -mt-2.6">
                {dayjs().hour(hour).format("h A")}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div 
          className="flex-1 relative bg-gray-50"
          onMouseMove={(e) => {
            handleDrag(e);
            handleResize(e);
          }}
          onMouseUp={() => {
            handleDragEnd();
            handleResizeEnd();
          }}
          onMouseLeave={() => {
            handleDragEnd();
            handleResizeEnd();
          }}
        >
          {/* Hour blocks */}
          {hoursOfDay.map(hour => (
            <div key={hour} className="relative h-[60px]">
              {quarterHours.map(quarter => (
                <div
                  key={quarter}
                  onClick={() => handleTimeSlotClick(hour, quarter)}
                  className={`absolute w-full border-t ${
                    quarter === 0 ? 'border-gray-200' : 'border-gray-100'
                  } hover:bg-blue-100/30 text-lg text-white cursor-pointer transition-colors`}
                  style={{ top: `${quarter}px` }}
                />
              ))}
            </div>
          ))}

          {/* Current time indicator */}
          {daySelected.isSame(dayjs(), 'day') && (
            <div 
              className="absolute w-full border-t-2 border-red-500 z-30 transition-all duration-500"
              style={{ top: getTimePosition(currentTime) }}
            >
              <div className="absolute -left-2 -top-2 w-4 h-4 bg-red-500 rounded-full shadow-md border-2 border-white" />
            </div>
          )}

          {/* Events */}
          {dayEvents.filter(Boolean).length === 0 && dayTasks.filter(Boolean).length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none select-none">
              <span className="material-icons-outlined text-6xl mb-2">event_busy</span>
              <p className="text-lg">No events or tasks for this day.</p>
            </div>
          )}
          {dayEvents.filter(Boolean).map(event => {
            const isBeingDragged = draggedEvent?.id === event.eventId;
            const isBeingResized = resizingEvent?.id === event.eventId;
            const eventToRender = isBeingDragged ? draggedEvent : 
                                isBeingResized ? resizingEvent : event;

            return (
              <div
                key={event.id}
                className={`absolute rounded-lg p-3 text-sm text-white shadow-md
                  bg-${event.label}-500 border border-${event.label}-500 
                  ${isBeingDragged || isBeingResized ? 'shadow-lg opacity-90' : 'hover:shadow-lg'}
                  transition-all cursor-move overflow-hidden flex items-center gap-2`}
                style={getEventStyle(eventToRender)}
                onMouseDown={(e) => handleDragStart(event, e)}
                onClick={() => !draggedEvent && !resizingEvent && handleEventClick(event)}
              >
                {/* Resize handles */}
                <div 
                  className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-gray-200/50"
                  onMouseDown={(e) => handleResizeStart(event, 'start', e)}
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-gray-200/50"
                  onMouseDown={(e) => handleResizeStart(event, 'end', e)}
                />
                <span className="material-icons-outlined text-lg text-white/80 mr-1">event</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-base h-6 truncate">{event.title}</div>
                  <div className="font-semibold text-xs text-white-900">
                    {dayjs(event.startTime || event.day).format("h:mm A")} - 
                    {dayjs(event.endTime || event.day).format("h:mm A")}
                  </div>
                  {event.location && (
                    <div className="font-semibold text-xs text-white-200 truncate mt-1 flex items-center gap-1">
                      <span className="material-icons-outlined text-white/70 text-base">location_on</span>
                      {event.location}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Tasks */}
          {dayTasks.filter(Boolean).map(task => {
            const isBeingDragged = draggedEvent?.id === (task.id || task.TaskId);
            const isBeingResized = resizingEvent?.id === (task.id || task.TaskId);
            const taskToRender = isBeingDragged ? draggedEvent : 
                                isBeingResized ? resizingEvent : task;

            return (
              <div
                key={task.id || task.TaskId}
                className={`absolute left-[2px] right-[2px] rounded-lg p-3 text-sm text-white shadow-md
                  bg-${task.label}-500 border border-${task.label}-500 
                  ${isBeingDragged || isBeingResized ? 'shadow-lg opacity-90' : 'hover:shadow-lg'}
                  transition-all cursor-move overflow-hidden flex items-center gap-2`}
                style={{
                  top: getTimePosition(dayjs(task.dueDate)),
                  zIndex: 25
                }}
                onClick={() => handleEventClick(task)}
              >
                {/* Resize handles for tasks (optional, if you want parity with events) */}
                <div 
                  className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-gray-200/50"
                  onMouseDown={(e) => handleResizeStart(task, 'start', e)}
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-gray-200/50"
                  onMouseDown={(e) => handleResizeStart(task, 'end', e)}
                />
                <span className="material-icons-outlined text-lg text-white/80 mr-1">check_circle</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-base truncate">{task.title}</div>
                  <div className="font-semibold text-xs text-white-900">
                    {dayjs(task.dueDate).format("h:mm A")}
                  </div>
                  {task.location && (
                    <div className="font-semibold text-xs text-white-200 truncate mt-1 flex items-center gap-1">
                      <span className="material-icons-outlined text-white/70 text-base">location_on</span>
                      {task.location}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}