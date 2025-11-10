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
  const startDay = (firstOfMonth.getDay() + 6) % 7; // Mon = 0, Sun = 6
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

// Helper to build week row (just 7 days around a given date)
function buildWeekRow(date) {
  const dayOfWeek = (date.getDay() + 6) % 7; // Mon = 0
  const startDate = new Date(date);
  startDate.setDate(date.getDate() - dayOfWeek);

  const row = [];
  for (let i = 0; i < 7; i++) {
    row.push(new Date(startDate));
    startDate.setDate(startDate.getDate() + 1);
  }
  return row;
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
  variant = "full", // "full" or "week"
  onPrevMonth,
  onNextMonth,
}) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const matrix = useMemo(
    () =>
      variant === "full" ? buildMonthMatrix(year, month) : [buildWeekRow(date)],
    [variant, year, month, date]
  );
  const reminderMap = useMemo(
    () => groupRemindersByDate(reminders),
    [reminders]
  );

  const monthName = date.toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
  const showHeader = variant === "full";

  return (
    <div
      className={`calendar-component ${
        variant === "week" ? "calendar-week" : ""
      }`}
    >
      {showHeader && (
        <div className="calendar-month-header">
          <button
            className="calendar-nav-button"
            onClick={onPrevMonth}
            aria-label="Previous month"
          >
            <svg width="11" height="19" viewBox="0 0 11 19" fill="currentColor">
              <path
                d="M10 1L2 9.5L10 18"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </button>
          <h2 className="calendar-month-name">{monthName}</h2>
          <button
            className="calendar-nav-button"
            onClick={onNextMonth}
            aria-label="Next month"
          >
            <svg width="11" height="19" viewBox="0 0 11 19" fill="currentColor">
              <path
                d="M1 1L9 9.5L1 18"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </button>
        </div>
      )}

      <div className="weekday-row">
        {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((w) => (
          <div key={w} className="weekday-cell">
            {w}
          </div>
        ))}
      </div>

      {variant === "full" && <div className="calendar-divider" />}

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
                  {/* Dot row */}
                  {uniqueTaskTypes.length > 0 && (
                    <span className="task-dots">
                      {uniqueTaskTypes.slice(0, 4).map((taskType) => (
                        <span
                          key={taskType}
                          className="task-dot"
                          style={{
                            backgroundColor:
                              TASK_COLORS[taskType] || "var(--color-accent-60)",
                          }}
                        />
                      ))}
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
