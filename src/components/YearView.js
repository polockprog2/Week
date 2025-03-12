import React, { useState, useContext } from "react";
import dayjs from "dayjs";
import GlobalContext from "../context/GlobalContext";
import "./YearView.css";

export default function YearView({ year }) {
  const { savedEvents, savedTasks } = useContext(GlobalContext);
  const [selectedYear, setSelectedYear] = useState(year);

  const handlePrevYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setSelectedYear(prev => prev + 1);
  };
  // Generate days for a month
  const getMonth = (year, month) => {
    const firstDayOfMonth = dayjs(new Date(year, month, 1));
    const daysInMonth = firstDayOfMonth.daysInMonth();
    const startDay = firstDayOfMonth.day();
    
    const days = [];
    // Add empty days for padding
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  // Generate all months for the year
  const months = Array.from({ length: 12 }, (_, i) => ({
    name: dayjs().month(i).format("MMMM"),
    days: getMonth(selectedYear, i)
  }));

  // Check if a day has events or tasks
  const getDayContent = (date) => {
    if (!date) return null;
    
    const dayEvents = savedEvents?.filter(evt => 
      dayjs(evt.day).format("DD-MM-YY") === dayjs(date).format("DD-MM-YY")
    );
    
    const dayTasks = savedTasks?.filter(task => 
      dayjs(task.dueDate).format("DD-MM-YY") === dayjs(date).format("DD-MM-YY")
    );

    const hasContent = (dayEvents?.length > 0 || dayTasks?.length > 0);

    return (
      <div className={`year-view-day ${hasContent ? 'has-content' : ''} ${
        dayjs(date).format("DD-MM-YY") === dayjs().format("DD-MM-YY") ? 'current-day' : ''
      }`}>
        {dayjs(date).format("D")}
      </div>
    );
  };

  return (
    <div className="year-view p-4">
    <div className="flex items-center justify-between mb-4">
      <button 
        onClick={handlePrevYear}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <span className="material-icons-outlined cursor-pointer text-gray-600">
          chevron_left
        </span>
      </button>
      <h2 className="text-2xl font-bold">{selectedYear}</h2>
      <button 
        onClick={handleNextYear}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <span className="material-icons-outlined cursor-pointer text-gray-600">
          chevron_right
        </span>
      </button>
    </div>
    <div className="months-grid">
      {months.map((month, idx) => (
        <div key={idx} className="month-container">
          <h3 className="month-title">{month.name}</h3>
          <div className="days-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="day-header">{day}</div>
            ))}
            {month.days.map((day, i) => (
              <div key={i} className="day-cell">
                {getDayContent(day)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
  );
}