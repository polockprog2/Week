import dayjs from "dayjs";
import React, { useContext } from "react";
import logo from "../assets/trust.png";
import GlobalContext from "../context/GlobalContext";
import ViewSwitcherDrodown from "./ViewSwitcherDrodown";
import ProfileView from "./ProfileView";

export default function CalendarHeader() {
  const { startOfWeek,setStartOfWeek,monthIndex, setMonthIndex, viewMode } = useContext(GlobalContext);

  function handlePrev() {
    if (viewMode === "month") {
      setMonthIndex(monthIndex - 1);
    } else if (viewMode === "year") {
      setMonthIndex(monthIndex - 12);
    }

  }

  function handleNext() {
    if (viewMode === "month") {
      setMonthIndex(monthIndex + 1);
    } else if (viewMode === "year") {
      setMonthIndex(monthIndex + 12);
    }
    else if(viewMode === "week"){
      setStartOfWeek(startOfWeek.add(1, "week"));
    }
  }

  function handleReset() {
    if(viewMode === "month") {
    setMonthIndex(
      monthIndex === dayjs().month() ? monthIndex + Math.random() : dayjs().month()
    );
  }
  else if(viewMode === "week"){
    setStartOfWeek(dayjs().startOf("week"));
  }
  
  }
  return (
    <header className="px-4 py-2 flex items-center bg-green-50  shadow-md border-g">
      <img src={logo} alt="calendar" className="mr-2 w-12 h-12" />
      <h1 className="mr-10 text-xl text-gray-500 font-bold">Trust Bank PLC</h1>
      
      <button onClick={handleReset} className="bg-white-500 text-white-200 py-3 px-6 mr-5 hover:bg-gray-200 boder-gray-200 rounded-full shadow-md">
        Today
      </button>
      
      <button onClick={handlePrev}>
        <span className="material-icons-outlined cursor-pointer text-gray-600 mx-2">
          chevron_left
        </span>
      </button>
      <button onClick={handleNext}>
        <span className="material-icons-outlined cursor-pointer text-gray-600 mx-2">
          chevron_right
        </span>
      </button>
      
      <h2 className="ml-4 text-xl text-gray-500 font-bold">
        {viewMode === "month" && dayjs(new Date(dayjs().year(), monthIndex)).format("MMMM YYYY")}
        {viewMode === "year" && dayjs(new Date(dayjs().year(), monthIndex)).format("YYYY")}
       
      </h2>
      
      <div className="ml-auto flex space-x-2 items-center">
        <ViewSwitcherDrodown />
        <ProfileView />
      </div>
    </header>
  );
}