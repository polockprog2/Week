import React, { useState, useReducer, useEffect, createContext, useMemo } from "react";
import dayjs from "dayjs";

const GlobalContext = createContext();

const savedTasksReducer = (state, { type, payload }) => {
  switch (type) {
    case "push":
      return [...state, payload];
    case "update":
      return state.map((task) => (task.id === payload.id ? payload : task));
    case "delete":
      return state.filter((task) => task.id !== payload.id);
    default:
      throw new Error();
  }
};

const savedEventsReducer = (state, { type, payload }) => {
  switch (type) {
    case "push":
      return [...state, payload];
    case "update":
      return state.map((evt) => (evt.id === payload.id ? payload : evt));
    case "delete":
      return state.filter((evt) => evt.id !== payload.id);
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
    default:
      throw new Error();
  }
};

const initEvents = () => {
  const storageEvents = localStorage.getItem("savedEvents");
  const parsedEvents = storageEvents ? JSON.parse(storageEvents) : [];
  return parsedEvents;
};

const initTasks = () => {
  const storageTasks = localStorage.getItem("savedTasks");
  const parsedTasks = storageTasks ? JSON.parse(storageTasks) : [];
  return parsedTasks;
};
const initVenues = () => {
  const storageVenues = localStorage.getItem("savedVenues");
  const parsedVenues = storageVenues ? JSON.parse(storageVenues) : [];
  return parsedVenues;
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
  const [savedEvents, dispatchCalEvent] = useReducer(savedEventsReducer, [], initEvents);
  const [savedTasks, dispatchCalTask] = useReducer(savedTasksReducer, [], initTasks);
  const [savedVenues, dispatchCalVenue] = useReducer(savedVenuesReducer, [], initVenues);

  useEffect(() => {
    localStorage.setItem("savedEvents", JSON.stringify(savedEvents));
  }, [savedEvents]);

  useEffect(() => {
    localStorage.setItem("savedTasks", JSON.stringify(savedTasks));
  }, [savedTasks]);

  useEffect(() => {
    localStorage.setItem("savedVenues", JSON.stringify(savedVenues));
  }, [savedVenues]);

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

  const filteredEvents = useMemo(() => {
    return savedEvents.filter((evt) =>
      labels
        .filter((lbl) => lbl.checked)
        .map((lbl) => lbl.label)
        .includes(evt.label)
    );
  }, [savedEvents, labels]);

  const filteredTasks = useMemo(() => {
    return savedTasks.filter((task) =>
      taskLabels
        .filter((lbl) => lbl.checked)
        .map((lbl) => lbl.label)
        .includes(task.label)
    );
  }, [savedTasks, taskLabels]);

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
        labels,
        setLabels,
        taskLabels,
        setTaskLabels,
        filteredEvents,
        filteredTasks,
        viewMode,
        setViewMode,
        multiDaySelection,
        setMultiDaySelection,
        updateLabel,
        updateTaskLabel,
        savedVenues: [],
        dispatchCalVenue,
        
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalContext;