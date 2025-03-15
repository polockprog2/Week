import React, { useContext, useState, useEffect } from "react";
import GlobalContext from "../context/GlobalContext";
import EventModal from "./EventModal";
import TaskModal from "./TaskModal";

export default function CreateModal() {
  const { 
    setShowEventModal, 
    setShowTaskModal,
    daySelected,
    selectedEvent,
    selectedTask,
  } = useContext(GlobalContext);

  const [showTypeSelector, setShowTypeSelector] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Position the modal near the clicked time slot
    const timeSlotHeight = 50; // height of each time slot in pixels
    const headerHeight = 120; // approximate height of headers
    const hour = daySelected.hour();
    const y = headerHeight + (hour * timeSlotHeight);
    
    // Center horizontally in the day column
    const dayWidth = window.innerWidth / 8; // 7 days + time gutter
    const dayIndex = daySelected.day();
    const x = (dayIndex + 1) * dayWidth;

    setPosition({ x, y });
  }, [daySelected]);

  if (selectedType === 'event') {
    return <EventModal />;
  }

  if (selectedType === 'task') {
    return <TaskModal />;
  }

  if (!showTypeSelector) return null;

  return (
    <div 
      className="fixed z-50"
      style={{ 
        top: `${position.y}px`, 
        left: `${position.x}px`,
        transform: 'translate(-50%, -50%)'
      }}
    >
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-2 space-y-2 w-48">
          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center space-x-2 transition-colors"
            onClick={() => setSelectedType('event')}
          >
            <span className="material-icons-outlined text-blue-500">event</span>
            <div>
              <div className="font-medium">Event</div>
              <div className="text-xs text-gray-500">Add event details</div>
            </div>
          </button>

          <button
            className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center space-x-2 transition-colors"
            onClick={() => setSelectedType('task')}
          >
            <span className="material-icons-outlined text-green-500">task_alt</span>
            <div>
              <div className="font-medium">Task</div>
              <div className="text-xs text-gray-500">Add task with due date</div>
            </div>
          </button>
        </div>
      </div>

      {/* Click outside handler */}
      <div 
        className="fixed inset-0 z-[-1]" 
        onClick={() => {
          setShowTypeSelector(false);
          setShowEventModal(false);
          setShowTaskModal(false);
        }}
      />
    </div>
  );
} 