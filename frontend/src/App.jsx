import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import PasteListPage from "./pages/PasteListPage.jsx";
import PasteDetailPage from "./pages/PasteDetailPage.jsx";
import PasteFormPage from "./pages/PasteFormPage.jsx";
import StarsPage from "./pages/StarsPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import TrendingPage from "./pages/TrendingPage";
import StatsPage from "./pages/StatsPage";

export default function App() {
  return (
    <>
      <Navbar />
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        <Routes>
          <Route path="/" element={<PasteListPage />} />
          <Route path="/pastes/:id" element={<PasteDetailPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/new"
            element={
              <ProtectedRoute>
                <PasteFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <PasteFormPage edit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stars"
            element={
              <ProtectedRoute>
                <StarsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}
