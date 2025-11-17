import { useState, useEffect, useMemo, useRef } from "react";
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
  getCompletedTaskDates,
  completeTaskOccurrence,
} from "../services/reminders";

export default function HomePage() {
  const { session } = useAuthSession();
  const [currentDate] = useState(() => new Date());
  const [reminders, setReminders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [completedMap, setCompletedMap] = useState({}); // {`${reminderId}-${yyyy-mm-dd}`: journalEntryId}
  const [recentlyCompleted, setRecentlyCompleted] = useState({}); // transient visibility map
  const timersRef = useRef({});

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

  // Fetch completed occurrences for a near-future window so we can hide them in Upcoming
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;

    const start = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );
    const end = new Date(start);
    end.setDate(start.getDate() + 30); // look 30 days ahead for safety

    getCompletedTaskDates(userId, start.toISOString(), end.toISOString())
      .then((map) => setCompletedMap(map || {}))
      .catch((e) => console.error("Error fetching completed tasks:", e));

    return () => {
      // clear any pending hide timers on unmount
      Object.values(timersRef.current).forEach((id) => clearTimeout(id));
      timersRef.current = {};
    };
  }, [session, currentDate]);

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

  // First 3 upcoming tasks starting from the current date (inclusive)
  const upcomingTasks = useMemo(() => {
    const todayStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    ).getTime();

    const list = expandedReminders
      .map((r) => {
        const d =
          r.due_date instanceof Date ? r.due_date : new Date(r.due_date);
        const dueStart = new Date(
          d.getFullYear(),
          d.getMonth(),
          d.getDate()
        ).getTime();
        const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(d.getDate()).padStart(2, "0")}`;
        const completionKey = `${r.id}-${dateKey}`;
        return { r, dueStart, dateKey, completionKey };
      })
      .filter(({ dueStart }) => dueStart >= todayStart)
      // Hide already-completed occurrences (unless recently completed to show the check briefly)
      .filter(
        ({ completionKey }) =>
          !completedMap[completionKey] || recentlyCompleted[completionKey]
      )
      .sort((a, b) => a.dueStart - b.dueStart)
      .slice(0, 3)
      .map(({ r, dateKey, completionKey }) => {
        const { title, description } = generateReminderContent(
          r.task_type,
          r.plant || {}
        );
        const isCompleted = Boolean(recentlyCompleted[completionKey]);
        return { ...r, title, description, isCompleted, due_date: dateKey };
      });
    return list;
  }, [expandedReminders, currentDate, completedMap, recentlyCompleted]);

  // Toggle handler: mark complete now and hide after a short delay
  async function handleUpcomingToggle(task) {
    const userId = session?.user?.id;
    if (!userId) return;

    const completionKey = `${task.id}-${task.due_date}`;
    if (completedMap[completionKey]) return; // already completed (shouldn't be shown)

    try {
      const res = await completeTaskOccurrence({
        userId,
        reminderId: task.id,
        plantId: task.plant_id,
        taskType: task.task_type,
        dueDate: task.due_date,
      });

      // update completed map so future lists exclude this occurrence
      setCompletedMap((prev) => ({
        ...prev,
        [completionKey]: res.entryId || true,
      }));

      // show as completed briefly in UI
      setRecentlyCompleted((prev) => ({ ...prev, [completionKey]: true }));

      // schedule removal from UI after 2s (then the completedMap filter hides it)
      const t = setTimeout(() => {
        setRecentlyCompleted((prev) => {
          const copy = { ...prev };
          delete copy[completionKey];
          return copy;
        });
        // cleanup timer ref
        delete timersRef.current[completionKey];
      }, 2000);
      timersRef.current[completionKey] = t;
    } catch (e) {
      console.error("Failed to complete task:", e);
    }
  }

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
        onTaskToggle={handleUpcomingToggle}
        showToggleButton={false}
      />
    </div>
  );
}
