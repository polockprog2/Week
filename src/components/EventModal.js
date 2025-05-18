import React, { useContext, useState, useEffect } from "react";
import GlobalContext from "../context/GlobalContext";
import "../assets/styles.css";
import dayjs from "dayjs";


const labelsClasses = [
  "indigo",
  "red",
  "teal",
  "cyan",
];


export default function EventModal() {
  const {
    setShowEventModal,
    setShowTaskModal,
    daySelected: initialDaySelected,
    dispatchCalEvent,
    selectedEvent,
    selectedTask,
    multiDaySelection,
    setSelectedEvent,
    setSelectedTask,
    dispatchCalTask,
  } = useContext(GlobalContext);

  const [selectedDay, setSelectedDay] = useState(initialDaySelected);
  const [endDay, setEndDay] = useState(
    selectedEvent 
      ? dayjs(selectedEvent.endDay || selectedEvent.day)
      : multiDaySelection.length > 1 
        ? multiDaySelection[multiDaySelection.length - 1]
        : initialDaySelected
  );
  const [title, setTitle] = useState(
    selectedEvent ? selectedEvent.title : selectedTask ? selectedTask.title : ""
  );
  const [description, setDescription] = useState(
    selectedEvent ? selectedEvent.description : selectedTask ? selectedTask.description : ""
  );
  const [location, setLocation] = useState(
    selectedEvent ? selectedEvent.location : ""
  );
  const [email, setEmail] = useState(
    selectedEvent ? selectedEvent.email : ""
  );
  const [selectedLabel, setSelectedLabel] = useState(
    selectedEvent
      ? labelsClasses.find((lbl) => lbl === selectedEvent.label)
      : selectedTask
      ? labelsClasses.find((lbl) => lbl === selectedTask.label) //might need to fix this part/line
      : labelsClasses[0]
  );
  const [reminder, setReminder] = useState(
    selectedEvent ? selectedEvent.reminder : ""
  );
  const [startTime, setStartTime] = useState(
    selectedEvent ? selectedEvent.startTime : ""
  );
  const [endTime, setEndTime] = useState(
    selectedEvent ? selectedEvent.endTime : ""
  );

  const [guests, setGuests] = useState(
    selectedEvent && selectedEvent.guests ? selectedEvent.guests : []
  );

  const [isTimeEnabled, setIsTimeEnabled] = useState(
    selectedEvent ? !!selectedEvent.startTime : false
  );

  useEffect(() => {
    if (selectedEvent || selectedTask) {
      setTitle(selectedEvent ? selectedEvent.title : selectedTask.title);
      setDescription(selectedEvent ? selectedEvent.description : selectedTask.description);
      setLocation(selectedEvent ? selectedEvent.location : "");
      setEmail(selectedEvent ? selectedEvent.email : "");
      setSelectedLabel(selectedEvent ? selectedEvent.label : selectedTask.label);
      setReminder(selectedEvent ? selectedEvent.reminder : "");
      setStartTime(selectedEvent ? selectedEvent.startTime : "");
      setEndTime(selectedEvent ? selectedEvent.endTime : "");
      setGuests(selectedEvent && selectedEvent.guests ? selectedEvent.guests : []);
      if (selectedEvent && selectedEvent.endDay) {
        setEndDay(dayjs(selectedEvent.endDay));
      }
    } 
    else if (multiDaySelection.length > 1) {
      const sortedDays = [...multiDaySelection].sort((a, b) => a.valueOf() - b.valueOf());
      setSelectedDay(sortedDays[0]);
      setEndDay(sortedDays[sortedDays.length - 1]);
    }
  }, [selectedEvent, selectedTask, multiDaySelection]);

  function handleSubmit(e) {
    e.preventDefault();
    
    // Validate required fields
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    let startDateTime = 0;
    let endDateTime = 0;

    if (isTimeEnabled) {
      if (!startTime || !endTime) {
        alert("Please select start and end times");
        return;
      }

      // Validate end time is after start time
      startDateTime = dayjs(
        `${selectedDay.format("YYYY-MM-DD")} ${startTime}`
      );
      if (endDay.isAfter(selectedDay, "day")) {
        endDateTime = dayjs(`${endDay.format("YYYY-MM-DD")} ${endTime}`);
      } else {
        endDateTime = dayjs(`${selectedDay.format("YYYY-MM-DD")} ${endTime}`);
      }

      if (endDateTime.isBefore(startDateTime)) {
        alert("End time must be after start time");
        return;
      }
    }
    
    const calendarEvent = {
      title: title.trim(),
      description,
      location,
      email,
      label: selectedLabel,
      day: selectedDay.valueOf(),
      endDay: endDay.valueOf(),
      id: selectedEvent ? selectedEvent.id : Date.now(),
      reminder,
      startTime,
      endTime,
      startTimestamp: startDateTime.valueOf(),
      endTimestamp: endDateTime.valueOf(),
      guests,
      lastUpdated: Date.now(),
      isMultiDay: endDay.isAfter(selectedDay, 'day'),
      views: ['month', 'week', 'day']
    };

    if (selectedEvent) {
      dispatchCalEvent({ 
        type: "update", 
        payload: calendarEvent
      });
    } else {
      dispatchCalEvent({ 
        type: "push", 
        payload: calendarEvent
      });
    }

    setShowEventModal(false);
  }

  function handleDelete() {
    if (selectedEvent) {
      // Delete from all views
      dispatchCalEvent({
        type: "delete",
        payload: {
          ...selectedEvent,
          views: ['month', 'week', 'day'] // Mark that this event should be deleted from all views
        }
      });
      setShowEventModal(false);
    }
  }
  function handleAddGuest(e) {
    e.preventDefault();
    if (email.trim() && !guests.includes(email.trim())) {
      setGuests([...guests, email.trim()]);
      setEmail("");
    }
  }

  const handleTypeChange = (type) => {
    if (type === 'task') {
      // Create a task object from current event data
      const taskData = {
        title,
        description,
        label: selectedLabel,
        dueDate: startTime ? dayjs(`${selectedDay.format('YYYY-MM-DD')} ${startTime}`).format('YYYY-MM-DD HH:mm') : selectedDay.format('YYYY-MM-DD HH:mm'),
        priority: 'medium',
        status: 'todo',
        id: selectedEvent ? selectedEvent.id : Date.now(), // Preserve ID if converting existing event
        day: selectedDay.format("YYYY-MM-DD"),
      };
      
      // If converting an existing event, delete it first
      if (selectedEvent) {
        dispatchCalEvent({ type: "delete", payload: selectedEvent });
      }
      // Add the new task
      dispatchCalTask({ type: "push", payload: taskData });

      
      
      // Clear event data and set task data
      setSelectedEvent(null);
      setShowEventModal(false);
      setSelectedTask(taskData);
      setShowTaskModal(true);
    }
  };

  return (
    <div className="h-screen w-full fixed left-0 top-0 flex justify-center items-center z-50 bg-gray-900 bg-opacity-50">
      <form className="bg-white rounded-lg shadow-2xl w-1/3mx-auto max-w-md overflow-hidden rounded-xl bg-gray shadow-md md:max-w-2xl">
        <header className="bg-gray-100 px-4 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <button
                type="button"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <span className="material-icons-outlined text-blue-500 mr-2">event</span>
                  <span className="text-gray-700 font-medium">Event</span>
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
                  onClick={() => handleTypeChange('task')}
                >
                  <span className="material-icons-outlined text-green-500 mr-3">task_alt</span>
                  <div className="text-left">
                    <div className="text-gray-700 font-medium">Task</div>
                    <div className="text-xs text-gray-500">Add a to-do with due date</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {selectedEvent && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
                title="Delete event"
              >
                <span className="material-icons-outlined text-gray-600">delete</span>
              </button>
            )}
            <button 
              type="button"
              onClick={() => setShowEventModal(false)}
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

            {/* Time section */}
            <div className="flex items-center">
              <span className="material-icons-outlined text-blue-500 mr-2">schedule</span>
              <span className="text-gray-600">Time</span>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-x-2">
                <input
                  type="date"
                  name="start-date"
                  value={selectedDay.format("YYYY-MM-DD")}
                  className="px-2 py-1 border rounded text-gray-600"
                  onChange={(e) => {
                    const newDate = dayjs(e.target.value);
                    if (newDate.isValid()) {
                      setSelectedDay(newDate);
                      if (newDate.isAfter(endDay)) {
                        setEndDay(newDate);
                      }
                    }
                  }}
                />
                <span className="text-gray-600">to</span>
                <input
                  type="date"
                  name="end-date"
                  value={endDay.format("YYYY-MM-DD")}
                  className="px-2 py-1 border rounded text-gray-600"
                  onChange={(e) => {
                    const newDate = dayjs(e.target.value);
                    if (newDate.isValid() && !newDate.isBefore(selectedDay)) {
                      setEndDay(newDate);
                    }
                  }}
                />
              </div>
              <div className="flex gap-x-2">
                <input
                  type="time"
                  name="startTime"
                  value={startTime}
                  required
                  className="px-2 py-1 border rounded text-gray-600"
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <span className="text-gray-600">to</span>
                <input
                  type="time"
                  name="endTime"
                  value={endTime}
                  required
                  className="px-2 py-1 border rounded text-gray-600"
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {/* Location section */}
            <div className="flex items-center">
              <span className="material-icons-outlined text-blue-500 mr-2">location_on</span>
              <span className="text-gray-600">Location</span>
            </div>
            <input
              type="text"
              name="location"
              placeholder="Add location"
              value={location}
              className="pt-3 border-0 text-gray-600 pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
              onChange={(e) => setLocation(e.target.value)}
            />

            {/* Description section */}
            <div className="flex items-center">
              <span className="material-icons-outlined text-blue-500 mr-2">segment</span>
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

            {/* Email/Guests section */}
            <div className="flex items-center">
              <span className="material-icons-outlined text-blue-500 mr-2">people</span>
              <span className="text-gray-600">Guests</span>
            </div>
            <div className="space-y-2">
              <div className="flex gap-x-2">
                <input
                  type="email"
                  name="email"
                  placeholder="Add guests"
                  value={email}
                  className="flex-1 pt-3 border-0 text-gray-600 pb-2 border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddGuest}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
              {guests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {guests.map((guest, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center"
                    >
                      {guest}
                      <button
                        type="button"
                        onClick={() => setGuests(guests.filter((_, i) => i !== index))}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reminder section */}
            <div className="flex items-center">
              <span className="material-icons-outlined text-blue-500 mr-2">notifications</span>
              <span className="text-gray-600">Reminder</span>
            </div>
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="pt-3 border-0 text-gray-600 pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
            >
              <option value="">No reminder</option>
              <option value="5">5 minutes before</option>
              <option value="10">10 minutes before</option>
              <option value="15">15 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
            </select>

            {/* Color section */}
            <div className="flex items-center">
              <span className="material-icons-outlined text-blue-500 mr-2">palette</span>
              <span className="text-gray-600">Color</span>
            </div>
            <div className="flex gap-x-2">
            {labelsClasses.map((lblClass, i) => (
                <span
                  key={i} 
                  onClick={() => setSelectedLabel(lblClass)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${
                    selectedLabel === lblClass ? 'ring-2 ring-offset-2 ring-blue-600' : ''
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
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded text-white"
          >
            Save
          </button>
        </footer>
      </form>
    </div>
  );
}