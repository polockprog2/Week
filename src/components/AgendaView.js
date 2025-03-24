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
      id: event.id,
      title: event.title,
      time: event.startTime,
      day: dayjs(event.day).format("YYYY-MM-DD"),
      label: event.label,
    }));

    const tasks = savedTasks.map((task) => ({
      type: "task",
      id: task.id,
      title: task.title,
      time: task.dueDate,
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

  return (
    <div className="flex-1 h-screen overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <button onClick={handlePrevMonth} className="p-2 bg-gray-200 rounded-full">
          <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
        </button>
        <h1 className="text-3xl font-bold text-gray-800">
          {dayjs(currentMonth).format("MMMM YYYY")}
        </h1>
        <button onClick={handleNextMonth} className="p-2 bg-gray-200 rounded-full">
          <ChevronRightIcon className="h-6 w-6 text-gray-700" />
        </button>
      </div>
      {Object.keys(groupedAgendaItems).filter(date => date.startsWith(currentMonth)).length ? (
        <div className="space-y-8">
          {Object.keys(groupedAgendaItems).filter(date => date.startsWith(currentMonth)).map((date) => (
            <div key={date} className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2">
                {dayjs(date).format("dddd, MMMM D, YYYY")}
              </h2>
              <ul className="space-y-4">
                {groupedAgendaItems[date].map((item) => (
                  <li key={item.id} className="flex items-center space-x-4 p-4 rounded-lg shadow-sm border bg-gray-100">
                    <div className="w-24 text-right text-sm text-gray-600">
                      {dayjs(`${item.day} ${item.time}`).format("h:mm A")}
                    </div>
                    <div className={`flex-1 p-3 rounded-lg bg-${item.label}-100 text-${item.label}-800`}>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.type === "event" ? "Event" : "Task"}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-lg">No events or tasks for this month.</p>
      )}
    </div>
  );
}