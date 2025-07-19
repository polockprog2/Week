import React, { useContext, useState, useEffect, useMemo } from "react";
import GlobalContext from "../context/GlobalContext";
import TaskModal from "./TaskModal";
import dayjs from "dayjs";
import { tasksApi } from "../services/api";
import UserContext from '../context/UserContext';

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200"
};

const statusColors = {
  todo: "bg-gray-100 text-gray-800 border-gray-200",
  "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
  done: "bg-green-100 text-green-800 border-green-200"
};

const labelColors = {
  purple: "bg-purple-500",
  green: "bg-green-500",
  yellow: "bg-yellow-500",
  pink: "bg-pink-500",
  gray: "bg-gray-500",
  blue: "bg-blue-500"
};

export default function TaskManagement() {
  const {
    savedTasks,
    dispatchCalTask,
    showTaskModal,
    setShowTaskModal,
    setSelectedTask,
    fetchTasks
  } = useContext(GlobalContext);

  const { user } = useContext(UserContext);

  // Quick add input state
  const [quickTaskTitle, setQuickTaskTitle] = useState("");

  // Helper for user initials
  function getUserInitials(name) {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  }

  // Quick add handler
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (quickTaskTitle.trim()) {
      try {
        const newTask = {
          title: quickTaskTitle.trim(),
          description: '',
          status: 'todo',
          priority: 'medium',
          label: 'gray',
          dueDate: null,
          userId: user?.userId || user?.id || null,
        };
        await tasksApi.create(newTask);
        setQuickTaskTitle("");
        await fetchTasks();
      } catch (err) {
        alert('Failed to add task. Please try again.');
      }
    }
  };

  const [viewMode, setViewMode] = useState("kanban"); // kanban, list, calendar
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterLabel, setFilterLabel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("dueDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [draggedTask, setDraggedTask] = useState(null);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let tasks = savedTasks.filter(task => 
      task.userId === user?.userId || task.UserId === user?.userId
    );

    // Apply filters
    if (filterStatus !== "all") {
      tasks = tasks.filter(task => task.status === filterStatus);
    }
    if (filterPriority !== "all") {
      tasks = tasks.filter(task => task.priority === filterPriority);
    }
    if (filterLabel !== "all") {
      tasks = tasks.filter(task => task.label === filterLabel);
    }
    if (searchQuery) {
      tasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (showOverdueOnly) {
      tasks = tasks.filter(task => 
        task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day')
      );
    }

    // Apply sorting
    tasks.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "dueDate":
          aValue = dayjs(a.dueDate);
          bValue = dayjs(b.dueDate);
          break;
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "createdAt":
          aValue = dayjs(a.CreatedAt || a.createdAt);
          bValue = dayjs(b.CreatedAt || b.createdAt);
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return tasks;
  }, [savedTasks, user, filterStatus, filterPriority, filterLabel, searchQuery, sortBy, sortOrder]);

  // Group tasks by status for kanban view
  const kanbanTasks = useMemo(() => {
    const groups = {
      todo: [],
      "in-progress": [],
      done: []
    };
    
    filteredTasks.forEach(task => {
      if (groups[task.status]) {
        groups[task.status].push(task);
      }
    });
    
    return groups;
  }, [filteredTasks]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const updatedTask = { ...task, status: newStatus };
      await tasksApi.update(task.taskId, updatedTask);
      dispatchCalTask({ type: "update", payload: updatedTask });
      await fetchTasks();
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      await handleStatusChange(draggedTask, newStatus);
    }
    setDraggedTask(null);
  };

  const getStatusCount = (status) => {
    return filteredTasks.filter(task => task.status === status).length;
  };

  const getPriorityCount = (priority) => {
    return filteredTasks.filter(task => task.priority === priority).length;
  };

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n') {
          e.preventDefault();
          handleCreateTask();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="h-full w-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-blue-50 via-white to-blue-50 border-b border-gray-200 py-7 animate-fade-in">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Task Management</h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">{filteredTasks.length} tasks</span>
              </div>
            </div>
            {/* New Task Button Only */}
            <button
              onClick={handleCreateTask}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ml-0 md:ml-6"
              title="Create a new task (Ctrl+N)"
              aria-label="Create a new task"
            >
              <span className="material-icons-outlined text-sm" title="Add">add</span>
              <span>New Task</span>
              <span className="text-xs opacity-75">(Ctrl+N)</span>
            </button>
          </div>
          {/* Welcome and Avatar */}
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <span className="text-gray-700 text-sm hidden sm:inline">Welcome, {user?.name ? user.name : user?.username ? user.username : "User"}!</span>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="User avatar" className="w-10 h-10 rounded-full border border-gray-300 shadow-sm" />
            ) : (
              <span className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-200 text-blue-800 font-bold text-lg border border-blue-300 shadow-sm">
                {getUserInitials(user?.name || user?.username)}
              </span>
            )}
          </div>
        </div>
        
        {/* Task Statistics */}
        <div className="mt-4 flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span className="text-sm text-gray-600">To Do: {getStatusCount("todo")}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">In Progress: {getStatusCount("in-progress")}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Done: {getStatusCount("done")}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Overdue: {filteredTasks.filter(task => task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day')).length}</span>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <span className="material-icons-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                search
              </span>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === "kanban" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="Kanban View"
              aria-label="Kanban View"
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === "list" 
                  ? "bg-white text-gray-900 shadow-sm" 
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title="List View"
              aria-label="List View"
            >
              List
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="todo">To Do ({getStatusCount("todo")})</option>
              <option value="in-progress">In Progress ({getStatusCount("in-progress")})</option>
              <option value="done">Done ({getStatusCount("done")})</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priority</option>
              <option value="high">High ({getPriorityCount("high")})</option>
              <option value="medium">Medium ({getPriorityCount("medium")})</option>
              <option value="low">Low ({getPriorityCount("low")})</option>
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="dueDate-asc">Due Date ↑</option>
              <option value="dueDate-desc">Due Date ↓</option>
              <option value="priority-desc">Priority ↓</option>
              <option value="priority-asc">Priority ↑</option>
              <option value="title-asc">Title A-Z</option>
              <option value="title-desc">Title Z-A</option>
              <option value="createdAt-desc">Created ↓</option>
              <option value="createdAt-asc">Created ↑</option>
            </select>

            {/* Overdue Filter */}
            <button
              onClick={() => setShowOverdueOnly(!showOverdueOnly)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                showOverdueOnly
                  ? "bg-red-100 text-red-800 border-red-200"
                  : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
              }`}
              title="Show only overdue tasks"
              aria-label="Show only overdue tasks"
            >
              <span className="material-icons-outlined text-sm mr-1" title="Overdue">warning</span>
              Overdue Only
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "kanban" ? (
          <KanbanView 
            kanbanTasks={kanbanTasks}
            onEditTask={handleEditTask}
            onStatusChange={handleStatusChange}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            draggedTask={draggedTask}
          />
        ) : (
          <ListView 
            tasks={filteredTasks}
            onEditTask={handleEditTask}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      {/* Task Modal */}
      {showTaskModal && <TaskModal />}
    </div>
  );
}

// Kanban View Component
function KanbanView({ kanbanTasks, onEditTask, onStatusChange, onDragStart, onDragOver, onDrop, draggedTask }) {
  const statusConfig = {
    todo: { title: "To Do", color: "bg-gray-500", icon: "radio_button_unchecked" },
    "in-progress": { title: "In Progress", color: "bg-blue-500", icon: "pending" },
    done: { title: "Done", color: "bg-green-500", icon: "check_circle" }
  };

  return (
    <div className="h-full flex space-x-6 p-6 overflow-x-auto">
      {Object.entries(statusConfig).map(([status, config]) => (
        <div
          key={status}
          className="flex-shrink-0 w-80"
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, status)}
        >
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
            {/* Column Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                  <h3 className="font-semibold text-gray-900">{config.title}</h3>
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {kanbanTasks[status]?.length || 0}
                  </span>
                </div>
                <span className="material-icons-outlined text-gray-400 text-sm" title={config.title + ' column icon'} aria-label={config.title + ' column icon'}>
                  {config.icon}
                </span>
              </div>
            </div>

            {/* Task Cards */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {kanbanTasks[status]?.map((task) => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  onEdit={onEditTask}
                  onStatusChange={onStatusChange}
                  onDragStart={onDragStart}
                  isDragging={draggedTask?.taskId === task.taskId}
                />
              ))}
              {kanbanTasks[status]?.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <span className="material-icons-outlined text-4xl mb-2">inbox</span>
                  <p className="text-sm">No tasks</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// List View Component
function ListView({ tasks, onEditTask, onStatusChange }) {
  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-white">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-700">
          <div className="col-span-4">Task</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-2">Due Date</div>
          <div className="col-span-1">Label</div>
          <div className="col-span-1">Actions</div>
        </div>

        {/* Task Rows */}
        {tasks.map((task) => {
          const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day');
          const isDueToday = task.dueDate && dayjs(task.dueDate).isSame(dayjs(), 'day');
          return (
            <div
              key={task.taskId}
              className={`grid grid-cols-12 gap-4 px-6 py-4 border-b transition-colors relative
                ${isOverdue ? 'border-red-400 bg-red-50 animate-pulse' : isDueToday ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100 hover:bg-gray-50'}
              `}
            >
              {/* Overdue/Today Badge */}
              {isOverdue && (
                <span className="absolute top-2 right-20 bg-red-500 text-white text-xs px-2 py-0.5 rounded shadow" title="Overdue">Overdue</span>
              )}
              {isDueToday && !isOverdue && (
                <span className="absolute top-2 right-20 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded shadow" title="Due Today">Today</span>
              )}
              <div className="col-span-4">
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => onStatusChange(task, task.status === "done" ? "todo" : "done")}
                    className="mt-1"
                    title={task.status === 'done' ? 'Mark as To Do' : 'Mark as Done'}
                    aria-label={task.status === 'done' ? 'Mark as To Do' : 'Mark as Done'}
                  >
                    <span className={`material-icons-outlined text-lg ${
                      task.status === "done" ? "text-green-600" : "text-gray-400"
                    }`} title={task.status === 'done' ? 'Done' : 'To Do'}>
                      {task.status === "done" ? "check_circle" : "radio_button_unchecked"}
                    </span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-gray-500 truncate mt-1">{task.description}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <select
                  value={task.status}
                  onChange={(e) => onStatusChange(task, e.target.value)}
                  className={`px-2 py-1 rounded text-xs font-medium border ${statusColors[task.status]}`}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="col-span-2">
                <span className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-gray-600">
                  {task.dueDate ? dayjs(task.dueDate).format("MMM D, YYYY") : "No due date"}
                </span>
              </div>
              <div className="col-span-1">
                {task.label && (
                  <div className={`w-4 h-4 rounded-full ${labelColors[task.label]}`}></div>
                )}
              </div>
              <div className="col-span-1">
                <button
                  onClick={() => onEditTask(task)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Edit Task"
                  aria-label="Edit Task"
                >
                  <span className="material-icons-outlined text-sm" title="Edit">edit</span>
                </button>
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <span className="material-icons-outlined text-6xl mb-4">task_alt</span>
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm">Try adjusting your filters or create a new task</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Task Card Component
function TaskCard({ task, onEdit, onStatusChange, onDragStart, isDragging }) {
  const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day');
  const isDueToday = task.dueDate && dayjs(task.dueDate).isSame(dayjs(), 'day');

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      className={`bg-white border rounded-lg p-4 cursor-move transition-all duration-200 hover:shadow-lg relative
        ${isDragging ? 'opacity-50' : ''}
        ${isOverdue ? 'border-red-400 shadow-red-200 animate-pulse' : isDueToday ? 'border-yellow-400 shadow-yellow-100' : 'border-gray-200'}
      `}
      title={isOverdue ? 'Overdue Task' : isDueToday ? 'Due Today' : 'Task Card'}
      aria-label={isOverdue ? 'Overdue Task' : isDueToday ? 'Due Today' : 'Task Card'}
    >
      {/* Overdue/Today Badge */}
      {isOverdue && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded shadow" title="Overdue">Overdue</span>
      )}
      {isDueToday && !isOverdue && (
        <span className="absolute top-2 right-2 bg-yellow-400 text-white text-xs px-2 py-0.5 rounded shadow" title="Due Today">Today</span>
      )}
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(task, task.status === "done" ? "todo" : "done");
            }}
            className="mt-1"
            title={task.status === 'done' ? 'Mark as To Do' : 'Mark as Done'}
            aria-label={task.status === 'done' ? 'Mark as To Do' : 'Mark as Done'}
          >
            <span className={`material-icons-outlined text-lg ${
              task.status === "done" ? "text-green-600" : "text-gray-400"
            }`} title={task.status === 'done' ? 'Done' : 'To Do'}>
              {task.status === "done" ? "check_circle" : "radio_button_unchecked"}
            </span>
          </button>
          <span className={`px-2 py-1 rounded text-xs font-medium border ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          title="More Actions"
          aria-label="More Actions"
        >
          <span className="material-icons-outlined text-sm" title="More">more_vert</span>
        </button>
      </div>

      {/* Task Title */}
      <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{task.title}</h4>

      {/* Task Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Task Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {task.label && (
            <div className={`w-3 h-3 rounded-full ${labelColors[task.label]}`}></div>
          )}
          {task.dueDate && (
            <span className={`text-xs px-2 py-1 rounded ${
              isOverdue 
                ? 'bg-red-100 text-red-800' 
                : isDueToday 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-600'
            }`}>
              {dayjs(task.dueDate).format("MMM D")}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <span className="material-icons-outlined text-gray-400 text-sm">schedule</span>
          <span className="text-xs text-gray-500">
            {task.CreatedAt ? dayjs(task.CreatedAt).format("MMM D") : "New"}
          </span>
        </div>
      </div>
    </div>
  );
} 