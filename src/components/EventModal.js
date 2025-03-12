import React, { useContext, useState, useEffect } from "react";
import GlobalContext from "../context/GlobalContext";
import dayjs from "dayjs";


const labelsClasses = [
  "gray",
  "green",
  "blue",
  "red",
  "indigo",
  
];

const venues = [
  { id: 1, name: 'Conference Room A', capacity: 20 },
  { id: 2, name: 'Meeting Room 1', capacity: 10 },
  { id: 3, name: 'Board Room', capacity: 15 },
  { id: 4, name: 'Training Room', capacity: 30 },
  { id: 5, name: 'Auditorium', capacity: 100 },
];


export default function EventModal() {
  const {
    setShowEventModal,
    daySelected,
    dispatchCalEvent,
    selectedEvent,
    selectedTask,
    multiDaySelection,
  } = useContext(GlobalContext);

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
      ? labelsClasses.find((lbl) => lbl === selectedTask.label)
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
  const [selectedVenue, setSelectedVenue] = useState(
    selectedEvent ? selectedEvent.venue : ""
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
      setSelectedVenue(selectedEvent ? selectedEvent.venue : "");
    }
  }, [selectedEvent, selectedTask]);

  function handleSubmit(e) {
    e.preventDefault();
    
    // Validate required fields
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!startTime || !endTime) {
      alert("Please select start and end times");
      return;
    }

    if (!selectedVenue) {
      alert("Please select a venue");
      return;
    }

    const calendarEvent = {
      title: title.trim(),
      description,
      location,
      email,
      label: selectedLabel,
      day: daySelected ? daySelected.valueOf() : multiDaySelection.map(day => day.valueOf()),
      id: selectedEvent ? selectedEvent.id : Date.now(),
      reminder,
      startTime,
      endTime,
      venue: selectedVenue,
      startTimestamp: dayjs(`${daySelected.format('YYYY-MM-DD')} ${startTime}`).valueOf(),
      endTimestamp: dayjs(`${daySelected.format('YYYY-MM-DD')} ${endTime}`).valueOf(),
    };

    if (selectedEvent) {
      dispatchCalEvent({ type: "update", payload: calendarEvent });
    } else {
      dispatchCalEvent({ type: "push", payload: calendarEvent });
    }

    setShowEventModal(false);
  }

  function handleDelete() {
    if (selectedEvent) {
      dispatchCalEvent({
        type: "delete",
        payload: selectedEvent,
      });
      setShowEventModal(false);
    }
  }

  return (
    <div className=" flex h-screen w-full fixed left-0 top-0 flex justify-center items-center z-50">
      <form className="bg-white rounded-lg shadow-2xl w-1/3">
        <header className="bg-gray-100 px-4 py-2 flex justify-between items-center">
          <span className="material-icons-outlined text-gray-400">
            drag_handle
          </span>
          <div>
            {selectedEvent && (
              <span
                onClick={handleDelete}
                className="material-icons-outlined text-gray-400 cursor-pointer"
              >
                delete
              </span>
            )}
            <button onClick={() => setShowEventModal(false)}>
              <span className="material-icons-outlined text-gray-400">
                close
              </span>
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
            <span className="material-icons-outlined text-blue-400">
              schedule
            </span>
            <p>
              {daySelected
                ? daySelected.format("dddd, MMMM DD")
                : multiDaySelection.map(day => day.format("dddd, MMMM DD")).join(", ")}
            </p>

            <span className="material-icons-outlined text-blue-400">
              access_time
            </span>
            <div className="flex gap-x-2">
              <input
                type="time"
                name="startTime"
                placeholder="Start time"
                value={startTime}
                required
                className="pt-3 border-0 text-blue-600 pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
                onChange={(e) => setStartTime(e.target.value)}
              />
              <input
                type="time"
                name="endTime"
                placeholder="End time"
                value={endTime}
                required
                className="pt-3 border-0 text-blue-600 pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <span className="material-icons-outlined text-blue-400">
              Venues
            </span>
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              required
              className="pt-3 border-0 text-gray-600 pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
            >
              <option value="">Select Venue</option>
              {venues.map(venue => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
            
            <span className="material-icons-outlined text-blue-400">
              segment
            </span>
            <input
              type="text"
              name="description"
              placeholder="Add a description"
              value={description}
              className="pt-3 border-0 text-gray-600 pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
              onChange={(e) => setDescription(e.target.value)}
            />

            <span className="material-icons-outlined text-blue-400">
              location_on
            </span>
            <input
              type="text"
              name="location"
              placeholder="Add location"
              value={location}
              className="pt-3 border-0 text-gray-600 pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
              onChange={(e) => setLocation(e.target.value)}
            />

            <span className="material-icons-outlined text-blue-400">
              email
            </span>
            <input
              type="email"
              name="email"
              placeholder="Add email"
              value={email}
              className="pt-3 border-0 text-gray-600 pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
              onChange={(e) => setEmail(e.target.value)}
            />

            <span className="material-icons-outlined text-blue-400">
              notifications
            </span>
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="pt-3 border-0 text-gray-600 pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
            >
              <option value="">No Reminder</option>
              <option value="5">5 minutes before</option>
              <option value="10">10 minutes before</option>
              <option value="15">15 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
            </select>

            <span className="material-icons-outlined text-blue-400">
              bookmark_border
            </span>
            <div className="flex gap-x-2">
              {labelsClasses.map((lblClass, i) => (
                <span
                  key={i}
                  onClick={() => setSelectedLabel(lblClass)}
                  className={`bg-${lblClass}-500 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer`}
                >
                  {selectedLabel === lblClass && (
                    <span className="material-icons-outlined text-white text-sm">
                      check
                    </span>
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