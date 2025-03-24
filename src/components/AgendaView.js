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

    // Group items by date
    return allItems.reduce((acc, item) => {
      if (!acc[item.day]) {
        acc[item.day] = [];
      }
      acc[item.day].push(item);
      return acc;
    }, {});
  }, [savedEvents, savedTasks]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Agenda</h1>
      {Object.keys(groupedAgendaItems).length === 0 ? (
        <p className="text-gray-500">No upcoming events or tasks.</p>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedAgendaItems).map((date) => (
            <div key={date}>
              <h2 className="text-lg font-bold text-gray-700 mb-2">
                {dayjs(date).format("dddd, MMMM D, YYYY")}
              </h2>
              <ul className="space-y-6 relative z-10">
                {groupedAgendaItems[date].map((item) => (
                  <li
                    key={item.id}
                    className={`p-4 rounded-lg shadow-md ${
                      item.type === "event"
                        ? `bg-${item.label}-100 text-${item.label}-800`
                        : `bg-${item.label}-200 text-${item.label}-900`
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <span className="text-sm text-gray-600">
                        {dayjs(`${item.day} ${item.time}`).format("h:mm A")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {item.type === "event" ? "Event" : "Task"}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}