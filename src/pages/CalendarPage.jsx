import { useEffect, useMemo, useState } from "react";
import "./CalendarPage.css";
import Calendar from "../components/Calendar.jsx";
import TaskList from "../components/TaskList.jsx";
import { useAuthSession } from "../components/RequireAuth.jsx";
import {
  listRemindersForUser,
  generateReminderContent,
  expandReminderToDates,
  completeTaskOccurrence,
  getCompletedTaskDates,
  uncompleteTaskOccurrence,
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
        setReminders(remindersData);
        setCompletedTasks(completedData);
      })
      .catch((error) => {
        console.error("Error fetching calendar data:", error);
      })
      .finally(() => setLoading(false));
  }, [session, current]);

  // Mobile-only page: no responsive branching required

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
    return expandedReminders
      .filter((r) => {
        if (!r.due_date) return false;
        const datePart = r.due_date.split("T")[0];
        return datePart === selectedDate;
      })
      .map((r) => {
        const { title, description } = generateReminderContent(
          r.task_type,
          r.plant || {}
        );
        const completionKey = `${r.id}-${r.due_date}`;
        const isCompleted = Boolean(completedTasks[completionKey]);
        return {
          ...r,
          title,
          description,
          isRecurring: true,
          isCompleted,
        };
      });
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

    const completionKey = `${task.id}-${task.due_date}`;
    const alreadyEntryId = completedTasks[completionKey];

    try {
      if (task.isCompleted && alreadyEntryId) {
        // Uncomplete
        const res = await uncompleteTaskOccurrence({
          userId,
          reminderId: task.id,
          dueDate: task.due_date,
        });
        if (res.success) {
          setCompletedTasks((prev) => {
            const copy = { ...prev };
            delete copy[completionKey];
            return copy;
          });
        }
      } else {
        // Complete
        const res = await completeTaskOccurrence({
          userId,
          reminderId: task.id,
          plantId: task.plant_id,
          taskType: task.task_type,
          dueDate: task.due_date,
        });
        if (res.entryId) {
          setCompletedTasks((prev) => ({
            ...prev,
            [completionKey]: res.entryId,
          }));
        }
      }
    } catch (error) {
      console.error("Toggle task failed:", error);
    }
  }

  return (
    <div className="calendar-page">
      <div className="calendar-container">
        <main className="calendar-main">
          <Calendar
            variant="full"
            date={current}
            reminders={expandedReminders}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
          />
        </main>

        <TaskList
          title={parseLocalDateKey(selectedDate).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          tasks={todaysTasks}
          onTaskToggle={handleTaskToggle}
          showToggleButton={false}
        />
      </div>
    </div>
  );
}
