import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import ToastProvider from "./components/ToastProvider.jsx";
import ThemeProvider from "./components/ThemeProvider.jsx";
import SessionProvider from "./components/SessionProvider.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeProvider>
      <SessionProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  </BrowserRouter>
);
