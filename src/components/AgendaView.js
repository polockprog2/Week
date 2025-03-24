import React, { useContext, useMemo } from "react";
import dayjs from "dayjs";
import GlobalContext from "../context/GlobalContext";

export default function AgendaView() {
  const { savedEvents, savedTasks } = useContext(GlobalContext);

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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Schedule</h1>
      {Object.keys(groupedAgendaItems).length === 0 ? (
        <p className="text-gray-500 text-lg">No upcoming events or tasks.</p>
      ) : (
        <div className="space-y-8">
          {Object.keys(groupedAgendaItems).map((date) => (
            <div key={date} className="">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                {dayjs(date).format("dddd, MMMM D, YYYY")}
              </h2>
              <div className="border-l-4 border-blue-500 pl-4 space-y-4">
                {groupedAgendaItems[date].map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="w-24 text-right text-sm text-gray-600">
                      {dayjs(`${item.day} ${item.time}`).format("h:mm A")}
                    </div>
                    <div
                      className={`p-3 rounded-md shadow-sm w-full border-l-4 bg-${item.label}-100 text-${item.label}-800`}
                    >
                      <h3 className="text-md font-semibold">{item.title}</h3>
                      <p className="text-xs text-gray-500">
                        {item.type === "event" ? "Event" : "Task"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
