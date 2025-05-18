import React, { useState, useReducer, useEffect, createContext, useMemo } from "react";
import dayjs from "dayjs";
import { eventsApi, tasksApi, venuesApi } from "../services/api";

const GlobalContext = createContext();

const savedEventsReducer = (state, { type, payload }) => {
  switch (type) {
    case "push":
      return [...state, payload];
    case "update":
      return state.map((event) => (event.id === payload.id ? payload : event));
    case "delete":
      return state.filter((event) => event.id !== payload.id);
    case "set":
      return payload;
    default:
      throw new Error();
  }
};

const savedTasksReducer = (state, { type, payload }) => {
  switch (type) {
    case "push":
      return [...state, payload];
    case "update":
      return state.map((task) => (task.id === payload.id ? payload : task));
    case "delete":
      return state.filter((task) => task.id !== payload.id);
    case "set":
      return payload;
    default:
      throw new Error();
  }
};

const savedVenuesReducer = (state, { type, payload }) => {
  switch (type) {
    case 'push':
      return [...state, payload];
    case 'update':
      return state.map(venue => 
        venue.id === payload.id ? payload : venue
      );
    case 'delete':
      return state.filter(venue => venue.id !== payload.id);
    case 'set':
      return payload;
    default:
      throw new Error();
  }
};

export const GlobalProvider = ({ children }) => {
  const [monthIndex, setMonthIndex] = useState(dayjs().month());
  const [smallCalendarMonth, setSmallCalendarMonth] = useState(null);
  const [daySelected, setDaySelected] = useState(dayjs());
  const [showEventModal, setShowEventModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [labels, setLabels] = useState([]);
  const [taskLabels, setTaskLabels] = useState([]);
  const [viewMode, setViewMode] = useState("month");
  const [multiDaySelection, setMultiDaySelection] = useState([]);
  const [savedEvents, dispatchCalEvent] = useReducer(savedEventsReducer, []);
  const [savedTasks, dispatchCalTask] = useReducer(savedTasksReducer, []);
  const [savedVenues, dispatchCalVenue] = useReducer(savedVenuesReducer, []);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.getAll();
        dispatchCalEvent({ type: "set", payload: response.data });
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await tasksApi.getAll();
        dispatchCalTask({ type: "set", payload: response.data });
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };
    fetchTasks();
  }, []);

  // Fetch venues
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await venuesApi.getAll();
        dispatchCalVenue({ type: "set", payload: response.data });
      } catch (error) {
        console.error("Error fetching venues:", error);
      }
    };
    fetchVenues();
  }, []);

  useEffect(() => {
    setLabels((prevLabels) => {
      return [...new Set(savedEvents.map((evt) => evt.label))].map((label) => {
        const currentLabel = prevLabels.find((lbl) => lbl.label === label);
        return {
          label,
          checked: currentLabel ? currentLabel.checked : true,
        };
      });
    });
  }, [savedEvents]);

  useEffect(() => {
    setTaskLabels((prevLabels) => {
      return [...new Set(savedTasks.map((task) => task.label))].map((label) => {
        const currentLabel = prevLabels.find((lbl) => lbl.label === label);
        return {
          label,
          checked: currentLabel ? currentLabel.checked : true,
        };
      });
    });
  }, [savedTasks]);

  const updateLabel = (label) => {
    setLabels(labels.map((lbl) => (lbl.label === label.label ? label : lbl)));
  };

  const updateTaskLabel = (label) => {
    setTaskLabels(taskLabels.map((lbl) => (lbl.label === label.label ? label : lbl)));
  };

  return (
    <GlobalContext.Provider
      value={{
        monthIndex,
        setMonthIndex,
        smallCalendarMonth,
        setSmallCalendarMonth,
        daySelected,
        setDaySelected,
        showEventModal,
        setShowEventModal,
        showTaskModal,
        setShowTaskModal,
        showVenueModal,
        setShowVenueModal,
        selectedEvent,
        setSelectedEvent,
        selectedTask,
        setSelectedTask,
        selectedVenue,
        setSelectedVenue,
        savedEvents,
        dispatchCalEvent,
        savedTasks,
        dispatchCalTask,
        savedVenues,
        dispatchCalVenue,
        labels,
        setLabels,
        taskLabels,
        setTaskLabels,
        updateLabel,
        updateTaskLabel,
        viewMode,
        setViewMode,
        multiDaySelection,
        setMultiDaySelection,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;