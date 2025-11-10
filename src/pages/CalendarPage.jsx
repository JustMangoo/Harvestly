import { useEffect, useMemo, useState } from "react";
import "./CalendarPage.css";
import Calendar from "../components/Calendar.jsx";
import { useAuthSession } from "../components/RequireAuth.jsx";
import { listRemindersForUser } from "../services/reminders";

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
  const { session } = useAuthSession();

  // Fetch all user reminders once (could optimize by month)
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) return;
    setLoading(true);
    listRemindersForUser(userId)
      .then(setReminders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  // Filter reminders for selected date
  const todaysTasks = useMemo(
    () => reminders.filter((r) => r.due_date?.startsWith(selectedDate)),
    [reminders, selectedDate]
  );

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
            reminders={reminders}
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
                <li key={t.id} className="event-item">
                  <span
                    className="task-color-badge"
                    style={{
                      backgroundColor: `var(--color-${t.task_type}-reminder)`,
                    }}
                  />
                  <div className="event-title">{t.title}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="sidebar-section">
            <button className="btn-primary">New Task</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
