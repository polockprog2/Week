import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import dayjs from "dayjs";
import reportWebVitals from "./reportWebVitals";
import ContextWrapper from "./context/ContextWrapper";
import { BrowserRouter } from "react-router-dom";
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
    <ContextWrapper>
      <App />
    </ContextWrapper>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();