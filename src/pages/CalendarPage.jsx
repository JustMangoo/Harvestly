import { useEffect, useMemo, useState } from "react";
import "./CalendarPage.css";
import Calendar from "../components/Calendar.jsx";
import { useAuthSession } from "../components/RequireAuth.jsx";
import {
  listRemindersForUser,
  generateReminderContent,
  expandReminderToDates,
  completeTaskOccurrence,
  getCompletedTaskDates,
} from "../services/reminders";

// Utilities: local date key (yyyy-mm-dd) and parser avoiding UTC shift
function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseLocalDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function CalendarPage() {
  const [current, setCurrent] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()));
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completedTasks, setCompletedTasks] = useState({});
  const { session } = useAuthSession();

  // Fetch all user reminders once (could optimize by month)
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    setLoading(true);

    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

    Promise.all([
      listRemindersForUser(userId),
      getCompletedTaskDates(
        userId,
        monthStart.toISOString(),
        monthEnd.toISOString()
      ),
    ])
      .then(([remindersData, completedData]) => {
        console.log("Fetched reminders:", remindersData);
        console.log("Completed tasks:", completedData);
        setReminders(remindersData);
        setCompletedTasks(completedData);
      })
      .catch((error) => {
        console.error("Error fetching calendar data:", error);
      })
      .finally(() => setLoading(false));
  }, [session, current]);

  // Expand reminders into actual dates for the current month
  const expandedReminders = useMemo(() => {
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

    const expanded = reminders.flatMap((reminder) => {
      const dates = expandReminderToDates(reminder, monthStart, monthEnd);
      return dates.map((date) => ({
        ...reminder,
        due_date: date,
      }));
    });

    console.log("Expanded reminders:", expanded);
    return expanded;
  }, [reminders, current]);

  // Filter reminders for selected date and enrich with generated content
  const todaysTasks = useMemo(() => {
    const tasks = expandedReminders
      .filter((r) => r.due_date?.startsWith(selectedDate))
      .map((r) => {
        const { title, description } = generateReminderContent(
          r.task_type,
          r.plant || {}
        );
        const isRecurring =
          r.frequency && r.frequency !== "once" && r.frequency !== "";
        const completionKey = `${r.id}-${r.due_date}`;
        const isCompleted = isRecurring
          ? completedTasks[completionKey]
          : r.completed;

        return {
          ...r,
          title,
          description,
          isRecurring,
          isCompleted: Boolean(isCompleted),
        };
      });

    console.log("Selected date:", selectedDate);
    console.log("Today's tasks:", tasks);
    return tasks;
  }, [expandedReminders, selectedDate, completedTasks]);

  function prevMonth() {
    setCurrent((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrent((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  }
  function goToday() {
    const today = new Date();
    setCurrent(today);
    setSelectedDate(dateKey(today));
  }

  async function handleTaskToggle(task) {
    const userId = session?.user?.id;
    if (!userId) return;

    try {
      await completeTaskOccurrence({
        userId,
        reminderId: task.id,
        plantId: task.plant_id,
        taskType: task.task_type,
        dueDate: task.due_date,
        isRecurring: task.isRecurring,
      });

      // Update local state
      if (task.isRecurring) {
        const completionKey = `${task.id}-${task.due_date}`;
        setCompletedTasks((prev) => ({
          ...prev,
          [completionKey]: true,
        }));
      } else {
        // Update the reminder in the list
        setReminders((prev) =>
          prev.map((r) => (r.id === task.id ? { ...r, completed: true } : r))
        );
      }
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  }

  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <div className="calendar-title">
          <div className="calendar-controls">
            <button
              className="btn-ghost"
              onClick={prevMonth}
              aria-label="Previous month"
            >
              ‹
            </button>
            <button className="btn-ghost" onClick={goToday}>
              Today
            </button>
            <button
              className="btn-ghost"
              onClick={nextMonth}
              aria-label="Next month"
            >
              ›
            </button>
          </div>
        </div>
      </header>

      <div className="calendar-container">
        <main className="calendar-main">
          <Calendar
            date={current}
            reminders={expandedReminders}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </main>
        <aside className="calendar-sidebar">
          <div className="sidebar-section">
            <h3>
              {parseLocalDateKey(selectedDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </h3>
            {loading && <p className="event-item">Loading...</p>}
            {!loading && todaysTasks.length === 0 && (
              <p className="event-item">No tasks</p>
            )}
            <ul className="events-list">
              {todaysTasks.map((t) => (
                <li
                  key={`${t.id}-${t.due_date}`}
                  className={`event-item ${
                    t.isCompleted ? "is-completed" : ""
                  }`}
                >
                  <label className="task-checkbox-label">
                    <input
                      type="checkbox"
                      checked={t.isCompleted}
                      onChange={() => handleTaskToggle(t)}
                      disabled={t.isCompleted}
                      className="task-checkbox"
                    />
                    <span className="checkbox-custom" />
                  </label>
                  <span
                    className="task-color-badge"
                    style={{
                      backgroundColor: `var(--color-${t.task_type}-reminder)`,
                    }}
                  />
                  <div className="event-content">
                    <div className="event-title">{t.title}</div>
                    {t.description && (
                      <div className="event-description">{t.description}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
