import { useMemo } from "react";
import "./Calendar.css";

// Local date key (yyyy-mm-dd) without UTC conversion
function localDateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Helper to build month matrix (6 weeks x 7 days)
function buildMonthMatrix(year, month) {
  const matrix = [];
  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay(); // 0-6 (Sun-Sat)
  const startDate = new Date(year, month, 1 - startDay);
  let cursor = new Date(startDate);
  for (let w = 0; w < 6; w++) {
    const row = [];
    for (let d = 0; d < 7; d++) {
      row.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    matrix.push(row);
  }
  return matrix;
}

// Map reminders to yyyy-mm-dd => array of tasks
function groupRemindersByDate(reminders = []) {
  const byDate = {};
  reminders.forEach((r) => {
    const dateKey = r.due_date?.split("T")[0]; // assume ISO date
    if (!dateKey) return;
    if (!byDate[dateKey]) byDate[dateKey] = [];
    byDate[dateKey].push(r);
  });
  return byDate;
}

// Color mapping for task types using design tokens
const TASK_COLORS = {
  water: "var(--color-water-reminder)",
  fertilize: "var(--color-fertilize-reminder)",
  mist: "var(--color-mist-reminder)",
  rotate: "var(--color-rotate-reminder)",
};

export default function Calendar({
  date,
  reminders = [],
  selectedDate,
  onSelectDate,
}) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const matrix = useMemo(() => buildMonthMatrix(year, month), [year, month]);
  const reminderMap = useMemo(
    () => groupRemindersByDate(reminders),
    [reminders]
  );

  const monthName = date.toLocaleString(undefined, { month: "long" });

  return (
    <div className="calendar-component">
      <div className="calendar-header-inline">
        <h2>
          {monthName} {year}
        </h2>
      </div>
      <div className="weekday-row">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
          <div key={w} className="weekday-cell">
            {w}
          </div>
        ))}
      </div>
      <div className="month-grid">
        {matrix.map((week, wi) => (
          <div className="week-row" key={wi}>
            {week.map((day) => {
              const isCurrentMonth = day.getMonth() === month;
              const dateKey = localDateKey(day);
              const tasks = reminderMap[dateKey] || [];

              // Get unique task types for this date
              const uniqueTaskTypes = [
                ...new Set(tasks.map((t) => t.task_type)),
              ];

              const isSelected = selectedDate && dateKey === selectedDate;
              const isToday = dateKey === localDateKey(new Date());
              return (
                <button
                  type="button"
                  key={dateKey}
                  className={
                    "cal-day " +
                    (isCurrentMonth ? "current-month" : "other-month") +
                    (isSelected ? " is-selected" : "") +
                    (isToday ? " is-today" : "")
                  }
                  onClick={() => onSelectDate?.(dateKey)}
                >
                  <span className="day-number">{day.getDate()}</span>
                  {/* Dot stack */}
                  {uniqueTaskTypes.length > 0 && (
                    <span
                      className="task-dots"
                      aria-label={`${tasks.length} tasks`}
                    >
                      {uniqueTaskTypes.slice(0, 4).map((taskType, i) => (
                        <span
                          key={taskType}
                          className="task-dot"
                          style={{
                            backgroundColor:
                              TASK_COLORS[taskType] || "var(--color-accent-60)",
                          }}
                        />
                      ))}
                      {uniqueTaskTypes.length > 4 && (
                        <span
                          className="task-dot more"
                          title={`+${uniqueTaskTypes.length - 4}`}
                        >
                          +
                        </span>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
