import React, { useState, useReducer, useEffect, useMemo } from "react";
import dayjs from "dayjs";
import GlobalContext from "./GlobalContext";
import { eventsApi, tasksApi, venuesApi } from "../services/api";

function savedEventsReducer(state, { type, payload }) {
  switch (type) {
    case "push":
      return [...state, payload];
    case "update":
      return state.map((evt) => (evt.eventId === payload.eventId ? payload : evt));
    case "delete":
      return state.filter(event => event.eventId !== payload.eventId);
    case "set":
      return payload;
    default:
      throw new Error();
  }
}

function savedTasksReducer(state, { type, payload }) {
  switch (type) {
    case "push":
      return [...state, payload];
    case "update":
      return state.map(task => task.id === payload.id ? payload : task);
    case "delete":
      return state.filter(task => task.id !== payload.id);
    case "set":
      return payload;
    default:
      throw new Error(`Unknown action type: ${type}`);
  }
}
function savedVenuesReducer(state, { type, payload }) {
  switch (type) {
    case 'push':
      return [...state, payload];
    case 'update':
      return state.map(venue => venue.id === payload.id ? payload : venue);
    case 'delete':
      return state.filter(venue => venue.id !== payload.id);
    case 'set':
      return payload;
    default:
      throw new Error();
  }
}

export default function ContextWrapper(props) {
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

  // Fetch events from backend
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

  // Fetch tasks from backend
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

  // Fetch venues from backend
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

  const filteredVenues = useMemo(() => {
    return savedVenues.filter(venue => 
      dayjs(venue.day).format('YYYY-MM-DD') === daySelected.format('YYYY-MM-DD')
    );
  }, [savedVenues, daySelected]);

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

  useEffect(() => {
    if (smallCalendarMonth !== null) {
      setMonthIndex(smallCalendarMonth);
    }
  }, [smallCalendarMonth]);

  useEffect(() => {
    if (!showEventModal) {
      setSelectedEvent(null);
    }
  }, [showEventModal]);

  useEffect(() => {
    if (!showTaskModal) {
      setSelectedTask(null);
    }
  }, [showTaskModal]);

  function updateLabel(label) {
    setLabels(labels.map((lbl) => (lbl.label === label.label ? label : lbl)));
  }

  function updateTaskLabel(label) {
    setTaskLabels(taskLabels.map((lbl) => (lbl.label === label.label ? label : lbl)));
  }

  // Add fetchTasks to context for manual refresh
  const fetchTasks = async () => {
    try {
      const response = await tasksApi.getAll();
      dispatchCalTask({ type: "set", payload: response.data });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
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
        dispatchCalVenue,
        filteredEvents,
        filteredTasks,
        filteredVenues,
        savedVenues,
        labels,
        setLabels,
        taskLabels,
        setTaskLabels,
        viewMode,
        setViewMode,
        multiDaySelection,
        setMultiDaySelection,
        updateLabel,
        updateTaskLabel,
        fetchTasks, // expose fetchTasks for modal refresh
      }}
    >
      {props.children}
    </GlobalContext.Provider>
  );
}