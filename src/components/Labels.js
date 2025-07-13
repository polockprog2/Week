import React, { useContext } from "react";
import GlobalContext from "../context/GlobalContext";

export default function Labels() {
  const { labels, taskLabels, updateLabel, updateTaskLabel } = useContext(GlobalContext);
  return (
    <div className="select-none">
      <div className="mb-2 text-xl text-gray-500 font-semibold pl-2 pt-2">My Events</div>
      <ul className="space-y-1">
        {labels.map(({ label: lbl, checked }, idx) => (
          <li
            key={idx}
            className="group flex items-center px-2 py-1 rounded cursor-pointer hover:bg-gray-100 transition"
          >
            <span
              className="w-3 h-3 rounded-full mr-3 border border-gray-300"
              style={{ backgroundColor: getLabelColor(lbl) }}
            />
            <span className="flex-1 truncate text-base text-gray-900 capitalize">{lbl}</span>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => updateLabel({ label: lbl, checked: !checked })}
              className="form-checkbox h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition ml-2"
              style={{ accentColor: getLabelColor(lbl) }}
            />
          </li>
        ))}
      </ul>
      <div className="mb-2 mt-4 text-xl text-gray-500 font-semibold pl-2">My Tasks</div>
      <ul className="space-y-1">
        {taskLabels.map(({ label: lbl, checked }, idx) => (
          <li
            key={idx}
            className="group flex items-center px-2 py-1 rounded cursor-pointer hover:bg-gray-100 transition"
          >
            <span
              className="w-3 h-3 rounded-full mr-3 border border-gray-300"
              style={{ backgroundColor: getLabelColor(lbl) }}
            />
            <span className="flex-1 truncate text-base text-gray-900 capitalize">{lbl}</span>
            <input
              type="checkbox"
              checked={checked}
              onChange={() => updateTaskLabel({ label: lbl, checked: !checked })}
              className="form-checkbox h-4 w-4 text-green-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition ml-2"
              style={{ accentColor: getLabelColor(lbl) }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

// Helper to assign a color to each label
function getLabelColor(label) {
  const colorMap = {
    red: '#d93025',
    blue: '#1a73e8',
    green: '#188038',
    yellow: '#fbbc04',
    purple: '#a142f4',
    pink: '#ea4335',
    orange: '#f29900',
    gray: '#5f6368',
    default: '#1a73e8',
  };
  return colorMap[label] || colorMap.default;
}