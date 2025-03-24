import React, { useContext, useMemo } from "react";
import dayjs from "dayjs";
import GlobalContext from "../context/GlobalContext";

export default function AgendaView() {
  const { savedEvents, savedTasks, daySelected } = useContext(GlobalContext);

  // Combine and sort events and tasks chronologically
  const agendaItems = useMemo(() => {
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

    return [...events, ...tasks]
      .filter((item) => dayjs(item.day).isSameOrAfter(daySelected, "day"))
      .sort((a, b) => dayjs(a.time).diff(dayjs(b.time)));
  }, [savedEvents, savedTasks, daySelected]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Agenda</h1>
      {agendaItems.length === 0 ? (
        <p className="text-gray-500">No upcoming events or tasks.</p>
      ) : (
        <ul className="space-y-4">
          {agendaItems.map((item) => (
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
                  {dayjs(item.time).format("h:mm A")}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {item.type === "event" ? "Event" : "Task"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}