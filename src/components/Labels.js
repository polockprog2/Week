import React, { useContext } from "react";
import GlobalContext from "../context/GlobalContext";

export default function Labels() {
  const { labels, taskLabels, updateLabel, updateTaskLabel } = useContext(GlobalContext);
  console.log("Labels:", labels);
  return (
    <React.Fragment>
      <p className="text-black-900 font-bold mt-5">My Calendar</p>
      {labels.map(({ label: lbl, checked }, idx) => (
        <label key={idx} className="items-center mt-3 block">
          <input
            type="checkbox"
            checked={checked}
            onChange={() =>
              updateLabel({ label: lbl, checked: !checked })
            }
            className={`form-checkbox h-5 w-5 text-${lbl}-600 rounded focus:ring-0 cursor-pointer`}
          />
          <span className="ml-2 text-Black-900 capitalize">{lbl}</span>
        </label>
      ))}
      
      <p className="text-black-900 font-bold mt-5">My Tasks</p>
      {taskLabels.map(({ label: lbl, checked }, idx) => (
        <label key={idx} className="items-center mt-3 block">
          <input
            type="checkbox"
            checked={checked}
            onChange={() =>
              updateTaskLabel({ label: lbl, checked: !checked })
            }
            className={`form-checkbox h-5 w-5 text-${lbl}-600 rounded focus:ring-0 cursor-pointer`}
          />
          <span className="ml-2 text-black-700 capitalize">{lbl}</span>
        </label>
      ))}
    </React.Fragment>
  );
}