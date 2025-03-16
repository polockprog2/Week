import React, { useContext, useState } from "react";
import GlobalContext from "../context/GlobalContext";
import dayjs from "dayjs";

const priorityClasses = ["low", "medium", "high"];
const statusClasses = ["todo", "in-progress", "done"];
const labelsClasses = ["purple", "indigo", "blue", "green", "yellow","red","pink","gray"];  

export default function TaskModal() {
  const {
    setShowTaskModal,
    setShowEventModal,
    daySelected,
    dispatchCalTask,
    selectedTask,
    setSelectedTask,
    setSelectedEvent,
    showTaskModal,
    dispatchCalEvent,
  } = useContext(GlobalContext);

  const [title, setTitle] = useState(selectedTask ? selectedTask.title : "");
  const [description, setDescription] = useState(
    selectedTask ? selectedTask.description : ""
  );
  const [dueDate, setDueDate] = useState(
    selectedTask ? selectedTask.dueDate : daySelected.format("YYYY-MM-DD")
  );
  const [priority, setPriority] = useState(
    selectedTask ? selectedTask.priority : priorityClasses[0]
  );
  const [status, setStatus] = useState(
    selectedTask ? selectedTask.status : statusClasses[0]
  );
  const [selectedLabel, setSelectedLabel] = useState(
    selectedTask
      ? labelsClasses.find((lbl) => lbl === selectedTask.label)
      : labelsClasses[0]
  );

  function handleSubmit(e) {
    e.preventDefault();
    const task = {
      title,
      description,
      dueDate,
      priority,
      status,
      label: selectedLabel,
      id: selectedTask ? selectedTask.id : Date.now(),
      day: daySelected.format("YYYY-MM-DD"),
      lastUpdated: Date.now(),
      views: ['month', 'week', 'day']
    };
    if (selectedTask) {
      dispatchCalTask({ 
        type: "update", 
        payload: {
          ...task,
          views: ['month', 'week', 'day']
        } 
      });
    } else {
      dispatchCalTask({ 
        type: "push", 
        payload: {
          ...task,
          views: ['month', 'week', 'day']
        } 
      });
    }
    setShowTaskModal(false);
    setSelectedTask(null);
  }

  function handleDelete() {
    if (selectedTask) {
      dispatchCalTask({
        type: "delete",
        payload: {
          ...selectedTask,
          views: ['month', 'week', 'day']
        }
      });
      setShowTaskModal(false);
      setSelectedTask(null);
    }
  }

  const handleTypeChange = (type) => {
    if (type === 'event') {
      // Create an event object from current task data
      const eventData = {
        title,
        description,
        label: selectedLabel,
        day: daySelected.valueOf(),
        id: selectedTask ? selectedTask.id : Date.now(), // Preserve ID if converting existing task
        startTime: dayjs(dueDate).format('HH:mm'),
        endTime: dayjs(dueDate).add(30, 'minutes').format('HH:mm'),
        startTimestamp: dayjs(dueDate).valueOf(),
        endTimestamp: dayjs(dueDate).add(30, 'minutes').valueOf(),
      };
      
      // If converting an existing task, delete it first
      if (selectedTask) {
        dispatchCalTask({ type: "delete", payload: selectedTask });
      }

      // Add the new event
      dispatchCalEvent({ type: "push", payload: eventData });
      
      // Clear task data and set event data
      setSelectedTask(null);
      setShowTaskModal(false);
      setSelectedEvent(eventData);
      setShowEventModal(true);
    }
  };

  if (!showTaskModal) return null;

  return (
    <div className="h-screen w-full fixed left-0 top-0 flex justify-center items-center z-50">
      <form className="bg-white rounded-lg shadow-2xl w-1/3" onSubmit={handleSubmit}>
        <header className="bg-gray-100 px-4 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <button
                type="button"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <span className="material-icons-outlined text-green-500 mr-2">task_alt</span>
                  <span className="text-gray-700 font-medium">Task</span>
                  <span className="material-icons-outlined text-gray-400 ml-2">expand_more</span>
                </div>
              </button>
              <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 hidden group-hover:block w-48 py-1 z-50">
                <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                  Switch to
                </div>
                <button
                  type="button"
                  className="w-full flex items-center px-3 py-2 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => handleTypeChange('event')}
                >
                  <span className="material-icons-outlined text-blue-500 mr-3">event</span>
                  <div className="text-left">
                    <div className="text-gray-700 font-medium">Event</div>
                    <div className="text-xs text-gray-500">Add to calendar with time slot</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {selectedTask && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
                title="Delete task"
              >
                <span className="material-icons-outlined text-gray-600">delete</span>
              </button>
            )}
            <button 
              type="button"
              onClick={() => setShowTaskModal(false)}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
              title="Close"
            >
              <span className="material-icons-outlined text-gray-600">close</span>
            </button>
          </div>
        </header>

        <div className="p-3">
          <div className="grid grid-cols-1/5 items-end gap-y-7">
            <div></div>
            <input
              type="text"
              name="title"
              placeholder="Add title"
              value={title}
              required
              className="pt-3 border-0 text-gray-600 text-xl font-semibold pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Due Date section */}
            <div className="flex items-center">
              <span className="material-icons-outlined text-green-500 mr-2">event</span>
              <span className="text-gray-600">Due Date</span>
            </div>
            <div className="flex flex-col space-y-2">
              <input
                type="datetime-local"
                name="dueDate"
                value={dueDate}
                className="px-2 py-1 border rounded text-gray-600"
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Description section */}
            <div className="flex items-center">
              <span className="material-icons-outlined text-green-500 mr-2">segment</span>
              <span className="text-gray-600">Description</span>
            </div>
            <textarea
              name="description"
              placeholder="Add a description"
              value={description}
              rows="3"
              className="pt-3 border-0 text-gray-600 pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500 resize-none"
              onChange={(e) => setDescription(e.target.value)}
            />

            {/* Priority section */}
            <div className="flex items-center">
              <span className="material-icons-outlined text-green-500 mr-2">priority_high</span>
              <span className="text-gray-600">Priority</span>
            </div>
            <div className="flex gap-x-4">
              {priorityClasses.map((prClass, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPriority(prClass)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    priority === prClass 
                      ? `bg-${prClass}-100 text-${prClass}-800 border-2 border-${prClass}-600` 
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <span className="material-icons-outlined text-sm">
                    {priority === prClass ? 'radio_button_checked' : 'radio_button_unchecked'}
                  </span>
                  <span className="capitalize">{prClass}</span>
                </button>
              ))}
            </div>

            {/* Status section */}
            <div className="flex items-center">
              <span className="material-icons-outlined text-green-500 mr-2">list_alt</span>
              <span className="text-gray-600">Status</span>
            </div>
            <div className="flex gap-x-4">
              {statusClasses.map((stClass, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setStatus(stClass)}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    status === stClass 
                      ? `bg-${stClass}-100 text-${stClass}-800 border-2 border-${stClass}-600` 
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  <span className="material-icons-outlined text-sm">
                    {status === stClass ? 'radio_button_checked' : 'radio_button_unchecked'}
                  </span>
                  <span className="capitalize">{stClass.replace('-', ' ')}</span>
                </button>
              ))}
            </div>

            {/* Color section */}
            <div className="flex items-center">
              <span className="material-icons-outlined text-green-500 mr-2">palette</span>
              <span className="text-gray-600">Color</span>
            </div>
            <div className="flex gap-x-2">
              {labelsClasses.map((lblClass, i) => (
                <span
                  key={i}
                  onClick={() => setSelectedLabel(lblClass)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                    selectedLabel === lblClass ? 'ring-2 ring-offset-2 ring-green-600' : ''
                  } bg-${lblClass}-600`}
                >
                  {selectedLabel === lblClass && (
                    <span className="material-icons-outlined text-white text-sm">check</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex justify-end border-t p-3 mt-5">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded text-white"
          >
            Save
          </button>
        </footer>
      </form>
    </div>
  );
}