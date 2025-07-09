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

  // Helper to group overlapping items (events or tasks)
  function getOverlapGroups(items, getStart, getEnd) {
    const sorted = [...items].sort((a, b) => getStart(a) - getStart(b));
    const groups = [];
    let group = [];
    let lastEnd = null;
    for (const item of sorted) {
      const start = getStart(item);
      const end = getEnd(item);
      if (group.length === 0 || start < lastEnd) {
        group.push(item);
        lastEnd = Math.max(lastEnd || 0, end);
      } else {
        groups.push(group);
        group = [item];
        lastEnd = end;
      }
    }
    if (group.length) groups.push(group);
    return groups;
  }

  // Prepare all items (events + tasks) for overlap calculation
  const allItems = [
    ...dayEvents.filter(Boolean).map(e => ({ ...e, _type: 'event' })),
    ...dayTasks.filter(Boolean).map(t => ({ ...t, _type: 'task' }))
  ];
  const getStart = item => item._type === 'event' ? dayjs(item.startTime || item.day).valueOf() : dayjs(item.dueDate).valueOf();
  const getEnd = item => item._type === 'event' ? dayjs(item.endTime || item.day).valueOf() : dayjs(item.dueDate).add(30, 'minute').valueOf();
  const overlapGroups = getOverlapGroups(allItems, getStart, getEnd);

  // Map each item to its group and column
  const itemPositions = new Map();
  overlapGroups.forEach(group => {
    group.forEach((item, idx) => {
      itemPositions.set(item.id || item.eventId || item.taskId || item.TaskId, {
        col: idx,
        total: group.length
      });
    });
  });

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

          {/* Events and Tasks: render all together, side by side if overlapping */}
          {allItems.map(item => {
            const isBeingDragged = draggedEvent?.id === (item.id || item.eventId || item.taskId || item.TaskId);
            const isBeingResized = resizingEvent?.id === (item.id || item.eventId || item.taskId || item.TaskId);
            const itemToRender = isBeingDragged ? draggedEvent : isBeingResized ? resizingEvent : item;
            const pos = itemPositions.get(item.id || item.eventId || item.taskId || item.TaskId) || { col: 0, total: 1 };
            const width = `${100 / pos.total}%`;
            const left = `${(100 / pos.total) * pos.col}%`;
            const top = item._type === 'event'
              ? getTimePosition(dayjs(itemToRender.startTime || itemToRender.day))
              : getTimePosition(dayjs(itemToRender.dueDate));
            const height = item._type === 'event'
              ? (() => {
                  const start = dayjs(itemToRender.startTime || itemToRender.day);
                  const end = dayjs(itemToRender.endTime || start.add(1, 'hour'));
                  return `${Math.max(end.diff(start, 'minute'), 30)}px`;
                })()
              : '30px';
            const borderColor = item._type === 'task' ? 'border-l-4 border-green-400' : 'border-l-4 border-blue-400';
            const tooltip = item._type === 'event'
              ? `${item.title}\n${dayjs(itemToRender.startTime || itemToRender.day).format('h:mm A')} - ${dayjs(itemToRender.endTime || itemToRender.day).format('h:mm A')}`
              : `${item.title}\n${dayjs(itemToRender.dueDate).format('h:mm A')}`;
            return (
              <div
                key={item.id || item.eventId || item.taskId || item.TaskId}
                className={`absolute rounded-lg p-3 text-sm text-white shadow-md bg-${item.label}-500 border border-${item.label}-500 ${borderColor} ${isBeingDragged || isBeingResized ? 'shadow-lg opacity-90' : 'hover:shadow-xl hover:bg-opacity-90'} transition-all cursor-move overflow-hidden flex items-center gap-2`}
                style={{
                  top,
                  height,
                  width,
                  left,
                  zIndex: isBeingDragged || isBeingResized ? 30 : 20
                }}
                title={tooltip}
                onMouseDown={item._type === 'event' ? (e) => handleDragStart(item, e) : undefined}
                onClick={() => !draggedEvent && !resizingEvent && handleEventClick(item)}
              >
                {/* Resize handles for events and tasks */}
                {item._type === 'event' && (
                  <>
                    <div 
                      className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-gray-200/50"
                      onMouseDown={(e) => handleResizeStart(item, 'start', e)}
                    />
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-gray-200/50"
                      onMouseDown={(e) => handleResizeStart(item, 'end', e)}
                    />
                  </>
                )}
                {item._type === 'task' && (
                  <>
                    <div 
                      className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-gray-200/50"
                      onMouseDown={(e) => handleResizeStart(item, 'start', e)}
                    />
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-gray-200/50"
                      onMouseDown={(e) => handleResizeStart(item, 'end', e)}
                    />
                  </>
                )}
                <span className={`material-icons-outlined text-lg mr-1 ${item._type === 'task' ? 'text-blue-400' : 'text-white-300'}`}>{item._type === 'task' ? 'check_circle' : 'event'}</span>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-base truncate ${item._type === 'task' ? 'text-white-400' : 'text-white'}`}>{item.title}</div>
                  <div className="font-semibold text-xs text-white-900">
                    {item._type === 'event'
                      ? `${dayjs(itemToRender.startTime || itemToRender.day).format('h:mm A')} - ${dayjs(itemToRender.endTime || itemToRender.day).format('h:mm A')}`
                      : dayjs(itemToRender.dueDate).format('h:mm A')}
                  </div>
                  {item.location && (
                    <div className={`font-semibold text-xs truncate mt-1 flex items-center gap-1 ${item._type === 'task' ? 'text-green-400' : 'text-blue-100'}`}>
                      <span className={`material-icons-outlined text-base ${item._type === 'task' ? 'text-green-400' : 'text-blue-100'}`}>location_on</span>
                      {item.location}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* No events or tasks message */}
          {dayEvents.filter(Boolean).length === 0 && dayTasks.filter(Boolean).length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none select-none">
              <span className="material-icons-outlined text-6xl mb-2">event_busy</span>
              <p className="text-lg">No events or tasks for this day.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}