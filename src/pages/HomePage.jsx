import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button.jsx";
import TaskList from "../components/TaskList.jsx";
import { useAuthSession } from "../components/RequireAuth.jsx";
import ToggleGroup from "../components/ToggleGroup.jsx";
import Calendar from "../components/Calendar.jsx";
import MainGarden from "../assets/Main-garden.png";
import "./HomePage.css";
import {
  listRemindersForUser,
  expandReminderToDates,
  generateReminderContent,
} from "../services/reminders";

export default function HomePage() {
  const { session } = useAuthSession();
  const [currentDate] = useState(() => new Date());
  const [reminders, setReminders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // Fetch reminders for the current week
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    listRemindersForUser(userId)
      .then((remindersData) => {
        setReminders(remindersData);
      })
      .catch((error) => {
        console.error("Error fetching reminders:", error);
      });
  }, [session]);

  // Expand reminders for the current week
  const expandedReminders = useMemo(() => {
    const weekStart = new Date(currentDate);
    const dayOfWeek = (currentDate.getDay() + 6) % 7; // Mon = 0
    weekStart.setDate(currentDate.getDate() - dayOfWeek);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const expanded = reminders.flatMap((reminder) => {
      const dates = expandReminderToDates(reminder, weekStart, weekEnd);
      return dates.map((date) => ({
        ...reminder,
        due_date: date,
      }));
    });

    return expanded;
  }, [reminders, currentDate]);

  // First 2 upcoming tasks from the current week
  const upcomingTasks = useMemo(() => {
    const todayKey = new Date().toISOString().split("T")[0];
    return expandedReminders
      .filter((r) => (r.due_date || "").slice(0, 10) >= todayKey)
      .sort((a, b) => (a.due_date > b.due_date ? 1 : -1))
      .slice(0, 2)
      .map((r) => {
        const { title, description } = generateReminderContent(
          r.task_type,
          r.plant || {}
        );
        return { ...r, title, description, isCompleted: false };
      });
  }, [expandedReminders]);

  return (
    <div className="home-page bg-grass-pattern">
      <Calendar
        variant="week"
        date={currentDate}
        reminders={expandedReminders}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <img
        className="main-garden"
        src={MainGarden}
        alt="the main digital garden"
      />

      <div className="home-actions">
        <Link to="/plants">
          <Button icon="Psychiatry" text="My plants" variant="secondary" />
        </Link>
        <Link to="/plants">
          <Button icon="format_paint" variant="secondary" />
        </Link>
      </div>

      <TaskList
        title="Upcoming"
        tasks={upcomingTasks}
        showToggleButton={false}
      />
    </div>
  );
}
