import React, { useContext, useState, useEffect, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import GlobalContext from "../context/GlobalContext";
import CreateModal from "./CreateModal";
import EventModal from "./EventModal";
import TaskModal from "./TaskModal";

export default function WeekView() {
  const { 
    savedEvents, 
    savedTasks, 
    setShowEventModal,
    setShowTaskModal, 
    setDaySelected,
    setSelectedEvent,
    setSelectedTask,
    dispatchCalEvent,
    dispatchCalTask,
    viewMode,
    showEventModal,
    showTaskModal,
    selectedEvent,
    selectedTask,
  } = useContext(GlobalContext);
  
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [startOfWeek, setStartOfWeek] = useState(dayjs().startOf("week"));
  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedItemType, setDraggedItemType] = useState(null); 
  const [resizingItem, setResizingItem] = useState(null);
  const [resizingItemType, setResizingItemType] = useState(null); 
  const [resizeType, setResizeType] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);

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
    if (viewMode !== 'week') return;
    
    const selectedDateTime = day.hour(hour).minute(minute).second(0).millisecond(0);
    setDaySelected(selectedDateTime);
    setSelectedEvent(null);
    setSelectedTask(null);
  }, [setDaySelected, setSelectedEvent, setSelectedTask, viewMode]);

  const handleEventClick = useCallback((event, e) => {
    e?.stopPropagation(); // Prevent time slot click
    if (viewMode !== 'week') return;
    if (draggedItem || resizingItem) return; // Don't open modal while dragging/resizing
    
    setSelectedEvent(event); // Set the selected event
    setTimeout(() => setShowEventModal(true), 0); // Open the modal
  }, [setSelectedEvent, setShowEventModal, draggedItem, resizingItem, viewMode]);

  const handleTaskClick = useCallback((task, e) => {
    e?.stopPropagation(); // Prevent time slot click
    if (viewMode !== 'week') return;
    
    setSelectedTask(task); // Set the selected task
    setTimeout(() => setShowTaskModal(true), 1); // Open the modal
  }, [setSelectedTask, setShowEventModal, viewMode]);

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
      zIndex: draggedItem?.id === event.id ? 30 : 20
    };
  }, [savedEvents, draggedItem, getOverlappingEvents]);

  const snapToGrid = useCallback((minutes) => {
    return Math.round(minutes / 15) * 15;
  }, []);

  const handleDragStart = useCallback((item, type, e) => {
    e.stopPropagation();
    setDraggedItem(item);
    setDraggedItemType(type);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset(e.clientY - rect.top);
  }, []);

  const getTaskStyle = useCallback((task, day) => {
    const dueTime = dayjs(task.dueDate);
    const minutes = dueTime.hour() * 60 + dueTime.minute();
    
    return {
      top: `${(minutes / 60) * 50}px`,
      zIndex: draggedItem?.id === task.id ? 30 : 25
    };
  }, [draggedItem]);

  const handleDrag = useCallback((e) => {
    if (!draggedItem) return;
    
    const gridRect = e.currentTarget.getBoundingClientRect();
    const y = Math.max(0, e.clientY - gridRect.top - dragOffset);
    const minutes = snapToGrid(Math.floor(y / 50 * 60));
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    if (draggedItemType === 'event') {
      const updatedEvent = {
        ...draggedItem,
        startTime: dayjs(draggedItem.startTime || draggedItem.day)
          .hour(hour)
          .minute(minute)
          .format('YYYY-MM-DD HH:mm'),
        endTime: dayjs(draggedItem.endTime || draggedItem.startTime || draggedItem.day)
          .hour(hour)
          .minute(minute)
          .add(dayjs(draggedItem.endTime).diff(dayjs(draggedItem.startTime), 'minute'), 'minute')
          .format('YYYY-MM-DD HH:mm')
      };
      setDraggedItem(updatedEvent);
    } else if (draggedItemType === 'task') {
      const updatedTask = {
        ...draggedItem,
        dueDate: dayjs(draggedItem.dueDate)
          .hour(hour)
          .minute(minute)
          .format('YYYY-MM-DD HH:mm')
      };
      setDraggedItem(updatedTask);
    }
  }, [draggedItem, draggedItemType, dragOffset, snapToGrid]);

  const handleDragEnd = useCallback(() => {
    if (draggedItem) {
      if (draggedItemType === 'event') {
        dispatchCalEvent({ 
          type: "update", 
          payload: draggedItem,
          itemType: draggedItemType 
        });
      } else if (draggedItemType === 'task') {
        dispatchCalTask({ 
          type: "update", 
          payload: draggedItem,
          itemType: draggedItemType 
        });
      }
    }
    setDraggedItem(null);
    setDraggedItemType(null);
    setDragOffset(0);
}, [draggedItem, draggedItemType, dispatchCalEvent, dispatchCalTask]);


  const handleResizeStart = useCallback((item, type, resizePos, e) => {
    e.stopPropagation();
    setResizingItem(item);
    setResizingItemType(type);
    setResizeType(resizePos);
  }, []);

  const handleResize = useCallback((e) => {
    if (!resizingItem) return;
    
    const gridRect = e.currentTarget.getBoundingClientRect();
    const y = Math.max(0, e.clientY - gridRect.top);
    const minutes = snapToGrid(Math.floor(y));
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;

    if (resizingItemType === 'event') {
      const updatedEvent = {
        ...resizingItem,
        [resizeType === 'start' ? 'startTime' : 'endTime']: dayjs(resizingItem[resizeType === 'start' ? 'startTime' : 'endTime'])
          .hour(hour)
          .minute(minute)
          .format('YYYY-MM-DD HH:mm')
      };
      setResizingItem(updatedEvent);
    } else if (resizingItemType === 'task') {
      const updatedTask = {
        ...resizingItem,
        dueDate: dayjs(resizingItem.dueDate)
          .hour(hour)
          .minute(minute)
          .format('YYYY-MM-DD HH:mm')
      };
      setResizingItem(updatedTask);
    }
  }, [resizingItem, resizingItemType, resizeType, snapToGrid]);

  const handleResizeEnd = useCallback(() => {
    if (resizingItem) {
      dispatchCalEvent({ 
        type: 'update', 
        payload: resizingItem,
        itemType: resizingItemType 
      });
      setResizingItem(null);
      setResizingItemType(null);
      setResizeType(null);
    }
  }, [resizingItem, resizingItemType, dispatchCalEvent]);

  const isBeingDragged = (item) => draggedItem?.id === item.id && 
    ((item.startTime && draggedItemType === 'event') || 
     (item.dueDate && draggedItemType === 'task'));
  
  const isBeingResized = (item) => resizingItem?.id === item.id && 
    ((item.startTime && resizingItemType === 'event') || 
     (item.dueDate && resizingItemType === 'task'));

  return (
    <div className="flex-1 h-screen overflow-hidden" onMouseMove={(e) => {
      handleDrag(e);
      handleResize(e);
    }} onMouseUp={(e) => {
      handleDragEnd(e);
      handleResizeEnd(e);
    }}>
      {/* Week days header */}
      <header className="flex items-center justify-between px-4 py-2 border-b sticky top-0 bg-white z-20">
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
          className="px-4 py-2 bg-gray-600 font-semibold rounded-lg hover:bg-white"
        >
          Today
        </button>
      </header>
      
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
        <div className="w-20 flex flex-col items-center">
          {hoursOfDay.map(hour => (
            <div key={hour} className="h-[50px] border-t border-gray-200 w-full text-center">
              <span className="text-sm text-gray-500">{dayjs().hour(hour).format("h A")}</span>
            </div>
          ))}
        </div>
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

                {/* Render Events */}
                {savedEvents
                  .filter(evt => dayjs(evt.day).isSame(day, 'day') && dayjs(evt.day).hour() === hour)
                  .map(event => {
                    const isDragging = isBeingDragged(event);
                    const isResizing = isBeingResized(event);
                    const eventToRender = isDragging ? draggedItem : 
                                        isResizing ? resizingItem : event;

                    return (
                      <div
                        key={event.id}
                        className={`absolute rounded-lg p-2 text-sm 
                          bg-${event.label}-600 text-white
                          ${isDragging || isResizing ? 'shadow-lg opacity-90' : 'hover:shadow-md'}
                          transition-all cursor-move overflow-hidden`}
                        style={getEventStyle(eventToRender, day)}
                        onMouseDown={(e) => handleDragStart(event, 'event', e)}
                        onClick={(e) => !draggedItem && !resizingItem && handleEventClick(event, e)}
                      >
                        <div 
                          className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/10"
                          onMouseDown={(e) => handleResizeStart(event, 'event', 'start', e)}
                        />
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize hover:bg-black/10"
                          onMouseDown={(e) => handleResizeStart(event, 'event', 'end', e)}
                        />
                        <div className="flex items-center space-x-1">
                          <div className="w-1 h-full absolute left-0 top-0 bg-gray-400 opacity-50" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-xs text-white truncate">{event.title}</div>
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

                {/* Render Tasks */}
                {savedTasks
                  .filter(task => dayjs(task.dueDate).isSame(day, 'day') && dayjs(task.dueDate).hour() === hour)
                  .map(task => {
                    const isDragging = isBeingDragged(task);
                    const taskToRender = isDragging ? draggedItem : task;

                    return (
                      <div
                        key={task.id}
                        className={`absolute left-[5px] right-[5px] h-9 rounded-lg p-2 text-white 
                          text-sm bg-${task.label}-600 border border-${task.label}-200 
                          ${isDragging ? 'shadow-lg opacity-90 z-30' : 'hover:shadow-md z-25'}
                          transition-all cursor-move`}
                        style={getTaskStyle(taskToRender, day)}
                        onMouseDown={(e) => handleDragStart(task, 'task', e)}
                        onClick={(e) => !draggedItem && handleTaskClick(task, e)}
                      >
                        <div className="font-semibold truncate">
                          <span className="mr-1">⚑</span>
                          {task.title}
                          <span className="ml-2 text-white text-xs text-gray-600">
                            {dayjs(taskToRender.dueDate).format("h:mm A")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Render CreateModal when needed */}
      {(showEventModal || showTaskModal) && !selectedEvent && !selectedTask && <CreateModal />}
      {selectedEvent && <EventModal />}
      {selectedTask && <TaskModal />}
    </div>
  );
}
//Tasks drag end  need to be fixed