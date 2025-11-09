import { Routes, Route } from "react-router-dom";
import "./App.css";
import AppLayout from "./layouts/AppLayout.jsx";
import HomePage from "./pages/HomePage.jsx";
import StorePage from "./pages/StorePage.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import ForumPage from "./pages/ForumPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import HeadwearPage from "./pages/HeadwearPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import PlantsPage from "./pages/PlantsPage.jsx";
import PlantDetailPage from "./pages/PlantDetailPage.jsx";
import PlantCreatePage from "./pages/PlantCreatePage.jsx";

function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route element={<AppLayout />}>
          <Route
            path="/"
            element={
              <RequireAuth>
                <HomePage />
              </RequireAuth>
            }
          />
          <Route
            path="/store"
            element={
              <RequireAuth>
                <StorePage />
              </RequireAuth>
            }
          />
          <Route
            path="/plants"
            element={
              <RequireAuth>
                <PlantsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/plants/new"
            element={
              <RequireAuth>
                <PlantCreatePage />
              </RequireAuth>
            }
          />
          <Route
            path="/plants/:plantId"
            element={
              <RequireAuth>
                <PlantDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/calendar"
            element={
              <RequireAuth>
                <CalendarPage />
              </RequireAuth>
            }
          />
          <Route
            path="/forum"
            element={
              <RequireAuth>
                <ForumPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/headwear" element={<HeadwearPage />} />
          <Route path="/auth" element={<AuthPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
