import { useState } from "react";
import "./TaskList.css";
import IconElement from "./IconElement";

export default function TaskList({
  title = "Today's tasks",
  tasks = [],
  onTaskToggle,
  showToggleButton = false,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTaskIcon = (taskType) => {
    const iconMap = {
      water: "water_drop",
      fertilize: "compost",
      mist: "household_supplies",
      rotate: "sunny",
    };
    return iconMap[taskType] || "task_alt";
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  if (showToggleButton) {
    return (
      <>
        {/* Floating toggle button */}
        <button
          className="task-list-toggle-button"
          onClick={handleToggle}
          aria-label={isExpanded ? "Close task list" : "Open task list"}
        >
          {isExpanded ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          )}
        </button>

        {/* Overlay when expanded */}
        {isExpanded && (
          <>
            <div
              className="task-list-overlay-backdrop"
              onClick={handleToggle}
            />
            <div className="task-list-overlay">
              <TaskListContent
                title={title}
                tasks={tasks}
                onTaskToggle={onTaskToggle}
                getTaskIcon={getTaskIcon}
                displayTasks={tasks}
              />
            </div>
          </>
        )}
      </>
    );
  }

  // Static card version
  return (
    <div className="task-list">
      <TaskListContent
        title={title}
        tasks={tasks}
        onTaskToggle={onTaskToggle}
        getTaskIcon={getTaskIcon}
        displayTasks={tasks}
      />
    </div>
  );
}

function TaskListContent({
  title,
  tasks,
  onTaskToggle,
  getTaskIcon,
  displayTasks,
}) {
  return (
    <>
      <div className="task-list-header">
        <p className="task-list-title">{title}</p>
      </div>

      <div className="task-list-items">
        {displayTasks.length === 0 ? (
          <div className="task-list-item">
            <p className="task-list-item-description">No tasks for today</p>
          </div>
        ) : (
          displayTasks.map((task) => (
            <div
              key={`${task.id}-${task.due_date || "once"}`}
              className={`task-list-item ${
                task.isCompleted ? "is-completed" : ""
              }`}
            >
              <div className="task-list-item-left">
                <div
                  className={`task-checkbox-circle ${
                    task.isCompleted ? "is-checked" : ""
                  }`}
                  onClick={() => !task.isCompleted && onTaskToggle?.(task)}
                  role="button"
                  tabIndex={0}
                  aria-label={
                    task.isCompleted ? "Task completed" : "Mark task complete"
                  }
                />
                <div className="task-list-item-content">
                  <p className="task-list-item-title">{task.title}</p>
                  {task.description && (
                    <p className="task-list-item-description">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="task-list-item-icon">
                <IconElement icon={getTaskIcon(task.task_type)} />
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
