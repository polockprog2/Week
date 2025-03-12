import React, { useContext, useState } from "react";
import GlobalContext from "../context/GlobalContext";

const priorityClasses = ["low", "medium", "high"];
const statusClasses = ["todo", "in-progress", "done"];

const labelsClasses = [
  
  "orange",
  "cyan",
  "lime",
  "pink",
  "purple",
  "amber",
  "navy",
  "maroon",
  "olive",
  "coral",
  "salmon",
  "turquoise",
 
];

export default function TaskModal() {
  const {
    setShowTaskModal,
    daySelected,
    dispatchCalTask,
    selectedTask,
    setSelectedTask, // Use setSelectedTask
    showTaskModal,
  } = useContext(GlobalContext);

  const [title, setTitle] = useState(selectedTask ? selectedTask.title : "");
  const [description, setDescription] = useState(
    selectedTask ? selectedTask.description : ""
  );
  const [dueDate, setDueDate] = useState(
    selectedTask ? selectedTask.dueDate : daySelected.format("YYYY-MM-DD")
  );
  const [priority, setPriority] = useState(
    selectedTask ? selectedTask.priority : priorityClasses[0]
  );
  const [status, setStatus] = useState(
    selectedTask ? selectedTask.status : statusClasses[0]
  );
  const [selectedLabel, setSelectedLabel] = useState(
    selectedTask
      ? labelsClasses.find((lbl) => lbl === selectedTask.label)
      : labelsClasses[0]
  );

  function handleSubmit(e) {
    e.preventDefault();
    const task = {
      title,
      description,
      dueDate,
      priority,
      status,
      label: selectedLabel, // Add label to task
      id: selectedTask ? selectedTask.id : Date.now(),
    };
    if (selectedTask) {
      dispatchCalTask({ type: "update", payload: task });
    } else {
      dispatchCalTask({ type: "push", payload: task });
    }
    setShowTaskModal(false);
    setSelectedTask(null); // Reset selectedTask
  }

  function handleDelete() {
    if (selectedTask) {
      dispatchCalTask({
        type: "delete",
        payload: selectedTask,
      });
      setShowTaskModal(false);
      setSelectedTask(null); // Reset selectedTask
    }
  }

  if (!showTaskModal) return null;

  return (
    <div className="h-screen w-full fixed left-0 top-0 flex justify-center items-center">
      <form className="bg-white rounded-lg shadow-2xl w-1/3" onSubmit={handleSubmit}>
        <header className="bg-gray-100 px-4 py-2 flex justify-between items-center">
          <span className="material-icons-outlined text-gray-400">
            drag_handle
          </span>
          <div>
            {selectedTask && (
              <span
                onClick={handleDelete}
                className="material-icons-outlined text-gray-400 cursor-pointer"
              >
                delete
              </span>
            )}
            <button type="button" onClick={() => setShowTaskModal(false)}>
              <span className="material-icons-outlined text-gray-400">
                close
              </span>
            </button>
          </div>
        </header>
        <div className="p-3">
          <div className="grid grid-cols-1/5 items-end gap-y-7">
            <div></div>
            <input
              type="text"
              name="title"
              placeholder="Add title"
              value={title}
              required
              className="pt-3 border-0 text-gray-600 text-xl font-semibold pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
              onChange={(e) => setTitle(e.target.value)}
            />
            <span className="material-icons-outlined text-blue-400">
              description
            </span>
            <input
              type="text"
              name="description"
              placeholder="Add a description"
              value={description}
              className="pt-3 border-0 text-gray-600 pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
              onChange={(e) => setDescription(e.target.value)}
            />
            <span className="material-icons-outlined text-blue-400">
              event
            </span>
            <input
              type="date"
              name="dueDate"
              value={dueDate}
              className="pt-3 border-0 text-gray-600 pb-2 w-full border-b-2 border-gray-200 focus:outline-none focus:ring-0 focus:border-blue-500"
              onChange={(e) => setDueDate(e.target.value)}
            />
            <span className="material-icons-outlined text-blue-400">
              priority_high
            </span>
            <div className="flex gap-x-2">
              {priorityClasses.map((prClass, i) => (
                <span
                  key={i}
                  onClick={() => setPriority(prClass)}
                  className={`bg-${prClass}-500 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer`}
                >
                  {priority === prClass && (
                    <span className="material-icons-outlined text-white text-sm">
                      check
                    </span>
                  )}
                </span>
              ))}
            </div>
            <span className="material-icons-outlined text-blue-400">
              list_alt
            </span>
            <div className="flex gap-x-2">
              {statusClasses.map((stClass, i) => (
                <span
                  key={i}
                  onClick={() => setStatus(stClass)}
                  className={`bg-${stClass}-500 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer`}
                >
                  {status === stClass && (
                    <span className="material-icons-outlined text-white text-sm">
                      check
                    </span>
                  )}
                </span>
              ))}
            </div>
            <span className="material-icons-outlined text-blue-400">
              bookmark_border
            </span>
            <div className="flex gap-x-2">
              {labelsClasses.map((lblClass, i) => (
                <span
                  key={i}
                  onClick={() => setSelectedLabel(lblClass)}
                  className={`bg-${lblClass}-500 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer`}
                >
                  {selectedLabel === lblClass && (
                    <span className="material-icons-outlined text-white text-sm">
                      check
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
        <footer className="flex justify-end border-t p-3 mt-5">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded text-white"
          >
            Save
          </button>
        </footer>
      </form>
    </div>
  );
}