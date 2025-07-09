import React, { useContext, useMemo, useState } from "react";
import dayjs from "dayjs";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import GlobalContext from "../context/GlobalContext";

export default function AgendaView() {
  const { savedEvents, savedTasks } = useContext(GlobalContext);
  const [currentMonth, setCurrentMonth] = useState(dayjs().format("YYYY-MM"));

  const handlePrevMonth = () => {
    setCurrentMonth(dayjs(currentMonth).subtract(1, "month").format("YYYY-MM"));
  };

  const handleNextMonth = () => {
    setCurrentMonth(dayjs(currentMonth).add(1, "month").format("YYYY-MM"));
  };

  // Combine and group events and tasks by date
  const groupedAgendaItems = useMemo(() => {
    const events = savedEvents.map((event) => ({
      type: "event",
      id: event.eventId || event.id || `${event.title}-${event.day}`,
      title: event.title,
      time: event.startTime,
      day: dayjs(event.day).format("YYYY-MM-DD"),
      label: event.label,
    }));

    const tasks = savedTasks.map((task) => ({
      type: "task",
      id: task.taskId || task.id || `${task.title}-${task.dueDate}`,
      title: task.title,
      time: dayjs(task.dueDate).format("HH:mm"),
      day: dayjs(task.dueDate).format("YYYY-MM-DD"),
      label: task.label,
    }));

    const allItems = [...events, ...tasks].sort((a, b) =>
      dayjs(`${a.day} ${a.time}`).diff(dayjs(`${b.day} ${b.time}`))
    );

    return allItems.reduce((acc, item) => {
      if (!acc[item.day]) {
        acc[item.day] = [];
      }
      acc[item.day].push(item);
      return acc;
    }, {});
  }, [savedEvents, savedTasks]);

  // Handle mouse wheel for month navigation
  const handleWheel = (e) => {
    if (e.deltaY < 0) {
      handlePrevMonth();
    } else if (e.deltaY > 0) {
      handleNextMonth();
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto bg-gray-50" onWheel={handleWheel}>
      <div className="flex items-center justify-between mb-8 px-4">
        <button onClick={handlePrevMonth} className="p-2 bg-white border border-gray-200 rounded-full shadow hover:bg-blue-50 transition-colors" title="Previous Month">
          <ChevronLeftIcon className="h-6 w-6 text-blue-500" />
        </button>
        <h1 className="text-3xl font-bold text-blue-700 flex items-center gap-2">
          <span className="material-icons-outlined text-blue-400">event_note</span>
          {dayjs(currentMonth).format("MMMM YYYY")}
        </h1>
        <button onClick={handleNextMonth} className="p-2 bg-white border border-gray-200 rounded-full shadow hover:bg-blue-50 transition-colors" title="Next Month">
          <ChevronRightIcon className="h-6 w-6 text-blue-500" />
        </button>
      </div>
      {Object.keys(groupedAgendaItems).filter(date => date.startsWith(currentMonth)).length ? (
        <div className="space-y-8 px-4 pb-8">
          {Object.keys(groupedAgendaItems).filter(date => date.startsWith(currentMonth)).map((date) => (
            <div key={date} className="bg-white shadow-md rounded-lg p-6 border border-blue-100">
              <h2 className="text-xl font-bold text-blue-700 mb-4 border-b pb-2 flex items-center gap-2">
                <span className="material-icons-outlined text-blue-400">calendar_today</span>
                {dayjs(date).format("dddd, MMMM D, YYYY")}
              </h2>
              <ul className="space-y-4">
                {groupedAgendaItems[date].map((item) => (
                  <li key={item.id} className="flex items-center space-x-4 p-4 rounded-lg shadow-sm border bg-gray-50">
                    <div className="w-24 text-right text-sm text-gray-600">
                      <span className="inline-block px-2 py-1 rounded bg-blue-100 text-blue-700 font-semibold">
                        {dayjs(`${item.day} ${item.time}`).format("h:mm A")}
                      </span>
                    </div>
                    <div className={`flex-1 p-3 rounded-lg flex items-center gap-3 bg-white border-l-4 ${item.type === 'event' ? 'border-blue-400' : 'border-green-400'}`}>
                      <span className={`material-icons-outlined text-2xl ${item.type === 'event' ? 'text-blue-400' : 'text-green-400'}`}>
                        {item.type === 'event' ? 'event' : 'check_circle'}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{item.title}</h3>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${item.type === 'event' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{item.type === 'event' ? 'Event' : 'Task'}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <span className="material-icons-outlined text-6xl mb-4">event_busy</span>
          <p className="text-lg">No events or tasks for this month.</p>
        </div>
      )}
    </div>
  );
}