import React, { useState, useContext, useEffect } from "react";
import "./App.css";
import dayjs from "dayjs";
import { getMonth } from "./util";
import CalendarHeader from "./components/CalendarHeader";
import Sidebar from "./components/Sidebar";
import Month from "./components/Month";
import WeekView from "./components/WeekView";
import DayView from "./components/DayView";
import YearView from "./components/YearView";
import Venues from "./components/Venues";
import GlobalContext from "./context/GlobalContext";
import EventModal from "./components/EventModal";
import TaskModal from "./components/TaskModal";

function App() {
  const [currentMonth, setCurrentMonth] = useState(getMonth());
  const { monthIndex, showEventModal, showTaskModal, viewMode } = useContext(GlobalContext);
  
  useEffect(() => {
    setCurrentMonth(getMonth(monthIndex));
  }, [monthIndex]);

  return (
    <React.Fragment>
      {showEventModal && <EventModal />}
      {showTaskModal && <TaskModal />}
      
      <div className="h-screen flex flex-col">
        <CalendarHeader />
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex flex-1">
            {viewMode === "month" && <Month month={currentMonth} />}
            {viewMode === "week" && <WeekView />}
            {viewMode === "day" && <DayView />}
            {viewMode === "year" && <YearView year={dayjs().year()} />}
            {viewMode === "venues" && <Venues />}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

export default App;