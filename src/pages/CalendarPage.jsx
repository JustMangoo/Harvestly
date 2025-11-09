import { useMemo, useState } from "react";
import "./CalendarPage.css";

function getMonthMatrix(date) {
  const matrix = [];
  const year = date.getFullYear();
  const month = date.getMonth();

  // first day of month
  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay(); // 0 (Sun) - 6 (Sat)

  // determine first day to show (previous month's tail)
  const startDate = new Date(year, month, 1 - startDay);

  let day = new Date(startDate);
  for (let week = 0; week < 6; week++) {
    const weekRow = [];
    for (let d = 0; d < 7; d++) {
      weekRow.push(new Date(day));
      day.setDate(day.getDate() + 1);
    }
    matrix.push(weekRow);
  }

  return matrix;
}

export default function CalendarPage() {
  const [current, setCurrent] = useState(() => new Date());

  const monthMatrix = useMemo(() => getMonthMatrix(current), [current]);

  const monthName = current.toLocaleString(undefined, { month: "long" });
  const year = current.getFullYear();

  function prevMonth() {
    setCurrent((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrent((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1));
  }
  function goToday() {
    setCurrent(new Date());
  }

  // sample static events (placeholder until design details provided)
  const sampleEvents = [
    { time: "09:00", title: "Water mint", date: new Date() },
    { time: "14:00", title: "Prune basil", date: new Date() },
  ];

  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="calendar-page">
      <header className="calendar-header">
        <div className="calendar-title">
          <h2>
            {monthName} {year}
          </h2>
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
          <div className="weekday-row">
            {weekdayNames.map((w) => (
              <div key={w} className="weekday-cell">
                {w}
              </div>
            ))}
          </div>

          <div className="month-grid">
            {monthMatrix.map((week, wi) => (
              <div className="week-row" key={wi}>
                {week.map((day) => {
                  const isCurrentMonth = day.getMonth() === current.getMonth();
                  const isToday = ((d) =>
                    d.toDateString() === new Date().toDateString())(day);
                  return (
                    <div
                      key={day.toISOString()}
                      className={
                        "day-cell " +
                        (isCurrentMonth ? "current-month" : "other-month") +
                        (isToday ? " today" : "")
                      }
                    >
                      <div className="day-number">{day.getDate()}</div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </main>

        <aside className="calendar-sidebar">
          <div className="sidebar-section">
            <h3>Events</h3>
            <ul className="events-list">
              {sampleEvents.map((ev, i) => (
                <li key={i} className="event-item">
                  <div className="event-time">{ev.time}</div>
                  <div className="event-title">{ev.title}</div>
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
