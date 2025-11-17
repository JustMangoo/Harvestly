import { useState } from "react";
import "./TaskList.css";
import IconElement from "./IconElement";

export default function TaskList({
  title = "Today's tasks",
  tasks = [],
  onTaskToggle,
}) {
  const getTaskIcon = (taskType) => {
    const iconMap = {
      water: "water_drop",
      fertilize: "compost",
      mist: "household_supplies",
      rotate: "sunny",
    };
    return iconMap[taskType] || "task_alt";
  };

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
                  onClick={() => onTaskToggle?.(task)}
                  role="button"
                  tabIndex={0}
                  aria-label={
                    task.isCompleted
                      ? "Unmark task completed"
                      : "Mark task complete"
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
