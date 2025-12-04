const STORAGE_KEYS = {
  TASKS: "liquid_todo_tasks",
  THEME: "liquid_todo_theme",
};

const timeGreetingEl = document.getElementById("timeGreeting");
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const todoList = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const itemsLeftEl = document.getElementById("itemsLeft");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

let tasks = [];
let currentFilter = "all";

document.addEventListener("DOMContentLoaded", () => {
  setTimeGreeting();
  initTheme();
  loadTasks();
  bindEvents();
  renderTasks();

  if (window.AOS) {
    AOS.init({
      duration: 700,
      easing: "ease-out-quart",
      once: false,
    });
  }
});

function setTimeGreeting() {
  if (!timeGreetingEl) return;

  const now = new Date();
  const hour = now.getHours();

  let label = "Good evening";
  if (hour >= 5 && hour < 12) {
    label = "Good morning";
  } else if (hour >= 12 && hour < 18) {
    label = "Good afternoon";
  }

  timeGreetingEl.textContent = `${label}, ibra`;
}

function bindEvents() {
  addTaskBtn.addEventListener("click", handleAddTask);

  taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      handleAddTask();
    }
  });

  todoList.addEventListener("click", handleListClick);

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setFilter(button.dataset.filter);
    });
  });

  clearCompletedBtn.addEventListener("click", clearCompleted);
  themeToggle.addEventListener("click", toggleTheme);
}

function handleAddTask() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }

  const task = {
    id:
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 7),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(task);
  taskInput.value = "";
  saveTasks();
  renderTasks(true);
}

function handleListClick(event) {
  const listItem = event.target.closest(".todo-item");
  if (!listItem) return;

  const id = listItem.dataset.id;

  if (event.target.closest(".delete-btn")) {
    // Always delete, but only show a message when we are in the Completed view.
    deleteTask(id, currentFilter === "completed");
  } else {
    if (currentFilter === "completed") {
      deleteTask(id, true);
    } else {
      toggleTask(id);
    }
  }
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks(false, id);
}

function deleteTask(id, showMessage = false) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();

  if (showMessage) {
    showToast("Task deleted");
  }
}

function setFilter(filter) {
  currentFilter = filter;

  filterButtons.forEach((button) => {
    if (button.dataset.filter === filter) {
      button.classList.add("is-active");
    } else {
      button.classList.remove("is-active");
    }
  });

  renderTasks();
}

function clearCompleted() {
  const hadCompleted = tasks.some((task) => task.completed);
  if (!hadCompleted) return;

  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

function renderTasks(animateNew = false, toggledId = null) {
  const filtered = getFilteredTasks();
  todoList.innerHTML = "";

  if (!tasks.length) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = filtered.length ? "none" : "block";
  }

  filtered.forEach((task, index) => {
    const li = document.createElement("li");
    let itemClass = "todo-item";
    if (task.completed) itemClass += " completed";
    if (animateNew && index === 0) itemClass += " todo-item--new";
    if (toggledId && task.id === toggledId) itemClass += " todo-item--toggled";
    li.className = itemClass;
    li.dataset.id = task.id;

    // Keep list items mostly driven by CSS animations; avoid heavy AOS on each render.
    // AOS is still used on the main layout sections defined in index.html.

    const createdDate = new Date(task.createdAt);
    const dateLabel = formatDateLabel(createdDate);

    li.innerHTML = `
      <button class="checkbox" aria-label="Toggle task">
        <span class="checkbox-inner"></span>
      </button>
      <div class="task-main">
        <p class="task-text">${escapeHtml(task.text)}</p>
        <p class="task-date">${dateLabel}</p>
      </div>
      <button class="delete-btn" aria-label="Delete task">&times;</button>
    `;

    todoList.appendChild(li);
  });

  const remaining = tasks.filter((task) => !task.completed).length;

  itemsLeftEl.textContent =
    remaining === 0
      ? "No tasks left"
      : remaining === 1
      ? "1 task left"
      : `${remaining} tasks left`;

  if (window.AOS && animateNew) {
    // Only refresh AOS when a brand new task is added, not on every filter change.
    AOS.refresh();
  }
}

function showToast(text) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = text;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("toast--visible");
  });

  setTimeout(() => {
    toast.classList.remove("toast--visible");
    setTimeout(() => {
      toast.remove();
    }, 250);
  }, 2200);
}

function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function saveTasks() {
  try {
    const data = JSON.stringify(tasks);
    localStorage.setItem(STORAGE_KEYS.TASKS, data);
  } catch (error) {
    console.error("Failed to save tasks", error);
  }
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      tasks = [];
      return;
    }

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      tasks = parsed.map((task) => ({
        id: String(task.id ?? Date.now().toString()),
        text: String(task.text ?? ""),
        completed: Boolean(task.completed),
        createdAt: task.createdAt || new Date().toISOString(),
      }));
    } else {
      tasks = [];
    }
  } catch (error) {
    console.error("Failed to load tasks", error);
    tasks = [];
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDateLabel(date) {
  const now = new Date();

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (sameDay) return `Today • ${time}`;
  if (isYesterday) return `Yesterday • ${time}`;

  return `${date.toLocaleDateString()} • ${time}`;
}

function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEYS.THEME);
  let theme = stored;

  if (!theme) {
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    theme = prefersDark ? "dark" : "light";
  }

  applyTheme(theme);
}

function toggleTheme() {
  const current = document.body.getAttribute("data-theme") || "dark";
  const next = current === "dark" ? "light" : "dark";

  applyTheme(next);

  try {
    localStorage.setItem(STORAGE_KEYS.THEME, next);
  } catch (error) {
    console.error("Failed to save theme", error);
  }
}

function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);

  if (theme === "dark") {
    themeIcon.textContent = "🌙";
  } else {
    themeIcon.textContent = "☀️";
  }
}
