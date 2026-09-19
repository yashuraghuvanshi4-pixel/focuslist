(function () {
  "use strict";

  const STORAGE_KEY = "focuslist.tasks.v1";

  const state = {
    tasks: [],
    statusFilter: "all",      // all | active | completed
    priorityFilter: "all",    // all | high | medium | low
    searchQuery: "",
  };

  const icons = {
    edit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',
    save: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    cancel: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    trash: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    circle: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  };

  const $ = (sel) => document.querySelector(sel);
  const taskListEl = $("#taskList");
  const emptyStateEl = $("#emptyState");
  const emptyTitleEl = $("#emptyTitle");
  const emptySubEl = $("#emptySub");

  /* ---------- Persistence ---------- */
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn("Could not load tasks from localStorage", err);
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
    } catch (err) {
      console.warn("Could not save tasks to localStorage", err);
    }
  }

  /* ---------- Render ---------- */
  function getFilteredTasks() {
    const query = state.searchQuery.trim().toLowerCase();
    return state.tasks.filter((task) => {
      if (state.statusFilter === "active" && task.completed) return false;
      if (state.statusFilter === "completed" && !task.completed) return false;
      if (state.priorityFilter !== "all" && task.priority !== state.priorityFilter) return false;
      if (query && !task.title.toLowerCase().includes(query)) return false;
      return true;
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function createTaskElement(task) {
    const li = document.createElement("li");
    li.className = "task" + (task.completed ? " is-completed" : "");
    li.dataset.id = task.id;

    const check = document.createElement("button");
    check.type = "button";
    check.className = "task-check";
    check.setAttribute("aria-label", task.completed ? "Mark as pending" : "Mark as completed");
    check.innerHTML = icons.circle;

    const body = document.createElement("div");
    body.className = "task-body";

    const row = document.createElement("div");
    row.className = "task-row";

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const badge = document.createElement("span");
    badge.className = "priority-badge priority-" + task.priority;
    badge.textContent = task.priority;

    row.appendChild(title);
    row.appendChild(badge);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "icon-btn";
    editBtn.setAttribute("aria-label", "Edit task");
    editBtn.innerHTML = icons.edit;

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "icon-btn btn-delete";
    delBtn.setAttribute("aria-label", "Delete task");
    delBtn.innerHTML = icons.trash;

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    body.appendChild(row);
    body.appendChild(actions);

    li.appendChild(check);
    li.appendChild(body);

    check.addEventListener("click", () => toggleTask(task.id));
    editBtn.addEventListener("click", () => enterEditMode(li, task));
    delBtn.addEventListener("click", () => deleteTask(task.id));

    return li;
  }

  function enterEditMode(li, task) {
    li.classList.add("editing");
    li.classList.remove("is-completed");
    li.dataset.editing = "true";
    li.innerHTML = "";

    const form = document.createElement("form");
    form.className = "edit-form";

    const rows = document.createElement("div");
    rows.className = "edit-rows";

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = task.title;
    titleInput.maxLength = 120;
    titleInput.setAttribute("aria-label", "Edit task title");
    titleInput.autofocus = true;
    titleInput.select();

    const prioritySelect = document.createElement("select");
    prioritySelect.setAttribute("aria-label", "Edit task priority");
    ["high", "medium", "low"].forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p;
      opt.textContent = p[0].toUpperCase() + p.slice(1);
      if (p === task.priority) opt.selected = true;
      prioritySelect.appendChild(opt);
    });

    rows.appendChild(titleInput);
    rows.appendChild(prioritySelect);

    const btns = document.createElement("div");
    btns.className = "edit-btns";

    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn btn-primary btn-sm";
    saveBtn.innerHTML = icons.save + " Save";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn btn-ghost btn-sm";
    cancelBtn.innerHTML = icons.cancel + " Cancel";

    btns.appendChild(saveBtn);
    btns.appendChild(cancelBtn);

    form.appendChild(rows);
    form.appendChild(btns);
    li.appendChild(form);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const newTitle = titleInput.value.trim();
      if (!newTitle) return;
      updateTask(task.id, { title: newTitle, priority: prioritySelect.value });
    });
    cancelBtn.addEventListener("click", () => render());
    titleInput.addEventListener("keydown", (e) => {
      if (e.key === "Escape") render();
    });
  }

  function render() {
    taskListEl.innerHTML = "";
    const filtered = getFilteredTasks();

    if (filtered.length === 0) {
      taskListEl.hidden = true;
      emptyStateEl.hidden = false;
      const isFiltering =
        state.statusFilter !== "all" ||
        state.priorityFilter !== "all" ||
        state.searchQuery.trim() !== "";
      if (isFiltering) {
        emptyTitleEl.textContent = "No matching tasks";
        emptySubEl.textContent = "Try adjusting your search or filters.";
      } else {
        emptyTitleEl.textContent = "No tasks yet";
        emptySubEl.textContent = "Add your first task above to get started.";
      }
    } else {
      taskListEl.hidden = false;
      emptyStateEl.hidden = true;
      const frag = document.createDocumentFragment();
      filtered.forEach((task) => frag.appendChild(createTaskElement(task)));
      taskListEl.appendChild(frag);
    }

    renderStats();
  }

  function renderStats() {
    const total = state.tasks.length;
    const completed = state.tasks.filter((t) => t.completed).length;
    const pending = total - completed;
    $("#statTotal").textContent = total;
    $("#statCompleted").textContent = completed;
    $("#statPending").textContent = pending;
  }

  function updateFilterUI() {
    document.querySelectorAll(".chip[data-status]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.status === state.statusFilter);
    });
    document.querySelectorAll(".chip[data-priority]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.priority === state.priorityFilter);
    });
  }

  /* ---------- Actions ---------- */
  function addTask(title, priority) {
    const task = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      title,
      priority,
      completed: false,
      createdAt: Date.now(),
    };
    state.tasks.push(task);
    state.statusFilter = "all";
    state.priorityFilter = "all";
    state.searchQuery = "";
    $("#searchInput").value = "";
    updateFilterUI();
    saveTasks();
    render();
  }

  function toggleTask(id) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    saveTasks();
    render();
  }

  function updateTask(id, changes) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    Object.assign(task, changes);
    saveTasks();
    render();
  }

  function deleteTask(id) {
    state.tasks = state.tasks.filter((t) => t.id !== id);
    saveTasks();
    render();
  }

  /* ---------- Events ---------- */
  function initEvents() {
    $("#addForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("#taskInput");
      const title = input.value.trim();
      if (!title) return;
      addTask(title, $("#prioritySelect").value);
      input.value = "";
      input.focus();
    });

    $("#searchInput").addEventListener("input", (e) => {
      state.searchQuery = e.target.value;
      render();
    });

    document.querySelectorAll(".chip[data-status]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.statusFilter = btn.dataset.status;
        updateFilterUI();
        render();
      });
    });

    document.querySelectorAll(".chip[data-priority]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.priorityFilter = btn.dataset.priority;
        updateFilterUI();
        render();
      });
    });

    $("#clearFilters").addEventListener("click", () => {
      state.statusFilter = "all";
      state.priorityFilter = "all";
      state.searchQuery = "";
      $("#searchInput").value = "";
      updateFilterUI();
      render();
    });
  }

  function setToday() {
    const el = $("#todayLabel");
    try {
      const d = new Date();
      const label = d.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
      el.textContent = label;
    } catch {
      el.textContent = "";
    }
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    state.tasks = loadTasks();
    setToday();
    initEvents();
    render();
  });
})();