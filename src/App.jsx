import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import StorePage from "./pages/StorePage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import ForumPage from "./pages/ForumPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import HeadwearPage from "./pages/HeadwearPage.jsx";

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/forum" element={<ForumPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/headwear" element={<HeadwearPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
