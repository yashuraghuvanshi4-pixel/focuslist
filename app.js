/**
 * FocusList — Modern Frontend-Only Task Manager
 * Zero external dependencies, pure vanilla ES6+, LocalStorage persistence.
 */

(() => {
  'use strict';

  // --- Configuration & Constants ---
  const STORAGE_KEY = 'focuslist_tasks_v1';
  const THEME_KEY = 'focuslist_theme';

  const INITIAL_SAMPLE_TASKS = [
    {
      id: 'task-sample-1',
      title: 'Finalize quarterly product roadmap & deliverable timelines',
      priority: 'high',
      completed: false,
      createdAt: Date.now() - 3600000 * 4,
      completedAt: null
    },
    {
      id: 'task-sample-2',
      title: 'Review team pull requests and optimize bundle size',
      priority: 'medium',
      completed: false,
      createdAt: Date.now() - 3600000 * 2,
      completedAt: null
    },
    {
      id: 'task-sample-3',
      title: 'Morning 20-minute mindfulness & stretching routine',
      priority: 'low',
      completed: true,
      createdAt: Date.now() - 3600000 * 6,
      completedAt: Date.now() - 3600000 * 5
    },
    {
      id: 'task-sample-4',
      title: 'Organize project documentation in team knowledge base',
      priority: 'medium',
      completed: false,
      createdAt: Date.now() - 3600000 * 1,
      completedAt: null
    }
  ];

  // --- SVG Icons Map ---
  const ICONS = {
    check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    edit: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    trash: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
    save: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    cancel: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    emptyInbox: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>`,
    emptySearch: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`
  };

  // --- App State ---
  const state = {
    tasks: [],
    filterStatus: 'all',     // 'all' | 'active' | 'completed'
    filterPriority: 'all',   // 'all' | 'high' | 'medium' | 'low'
    searchQuery: '',
    editingTaskId: null,
    lastDeletedTask: null,
    lastDeletedIndex: -1,
    toastTimeout: null
  };

  // --- DOM Elements Cache ---
  const DOM = {
    html: document.documentElement,
    themeToggleBtn: document.getElementById('btn-theme-toggle'),
    shortcutsBtn: document.getElementById('btn-shortcuts'),
    shortcutsDialog: document.getElementById('shortcuts-dialog'),
    closeShortcutsBtn: document.getElementById('btn-close-shortcuts'),
    exportImportBtn: document.getElementById('btn-export-import'),
    backupDialog: document.getElementById('backup-dialog'),
    closeBackupBtn: document.getElementById('btn-close-backup'),
    doExportBtn: document.getElementById('btn-do-export'),
    doImportBtn: document.getElementById('btn-do-import'),
    importFileInput: document.getElementById('import-file-input'),
    reloadSamplesBtn: document.getElementById('btn-reload-samples'),

    // Statistics
    statTotal: document.getElementById('stat-total'),
    statPending: document.getElementById('stat-pending'),
    statCompleted: document.getElementById('stat-completed'),
    statPercentage: document.getElementById('stat-percentage'),
    progressBarFill: document.getElementById('progress-bar-fill'),
    progressContainer: document.getElementById('progress-container'),
    statProgressText: document.getElementById('stat-progress-text'),

    // Creation Form
    taskForm: document.getElementById('task-form'),
    taskInput: document.getElementById('task-input'),
    charCount: document.getElementById('char-count'),

    // Toolbar & Search
    searchInput: document.getElementById('search-input'),
    clearSearchBtn: document.getElementById('btn-clear-search'),
    statusTabs: document.querySelectorAll('.tab-btn'),
    badgeAll: document.getElementById('badge-count-all'),
    badgeActive: document.getElementById('badge-count-active'),
    badgeCompleted: document.getElementById('badge-count-completed'),
    priorityFilter: document.getElementById('priority-filter'),

    // List & Meta Bar
    listMetaBar: document.getElementById('list-meta-bar'),
    filterIndicatorText: document.getElementById('filter-indicator-text'),
    clearCompletedBtn: document.getElementById('btn-clear-completed'),
    taskList: document.getElementById('task-list'),
    emptyState: document.getElementById('empty-state'),
    emptyIcon: document.getElementById('empty-icon'),
    emptyTitle: document.getElementById('empty-title'),
    emptyDesc: document.getElementById('empty-desc'),
    resetFiltersBtn: document.getElementById('btn-reset-filters'),

    // Toasts
    toastContainer: document.getElementById('toast-container')
  };

  // --- Storage Helper ---
  function loadTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to read from localStorage:', err);
    }
    // Default initial starter tasks if fresh install
    saveTasks(INITIAL_SAMPLE_TASKS);
    return [...INITIAL_SAMPLE_TASKS];
  }

  function saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('Failed to write to localStorage:', err);
      showToast('Storage quota exceeded or disabled', 'error');
    }
  }

  // --- Theme Management ---
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      DOM.html.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      DOM.html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }
  }

  function toggleTheme() {
    const currentTheme = DOM.html.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    DOM.html.setAttribute('data-theme', newTheme);
    try {
      localStorage.setItem(THEME_KEY, newTheme);
    } catch (e) {}
    showToast(`Switched to ${newTheme} mode`);
  }

  // --- Toast Notifications ---
  function showToast(message, actionText = null, onAction = null, duration = 4000) {
    if (state.toastTimeout) {
      clearTimeout(state.toastTimeout);
    }
    DOM.toastContainer.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = 'toast';

    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    toast.appendChild(textSpan);

    if (actionText && typeof onAction === 'function') {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'toast-btn';
      actionBtn.textContent = actionText;
      actionBtn.addEventListener('click', () => {
        onAction();
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 200);
      });
      toast.appendChild(actionBtn);
    }

    DOM.toastContainer.appendChild(toast);

    state.toastTimeout = setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }

  // --- Task CRUD Operations ---
  function addTask(title, priority) {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      showToast('Please enter a task title');
      return false;
    }

    const newTask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: trimmedTitle,
      priority: ['high', 'medium', 'low'].includes(priority) ? priority : 'medium',
      completed: false,
      createdAt: Date.now(),
      completedAt: null
    };

    state.tasks.unshift(newTask);
    saveTasks(state.tasks);
    renderApp();
    showToast(`Task added: "${newTask.title.substring(0, 30)}${newTask.title.length > 30 ? '...' : ''}"`);
    return true;
  }

  function toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    task.completed = !task.completed;
    task.completedAt = task.completed ? Date.now() : null;
    saveTasks(state.tasks);
    renderApp();

    if (task.completed) {
      showToast('Task marked as completed! 🎉');
    }
  }

  function startEditingTask(id) {
    state.editingTaskId = id;
    renderTasks();
    const editInput = document.querySelector(`.task-edit-input[data-id="${id}"]`);
    if (editInput) {
      editInput.focus();
      editInput.select();
    }
  }

  function cancelEditingTask() {
    state.editingTaskId = null;
    renderTasks();
  }

  function saveEditedTask(id, newTitle, newPriority) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    const trimmed = newTitle.trim();
    if (!trimmed) {
      showToast('Task title cannot be empty');
      return;
    }

    task.title = trimmed;
    if (['high', 'medium', 'low'].includes(newPriority)) {
      task.priority = newPriority;
    }

    state.editingTaskId = null;
    saveTasks(state.tasks);
    renderApp();
    showToast('Task updated successfully');
  }

  function deleteTask(id) {
    const taskIndex = state.tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const deletedTask = state.tasks[taskIndex];
    state.lastDeletedTask = { ...deletedTask };
    state.lastDeletedIndex = taskIndex;

    state.tasks.splice(taskIndex, 1);
    if (state.editingTaskId === id) {
      state.editingTaskId = null;
    }

    saveTasks(state.tasks);
    renderApp();

    showToast('Task deleted', 'Undo', () => {
      if (state.lastDeletedTask) {
        state.tasks.splice(state.lastDeletedIndex, 0, state.lastDeletedTask);
        saveTasks(state.tasks);
        state.lastDeletedTask = null;
        state.lastDeletedIndex = -1;
        renderApp();
        showToast('Task restored');
      }
    });
  }

  function clearCompletedTasks() {
    const completedCount = state.tasks.filter(t => t.completed).length;
    if (completedCount === 0) return;

    const previousTasks = [...state.tasks];
    state.tasks = state.tasks.filter(t => !t.completed);
    saveTasks(state.tasks);
    renderApp();

    showToast(`Cleared ${completedCount} completed task${completedCount > 1 ? 's' : ''}`, 'Undo', () => {
      state.tasks = previousTasks;
      saveTasks(state.tasks);
      renderApp();
      showToast('Completed tasks restored');
    });
  }

  // --- Filtering & Searching Logic ---
  function getFilteredTasks() {
    const query = state.searchQuery.trim().toLowerCase();

    return state.tasks.filter(task => {
      // 1. Status Filter
      if (state.filterStatus === 'active' && task.completed) return false;
      if (state.filterStatus === 'completed' && !task.completed) return false;

      // 2. Priority Filter
      if (state.filterPriority !== 'all' && task.priority !== state.filterPriority) return false;

      // 3. Search Title Filter
      if (query && !task.title.toLowerCase().includes(query)) return false;

      return true;
    });
  }

  // --- Statistics Computation ---
  function updateStatistics() {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Stat cards values
    DOM.statTotal.textContent = total;
    DOM.statPending.textContent = pending;
    DOM.statCompleted.textContent = completed;
    DOM.statPercentage.textContent = `${percentage}%`;

    // Progress bar
    DOM.progressBarFill.style.width = `${percentage}%`;
    DOM.progressContainer.setAttribute('aria-valuenow', percentage);
    DOM.statProgressText.textContent = total > 0 ? `${completed} of ${total} tasks completed` : '0 of 0 completed';

    // Status Tab Badges
    DOM.badgeAll.textContent = total;
    DOM.badgeActive.textContent = pending;
    DOM.badgeCompleted.textContent = completed;

    // Show/hide Clear Completed button
    DOM.clearCompletedBtn.hidden = completed === 0;
  }

  // --- Relative Date Formatter ---
  function formatRelativeTime(timestamp) {
    if (!timestamp) return '';
    const diffSeconds = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  // --- Rendering UI ---
  function renderApp() {
    updateStatistics();
    renderTasks();
    updateFilterIndicator();
  }

  function updateFilterIndicator() {
    const query = state.searchQuery.trim();
    const parts = [];

    if (state.filterStatus === 'active') parts.push('Active');
    else if (state.filterStatus === 'completed') parts.push('Completed');
    else parts.push('All');

    if (state.filterPriority !== 'all') {
      parts.push(`${state.filterPriority.toUpperCase()} Priority`);
    }

    let text = `Showing ${parts.join(' • ')} tasks`;
    if (query) {
      text += ` matching "${query}"`;
    }
    DOM.filterIndicatorText.textContent = text;
  }

  function renderTasks() {
    const filtered = getFilteredTasks();
    DOM.taskList.innerHTML = '';

    if (filtered.length === 0) {
      DOM.emptyState.hidden = false;
      DOM.taskList.hidden = true;

      const hasTasks = state.tasks.length > 0;
      if (!hasTasks) {
        DOM.emptyIcon.innerHTML = ICONS.emptyInbox;
        DOM.emptyTitle.textContent = 'No tasks yet';
        DOM.emptyDesc.textContent = 'Your FocusList is clear. Enter a task title above to stay focused and organized!';
        DOM.resetFiltersBtn.hidden = true;
      } else {
        DOM.emptyIcon.innerHTML = ICONS.emptySearch;
        DOM.emptyTitle.textContent = 'No matching tasks';
        DOM.emptyDesc.textContent = 'No tasks found matching your current search query or active filter criteria.';
        DOM.resetFiltersBtn.hidden = false;
      }
      return;
    }

    DOM.emptyState.hidden = true;
    DOM.taskList.hidden = false;

    filtered.forEach(task => {
      const isEditing = state.editingTaskId === task.id;
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.setAttribute('data-id', task.id);

      if (isEditing) {
        // --- Inline Edit Mode ---
        li.innerHTML = `
          <form class="task-edit-form" data-id="${task.id}">
            <div class="edit-input-row">
              <input 
                type="text" 
                class="task-edit-input" 
                data-id="${task.id}" 
                value="${escapeHtml(task.title)}" 
                maxlength="200" 
                required
                aria-label="Edit task title"
              >
            </div>
            <div class="edit-controls-row">
              <select class="edit-priority-select" data-id="${task.id}" aria-label="Select Priority">
                <option value="high" ${task.priority === 'high' ? 'selected' : ''}>🔴 High</option>
                <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>🟡 Medium</option>
                <option value="low" ${task.priority === 'low' ? 'selected' : ''}>🟢 Low</option>
              </select>
              <div class="edit-buttons">
                <button type="button" class="btn btn-secondary btn-sm btn-cancel-edit" data-id="${task.id}" title="Cancel (Esc)">
                  ${ICONS.cancel} Cancel
                </button>
                <button type="submit" class="btn btn-primary btn-sm btn-save-edit" data-id="${task.id}" title="Save (Enter)">
                  ${ICONS.save} Save
                </button>
              </div>
            </div>
          </form>
        `;
      } else {
        // --- Normal View Mode ---
        const priorityLabels = { high: 'High', medium: 'Medium', low: 'Low' };
        const priorityLabel = priorityLabels[task.priority] || 'Medium';

        li.innerHTML = `
          <div class="task-left">
            <label class="task-checkbox-container" title="${task.completed ? 'Mark as pending' : 'Mark as completed'}">
              <input 
                type="checkbox" 
                class="task-checkbox-input" 
                data-action="toggle" 
                data-id="${task.id}" 
                ${task.completed ? 'checked' : ''}
                aria-label="Mark task as ${task.completed ? 'pending' : 'completed'}"
              >
              <span class="custom-checkbox" aria-hidden="true">${ICONS.check}</span>
            </label>
            <div class="task-content">
              <span class="task-title" data-action="edit-dbl" data-id="${task.id}" title="Double-click to edit">${escapeHtml(task.title)}</span>
              <span class="task-timestamp">${task.completed ? `Completed ${formatRelativeTime(task.completedAt)}` : `Added ${formatRelativeTime(task.createdAt)}`}</span>
            </div>
          </div>
          <div class="task-right">
            <span class="priority-tag priority-${task.priority}" title="Priority: ${priorityLabel}">
              <span class="dot"></span>
              ${priorityLabel}
            </span>
            <div class="task-actions">
              <button class="action-btn btn-edit" data-action="edit" data-id="${task.id}" title="Edit task" aria-label="Edit task">
                ${ICONS.edit}
              </button>
              <button class="action-btn btn-delete" data-action="delete" data-id="${task.id}" title="Delete task" aria-label="Delete task">
                ${ICONS.trash}
              </button>
            </div>
          </div>
        `;
      }

      DOM.taskList.appendChild(li);
    });
  }

  // --- Helper: HTML Escape ---
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Event Setup ---
  function setupEventListeners() {
    // 1. Theme Toggle
    DOM.themeToggleBtn.addEventListener('click', toggleTheme);

    // 2. Add Task Form
    DOM.taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const priorityRadio = DOM.taskForm.querySelector('input[name="taskPriority"]:checked');
      const priority = priorityRadio ? priorityRadio.value : 'medium';
      const success = addTask(DOM.taskInput.value, priority);
      if (success) {
        DOM.taskInput.value = '';
        DOM.charCount.textContent = '';
        DOM.taskInput.focus();
      }
    });

    // Character Counter for Task Input
    DOM.taskInput.addEventListener('input', () => {
      const len = DOM.taskInput.value.length;
      if (len > 150) {
        DOM.charCount.textContent = `${len}/200`;
        DOM.charCount.className = len >= 190 ? 'char-count warn' : 'char-count';
      } else {
        DOM.charCount.textContent = '';
      }
    });

    // 3. Search Input
    DOM.searchInput.addEventListener('input', () => {
      state.searchQuery = DOM.searchInput.value;
      DOM.clearSearchBtn.hidden = !state.searchQuery;
      renderApp();
    });

    DOM.clearSearchBtn.addEventListener('click', () => {
      state.searchQuery = '';
      DOM.searchInput.value = '';
      DOM.clearSearchBtn.hidden = true;
      DOM.searchInput.focus();
      renderApp();
    });

    // 4. Status Filter Tabs
    DOM.statusTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        DOM.statusTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        state.filterStatus = tab.getAttribute('data-status');
        renderApp();
      });
    });

    // 5. Priority Filter Dropdown
    DOM.priorityFilter.addEventListener('change', () => {
      state.filterPriority = DOM.priorityFilter.value;
      renderApp();
    });

    // 6. Reset Filters Button
    DOM.resetFiltersBtn.addEventListener('click', () => {
      state.searchQuery = '';
      DOM.searchInput.value = '';
      DOM.clearSearchBtn.hidden = true;
      state.filterStatus = 'all';
      state.filterPriority = 'all';
      DOM.priorityFilter.value = 'all';
      DOM.statusTabs.forEach(t => {
        const isAll = t.getAttribute('data-status') === 'all';
        t.classList.toggle('active', isAll);
        t.setAttribute('aria-selected', isAll ? 'true' : 'false');
      });
      renderApp();
    });

    // 7. Clear Completed Button
    DOM.clearCompletedBtn.addEventListener('click', clearCompletedTasks);

    // 8. Event Delegation on Task List
    DOM.taskList.addEventListener('click', (e) => {
      const toggleInput = e.target.closest('input[data-action="toggle"]');
      if (toggleInput) {
        const id = toggleInput.getAttribute('data-id');
        toggleTask(id);
        return;
      }

      const editBtn = e.target.closest('button[data-action="edit"]');
      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        startEditingTask(id);
        return;
      }

      const deleteBtn = e.target.closest('button[data-action="delete"]');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        deleteTask(id);
        return;
      }

      const cancelEditBtn = e.target.closest('.btn-cancel-edit');
      if (cancelEditBtn) {
        cancelEditingTask();
        return;
      }
    });

    // Double-click to edit task title
    DOM.taskList.addEventListener('dblclick', (e) => {
      const titleSpan = e.target.closest('[data-action="edit-dbl"]');
      if (titleSpan) {
        const id = titleSpan.getAttribute('data-id');
        startEditingTask(id);
      }
    });

    // Submit inline edit form
    DOM.taskList.addEventListener('submit', (e) => {
      const form = e.target.closest('.task-edit-form');
      if (form) {
        e.preventDefault();
        const id = form.getAttribute('data-id');
        const input = form.querySelector('.task-edit-input');
        const select = form.querySelector('.edit-priority-select');
        saveEditedTask(id, input.value, select.value);
      }
    });

    // Keyboard support inside inline editing (Esc cancels)
    DOM.taskList.addEventListener('keydown', (e) => {
      if (e.target.classList.contains('task-edit-input') && e.key === 'Escape') {
        cancelEditingTask();
      }
    });

    // 9. Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

      // Focus Search: '/' or 'Cmd+K' / 'Ctrl+K'
      if ((e.key === '/' && !isInputActive) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        DOM.searchInput.focus();
        DOM.searchInput.select();
        return;
      }

      // Quick focus new task input: 'N' (when not in an input)
      if (e.key.toLowerCase() === 'n' && !isInputActive) {
        e.preventDefault();
        DOM.taskInput.focus();
        DOM.taskInput.select();
        return;
      }

      // Toggle Theme: 'T' (when not in an input)
      if (e.key.toLowerCase() === 't' && !isInputActive) {
        e.preventDefault();
        toggleTheme();
        return;
      }

      // Open Shortcuts dialog: '?'
      if (e.key === '?' && !isInputActive) {
        e.preventDefault();
        DOM.shortcutsDialog.showModal();
        return;
      }

      // Close dialogs on Esc
      if (e.key === 'Escape') {
        if (DOM.shortcutsDialog.open) DOM.shortcutsDialog.close();
        if (DOM.backupDialog.open) DOM.backupDialog.close();
      }
    });

    // 10. Dialog Controls: Shortcuts
    DOM.shortcutsBtn.addEventListener('click', () => DOM.shortcutsDialog.showModal());
    DOM.closeShortcutsBtn.addEventListener('click', () => DOM.shortcutsDialog.close());
    DOM.shortcutsDialog.addEventListener('click', (e) => {
      if (e.target === DOM.shortcutsDialog) DOM.shortcutsDialog.close();
    });

    // 11. Dialog Controls: Backup & Restore
    DOM.exportImportBtn.addEventListener('click', () => DOM.backupDialog.showModal());
    DOM.closeBackupBtn.addEventListener('click', () => DOM.backupDialog.close());
    DOM.backupDialog.addEventListener('click', (e) => {
      if (e.target === DOM.backupDialog) DOM.backupDialog.close();
    });

    // Export Tasks as JSON
    DOM.doExportBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.tasks, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `focuslist_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Tasks exported to JSON file');
    });

    // Import Tasks from JSON
    DOM.doImportBtn.addEventListener('click', () => DOM.importFileInput.click());
    DOM.importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            // Validate imported items
            const valid = imported.every(item => item && typeof item.title === 'string' && typeof item.id === 'string');
            if (valid) {
              state.tasks = imported;
              saveTasks(state.tasks);
              renderApp();
              DOM.backupDialog.close();
              showToast(`Imported ${imported.length} tasks successfully!`);
            } else {
              showToast('Invalid JSON task schema', 'error');
            }
          } else {
            showToast('JSON file must contain an array of tasks', 'error');
          }
        } catch (err) {
          showToast('Failed to parse JSON file', 'error');
        }
        DOM.importFileInput.value = '';
      };
      reader.readAsText(file);
    });

    // Reload Starter Tasks
    DOM.reloadSamplesBtn.addEventListener('click', () => {
      state.tasks = [...INITIAL_SAMPLE_TASKS];
      saveTasks(state.tasks);
      renderApp();
      DOM.backupDialog.close();
      showToast('Starter tasks reloaded');
    });
  }

  // --- Application Initialization ---
  function init() {
    initTheme();
    state.tasks = loadTasks();
    setupEventListeners();
    renderApp();
  }

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
