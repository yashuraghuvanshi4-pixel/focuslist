/**
 * FocusList — Modern Frontend-Only Task & Focus Manager (v2.0 Enhanced)
 * 
 * Features:
 * - Unidirectional Reactive Store Pattern
 * - Universal `data-testid` Automated Test Selectors
 * - HTML5 Drag-and-Drop Reordering
 * - Multi-Axis Filter & Sort Engine
 * - Integrated Pomodoro Focus Timer with Web Audio API Chimes
 * - Canvas Confetti Celebration Engine
 * - CSV and JSON Data Export & Import
 * - Full WCAG 2.1 AA Accessibility & LocalStorage Persistence
 * 
 * @author FocusList Team
 * @license MIT
 */

(() => {
  'use strict';

  // ==========================================================================
  // 1. Constants & Configuration
  // ==========================================================================
  const STORAGE_KEY = 'focuslist_tasks_v1';
  const THEME_KEY = 'focuslist_theme';
  const SOUND_KEY = 'focuslist_sound_enabled';
  const STREAK_KEY = 'focuslist_streak_data';

  /**
   * Curated starter tasks for initial load
   */
  const INITIAL_SAMPLE_TASKS = [
    {
      id: 'task-sample-1',
      title: 'Finalize quarterly product roadmap & deliverable timelines',
      priority: 'high',
      tag: 'Work',
      dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), // Tomorrow
      completed: false,
      createdAt: Date.now() - 3600000 * 4,
      completedAt: null
    },
    {
      id: 'task-sample-2',
      title: 'Review team pull requests and optimize bundle size',
      priority: 'medium',
      tag: 'Work',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      completed: false,
      createdAt: Date.now() - 3600000 * 2,
      completedAt: null
    },
    {
      id: 'task-sample-3',
      title: 'Morning 20-minute mindfulness & stretching routine',
      priority: 'low',
      tag: 'Personal',
      dueDate: new Date().toISOString().slice(0, 10), // Today
      completed: true,
      createdAt: Date.now() - 3600000 * 6,
      completedAt: Date.now() - 3600000 * 5
    },
    {
      id: 'task-sample-4',
      title: 'Explore modern CSS container queries and web components',
      priority: 'medium',
      tag: 'Learning',
      dueDate: '',
      completed: false,
      createdAt: Date.now() - 3600000 * 1,
      completedAt: null
    }
  ];

  /**
   * Inline SVG Icons Map (Zero Network Dependencies)
   */
  const ICONS = {
    check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    edit: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
    trash: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
    focus: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
    drag: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>`,
    save: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    cancel: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    emptyInbox: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>`,
    emptySearch: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>`
  };

  // ==========================================================================
  // 2. Application State Store
  // ==========================================================================
  const state = {
    tasks: [],
    filterStatus: 'all',     // 'all' | 'active' | 'completed'
    filterPriority: 'all',   // 'all' | 'high' | 'medium' | 'low'
    sortMode: 'custom',      // 'custom' | 'priority-desc' | 'priority-asc' | 'date-desc' | 'date-asc' | 'due-date' | 'alphabetical'
    searchQuery: '',
    editingTaskId: null,
    activeFocusTask: null,
    soundEnabled: true,
    lastDeletedTask: null,
    lastDeletedIndex: -1,
    toastTimeout: null,

    // Timer State
    timer: {
      mode: 'focus', // 'focus' (25m) | 'shortBreak' (5m) | 'longBreak' (15m)
      durationSeconds: 25 * 60,
      remainingSeconds: 25 * 60,
      isRunning: false,
      intervalId: null
    },

    // Drag-and-drop state
    draggedTaskId: null
  };

  // ==========================================================================
  // 3. DOM Elements Cache
  // ==========================================================================
  const DOM = {
    html: document.documentElement,
    soundToggleBtn: document.getElementById('btn-sound-toggle'),
    soundIconOn: document.querySelector('.sound-icon-on'),
    soundIconOff: document.querySelector('.sound-icon-off'),
    themeToggleBtn: document.getElementById('btn-theme-toggle'),
    shortcutsBtn: document.getElementById('btn-shortcuts'),
    shortcutsDialog: document.getElementById('shortcuts-dialog'),
    closeShortcutsBtn: document.getElementById('btn-close-shortcuts'),
    exportImportBtn: document.getElementById('btn-export-import'),
    backupDialog: document.getElementById('backup-dialog'),
    closeBackupBtn: document.getElementById('btn-close-backup'),
    doExportBtn: document.getElementById('btn-do-export'),
    exportCsvBtn: document.getElementById('btn-export-csv'),
    doImportBtn: document.getElementById('btn-do-import'),
    importFileInput: document.getElementById('import-file-input'),
    reloadSamplesBtn: document.getElementById('btn-reload-samples'),

    // Timer Elements
    timerActiveTaskLabel: document.getElementById('timer-active-task-label'),
    timerModeButtons: document.querySelectorAll('.timer-mode-btn'),
    timerDisplay: document.getElementById('timer-display'),
    timerProgressFill: document.getElementById('timer-progress-fill'),
    timerToggleBtn: document.getElementById('btn-timer-toggle'),
    timerResetBtn: document.getElementById('btn-timer-reset'),
    timerBtnText: document.getElementById('timer-btn-text'),
    iconPlay: document.querySelector('.icon-play'),
    iconPause: document.querySelector('.icon-pause'),

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
    taskTagSelect: document.getElementById('task-tag-select'),
    taskDueDate: document.getElementById('task-due-date'),

    // Toolbar & Search
    searchInput: document.getElementById('search-input'),
    clearSearchBtn: document.getElementById('btn-clear-search'),
    statusTabs: document.querySelectorAll('.tab-btn'),
    badgeAll: document.getElementById('badge-count-all'),
    badgeActive: document.getElementById('badge-count-active'),
    badgeCompleted: document.getElementById('badge-count-completed'),
    priorityFilter: document.getElementById('priority-filter'),
    sortSelect: document.getElementById('sort-select'),

    // List & Meta Bar
    listMetaBar: document.getElementById('list-meta-bar'),
    filterIndicatorText: document.getElementById('filter-indicator-text'),
    markAllBtn: document.getElementById('btn-mark-all'),
    clearCompletedBtn: document.getElementById('btn-clear-completed'),
    taskList: document.getElementById('task-list'),
    emptyState: document.getElementById('empty-state'),
    emptyIcon: document.getElementById('empty-icon'),
    emptyTitle: document.getElementById('empty-title'),
    emptyDesc: document.getElementById('empty-desc'),
    resetFiltersBtn: document.getElementById('btn-reset-filters'),

    // Footer & Delighters
    productivityStreak: document.getElementById('productivity-streak'),
    toastContainer: document.getElementById('toast-container'),
    confettiCanvas: document.getElementById('confetti-canvas')
  };

  // ==========================================================================
  // 4. Web Audio Synthesizer (Zero External Dependencies)
  // ==========================================================================
  class AudioSynth {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();
      }
    }

    playCompletionChime() {
      if (!state.soundEnabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }

        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(783.99, now + 0.08); // G5
        osc2.frequency.exponentialRampToValueAtTime(1046.50, now + 0.25); // C6

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now + 0.08);
        osc1.stop(now + 0.3);
        osc2.stop(now + 0.4);
      } catch (e) {
        // Audio error silent fallback
      }
    }

    playTimerFinishedChime() {
      if (!state.soundEnabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }

        const now = this.ctx.currentTime;
        const notes = [587.33, 739.99, 880.00, 1174.66]; // D5, F#5, A5, D6
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);
          gain.gain.setValueAtTime(0.2, now + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.35);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.35);
        });
      } catch (e) {}
    }
  }

  const audio = new AudioSynth();

  // ==========================================================================
  // 5. Canvas Confetti Celebration Particle Engine
  // ==========================================================================
  class ConfettiEngine {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas ? canvas.getContext('2d') : null;
      this.particles = [];
      this.animationId = null;
      this.colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    fire() {
      if (!this.ctx) return;
      this.resize();
      this.particles = [];
      const particleCount = 100;

      for (let i = 0; i < particleCount; i++) {
        this.particles.push({
          x: this.canvas.width / 2 + (Math.random() - 0.5) * 200,
          y: this.canvas.height * 0.4 + (Math.random() - 0.5) * 100,
          vx: (Math.random() - 0.5) * 12,
          vy: Math.random() * -10 - 4,
          size: Math.random() * 8 + 4,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          opacity: 1
        });
      }

      if (!this.animationId) {
        this.animate();
      }
    }

    animate() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // Gravity
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.008;

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = Math.max(p.opacity, 0);
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        this.ctx.restore();
      });

      this.particles = this.particles.filter(p => p.opacity > 0 && p.y < this.canvas.height);

      if (this.particles.length > 0) {
        this.animationId = requestAnimationFrame(() => this.animate());
      } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.animationId = null;
      }
    }
  }

  const confetti = new ConfettiEngine(DOM.confettiCanvas);

  // ==========================================================================
  // 6. Storage & Settings Layer
  // ==========================================================================
  function loadTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          // Schema Migration / Backwards Compatibility
          return parsed.map(task => ({
            tag: 'General',
            dueDate: '',
            ...task
          }));
        }
      }
    } catch (err) {
      console.warn('Failed to read tasks from localStorage:', err);
    }
    saveTasks(INITIAL_SAMPLE_TASKS);
    return [...INITIAL_SAMPLE_TASKS];
  }

  function saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('Failed to write tasks to localStorage:', err);
      showToast('Storage quota exceeded or disabled', 'error');
    }
  }

  function initSettings() {
    // 1. Theme
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      DOM.html.setAttribute('data-theme', savedTheme);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      DOM.html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    }

    // 2. Sound Effects
    const soundPref = localStorage.getItem(SOUND_KEY);
    state.soundEnabled = soundPref === null ? true : soundPref === 'true';
    updateSoundButtonUI();
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

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    try {
      localStorage.setItem(SOUND_KEY, state.soundEnabled.toString());
    } catch (e) {}
    updateSoundButtonUI();
    showToast(state.soundEnabled ? 'Audio chimes enabled 🔔' : 'Audio muted 🔇');
  }

  function updateSoundButtonUI() {
    if (state.soundEnabled) {
      DOM.soundIconOn.style.display = 'block';
      DOM.soundIconOff.style.display = 'none';
      DOM.soundToggleBtn.setAttribute('title', 'Mute Sound Effects (M)');
    } else {
      DOM.soundIconOn.style.display = 'none';
      DOM.soundIconOff.style.display = 'block';
      DOM.soundToggleBtn.setAttribute('title', 'Enable Sound Effects (M)');
    }
  }

  // ==========================================================================
  // 7. Toast Notifications
  // ==========================================================================
  function showToast(message, actionText = null, onAction = null, duration = 4000) {
    if (state.toastTimeout) {
      clearTimeout(state.toastTimeout);
    }
    DOM.toastContainer.innerHTML = '';

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('data-testid', 'toast-message');

    const textSpan = document.createElement('span');
    textSpan.textContent = message;
    toast.appendChild(textSpan);

    if (actionText && typeof onAction === 'function') {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'toast-btn';
      actionBtn.textContent = actionText;
      actionBtn.setAttribute('data-testid', 'toast-action-btn');
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

  // ==========================================================================
  // 8. Focus Timer / Pomodoro Engine (Innovation Feature)
  // ==========================================================================
  function setTimerMode(mode, minutes) {
    if (state.timer.intervalId) {
      clearInterval(state.timer.intervalId);
      state.timer.intervalId = null;
    }
    state.timer.mode = mode;
    state.timer.durationSeconds = minutes * 60;
    state.timer.remainingSeconds = minutes * 60;
    state.timer.isRunning = false;

    DOM.timerModeButtons.forEach(btn => {
      const active = btn.getAttribute('data-mode') === mode;
      btn.classList.toggle('active', active);
    });

    updateTimerDisplay();
  }

  function toggleTimer() {
    if (state.timer.isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function startTimer() {
    state.timer.isRunning = true;
    DOM.iconPlay.style.display = 'none';
    DOM.iconPause.style.display = 'block';
    DOM.timerBtnText.textContent = 'Pause';

    state.timer.intervalId = setInterval(() => {
      if (state.timer.remainingSeconds > 0) {
        state.timer.remainingSeconds--;
        updateTimerDisplay();
      } else {
        finishTimer();
      }
    }, 1000);
  }

  function pauseTimer() {
    state.timer.isRunning = false;
    clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;
    DOM.iconPlay.style.display = 'block';
    DOM.iconPause.style.display = 'none';
    DOM.timerBtnText.textContent = 'Resume';
    document.title = 'FocusList — Minimalist & Powerful Task Management';
  }

  function resetTimer() {
    pauseTimer();
    state.timer.remainingSeconds = state.timer.durationSeconds;
    DOM.timerBtnText.textContent = 'Start Focus';
    updateTimerDisplay();
  }

  function finishTimer() {
    pauseTimer();
    audio.playTimerFinishedChime();
    confetti.fire();

    const modeLabels = { focus: 'Focus session completed!', shortBreak: 'Short break over!', longBreak: 'Long break finished!' };
    showToast(`⏱️ ${modeLabels[state.timer.mode] || 'Timer finished!'} Great work!`);
    resetTimer();
  }

  function updateTimerDisplay() {
    const mins = Math.floor(state.timer.remainingSeconds / 60);
    const secs = state.timer.remainingSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    DOM.timerDisplay.textContent = formatted;

    const progress = ((state.timer.durationSeconds - state.timer.remainingSeconds) / state.timer.durationSeconds) * 100;
    DOM.timerProgressFill.style.width = `${progress}%`;

    if (state.timer.isRunning) {
      document.title = `(${formatted}) FocusList`;
    }
  }

  function setFocusTask(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;
    state.activeFocusTask = task;
    DOM.timerActiveTaskLabel.textContent = `🎯 Focusing on: "${task.title}"`;
    showToast(`Focus target set: "${task.title.slice(0, 30)}..."`);
    if (!state.timer.isRunning) {
      startTimer();
    }
  }

  // ==========================================================================
  // 9. Task CRUD Operations
  // ==========================================================================
  function addTask(title, priority, tag = 'General', dueDate = '') {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      showToast('Please enter a task title');
      return false;
    }

    const newTask = {
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      title: trimmedTitle,
      priority: ['high', 'medium', 'low'].includes(priority) ? priority : 'medium',
      tag: tag || 'General',
      dueDate: dueDate || '',
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
      audio.playCompletionChime();
      showToast('Task marked as completed! 🎉');

      // Check if all active tasks are completed for a confetti celebration!
      const pendingCount = state.tasks.filter(t => !t.completed).length;
      if (pendingCount === 0 && state.tasks.length > 0) {
        confetti.fire();
        showToast('🏆 All tasks completed! Amazing work!');
      }
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

  function saveEditedTask(id, newTitle, newPriority, newTag = 'General') {
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
    task.tag = newTag;

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
    if (state.activeFocusTask && state.activeFocusTask.id === id) {
      state.activeFocusTask = null;
      DOM.timerActiveTaskLabel.textContent = 'Ready to focus? Select a task below';
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

  function markAllTasksCompleted() {
    const pendingTasks = state.tasks.filter(t => !t.completed);
    if (pendingTasks.length === 0) return;

    pendingTasks.forEach(t => {
      t.completed = true;
      t.completedAt = Date.now();
    });

    saveTasks(state.tasks);
    renderApp();
    audio.playCompletionChime();
    confetti.fire();
    showToast('All tasks marked as completed! 🎉');
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

  // ==========================================================================
  // 10. Filtering & Sorting Engine
  // ==========================================================================
  function getFilteredAndSortedTasks() {
    const query = state.searchQuery.trim().toLowerCase();

    // 1. Filtering
    let result = state.tasks.filter(task => {
      // Status Filter
      if (state.filterStatus === 'active' && task.completed) return false;
      if (state.filterStatus === 'completed' && !task.completed) return false;

      // Priority Filter
      if (state.filterPriority !== 'all' && task.priority !== state.filterPriority) return false;

      // Title Search
      if (query && !task.title.toLowerCase().includes(query)) return false;

      return true;
    });

    // 2. Sorting
    const priorityWeight = { high: 3, medium: 2, low: 1 };
    switch (state.sortMode) {
      case 'priority-desc':
        result.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
        break;
      case 'priority-asc':
        result.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);
        break;
      case 'date-desc':
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'date-asc':
        result.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'due-date':
        result.sort((a, b) => {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        });
        break;
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'custom':
      default:
        // Preserves custom drag-and-drop order
        break;
    }

    return result;
  }

  // ==========================================================================
  // 11. Statistics & Streak Calculation
  // ==========================================================================
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

    // Show/hide Clear Completed and Mark All buttons
    DOM.clearCompletedBtn.hidden = completed === 0;
    DOM.markAllBtn.hidden = pending === 0;

    // Productivity Streak Badge
    updateStreak(completed);
  }

  function updateStreak(completedCount) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      let streakInfo = JSON.parse(localStorage.getItem(STREAK_KEY) || '{}');
      if (!streakInfo.date) {
        streakInfo = { date: today, count: completedCount };
      } else if (streakInfo.date !== today) {
        streakInfo.date = today;
        streakInfo.count = completedCount;
      } else {
        streakInfo.count = Math.max(streakInfo.count, completedCount);
      }
      localStorage.setItem(STREAK_KEY, JSON.stringify(streakInfo));
      DOM.productivityStreak.textContent = `🔥 ${streakInfo.count} completed today`;
    } catch (e) {
      DOM.productivityStreak.textContent = `🔥 ${completedCount} completed today`;
    }
  }

  // ==========================================================================
  // 12. Date Helpers
  // ==========================================================================
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

  function getDueDateBadge(dueDateStr) {
    if (!dueDateStr) return '';
    const today = new Date().toISOString().slice(0, 10);
    let label = dueDateStr;
    let className = 'task-due-badge';

    if (dueDateStr < today) {
      label = `⚠️ Overdue (${dueDateStr})`;
      className += ' overdue';
    } else if (dueDateStr === today) {
      label = `📅 Due Today`;
      className += ' today';
    } else {
      label = `📅 ${dueDateStr}`;
    }

    return `<span class="${className}" data-testid="task-due-badge">${label}</span>`;
  }

  // ==========================================================================
  // 13. HTML Escaping Utility (XSS Prevention)
  // ==========================================================================
  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ==========================================================================
  // 14. UI Rendering Engine
  // ==========================================================================
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
    const tasksToDisplay = getFilteredAndSortedTasks();
    DOM.taskList.innerHTML = '';

    if (tasksToDisplay.length === 0) {
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

    tasksToDisplay.forEach((task, index) => {
      const isEditing = state.editingTaskId === task.id;
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.setAttribute('data-id', task.id);
      li.setAttribute('data-testid', 'task-item');
      li.setAttribute('draggable', isEditing ? 'false' : 'true');

      if (isEditing) {
        // --- Inline Edit Mode ---
        li.innerHTML = `
          <form class="task-edit-form" data-id="${task.id}" data-testid="task-edit-form">
            <div class="edit-input-row">
              <input 
                type="text" 
                class="task-edit-input" 
                data-id="${task.id}" 
                value="${escapeHtml(task.title)}" 
                maxlength="200" 
                required
                aria-label="Edit task title"
                data-testid="task-edit-input"
              >
            </div>
            <div class="edit-controls-row">
              <div class="edit-selects">
                <select class="edit-priority-select" data-id="${task.id}" aria-label="Select Priority" data-testid="task-edit-priority">
                  <option value="high" ${task.priority === 'high' ? 'selected' : ''}>🔴 High</option>
                  <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>🟡 Medium</option>
                  <option value="low" ${task.priority === 'low' ? 'selected' : ''}>🟢 Low</option>
                </select>
                <select class="edit-tag-select" data-id="${task.id}" aria-label="Select Tag" data-testid="task-edit-tag">
                  <option value="General" ${task.tag === 'General' ? 'selected' : ''}>🏷️ General</option>
                  <option value="Work" ${task.tag === 'Work' ? 'selected' : ''}>💼 Work</option>
                  <option value="Personal" ${task.tag === 'Personal' ? 'selected' : ''}>🏡 Personal</option>
                  <option value="Learning" ${task.tag === 'Learning' ? 'selected' : ''}>📚 Learning</option>
                  <option value="Urgent" ${task.tag === 'Urgent' ? 'selected' : ''}>🔥 Urgent</option>
                </select>
              </div>
              <div class="edit-buttons">
                <button type="button" class="btn btn-secondary btn-sm btn-cancel-edit" data-id="${task.id}" title="Cancel (Esc)" data-testid="task-cancel-btn">
                  ${ICONS.cancel} Cancel
                </button>
                <button type="submit" class="btn btn-primary btn-sm btn-save-edit" data-id="${task.id}" title="Save (Enter)" data-testid="task-save-btn">
                  ${ICONS.save} Save
                </button>
              </div>
            </div>
          </form>
        `;
      } else {
        // --- Standard View Mode ---
        const priorityLabels = { high: 'High', medium: 'Medium', low: 'Low' };
        const priorityLabel = priorityLabels[task.priority] || 'Medium';

        li.innerHTML = `
          <div class="task-left">
            <span class="drag-handle" title="Drag to reorder" aria-label="Drag to reorder" data-testid="drag-handle">
              ${ICONS.drag}
            </span>
            <label class="task-checkbox-container" title="${task.completed ? 'Mark as pending' : 'Mark as completed'}">
              <input 
                type="checkbox" 
                class="task-checkbox-input" 
                data-action="toggle" 
                data-id="${task.id}" 
                ${task.completed ? 'checked' : ''}
                aria-label="Mark task as ${task.completed ? 'pending' : 'completed'}"
                data-testid="task-checkbox"
              >
              <span class="custom-checkbox" aria-hidden="true">${ICONS.check}</span>
            </label>
            <div class="task-content">
              <span class="task-title" data-action="edit-dbl" data-id="${task.id}" title="Double-click to edit" data-testid="task-title">${escapeHtml(task.title)}</span>
              <div class="task-details-row">
                <span class="task-tag-badge" data-testid="task-tag-badge">${escapeHtml(task.tag || 'General')}</span>
                ${getDueDateBadge(task.dueDate)}
                <span class="task-timestamp">${task.completed ? `Completed ${formatRelativeTime(task.completedAt)}` : `Added ${formatRelativeTime(task.createdAt)}`}</span>
              </div>
            </div>
          </div>
          <div class="task-right">
            <span class="priority-tag priority-${task.priority}" title="Priority: ${priorityLabel}" data-testid="task-priority-badge">
              <span class="dot"></span>
              ${priorityLabel}
            </span>
            <div class="task-actions">
              <button class="action-btn btn-focus" data-action="focus" data-id="${task.id}" title="Focus on this task with timer" aria-label="Focus on task" data-testid="task-focus-btn">
                ${ICONS.focus}
              </button>
              <button class="action-btn btn-edit" data-action="edit" data-id="${task.id}" title="Edit task" aria-label="Edit task" data-testid="task-edit-btn">
                ${ICONS.edit}
              </button>
              <button class="action-btn btn-delete" data-action="delete" data-id="${task.id}" title="Delete task" aria-label="Delete task" data-testid="task-delete-btn">
                ${ICONS.trash}
              </button>
            </div>
          </div>
        `;
      }

      // Drag and Drop Event Listeners
      li.addEventListener('dragstart', (e) => {
        state.draggedTaskId = task.id;
        li.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', task.id);
      });

      li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
        document.querySelectorAll('.task-item').forEach(el => el.classList.remove('drag-over'));
        state.draggedTaskId = null;
      });

      li.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        li.classList.add('drag-over');
      });

      li.addEventListener('dragleave', () => {
        li.classList.remove('drag-over');
      });

      li.addEventListener('drop', (e) => {
        e.preventDefault();
        li.classList.remove('drag-over');
        const fromId = state.draggedTaskId;
        const toId = task.id;
        if (fromId && toId && fromId !== toId) {
          reorderTasks(fromId, toId);
        }
      });

      DOM.taskList.appendChild(li);
    });
  }

  function reorderTasks(fromId, toId) {
    const fromIndex = state.tasks.findIndex(t => t.id === fromId);
    const toIndex = state.tasks.findIndex(t => t.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = state.tasks.splice(fromIndex, 1);
    state.tasks.splice(toIndex, 0, moved);

    // Switch sort mode to custom so manual reordering is displayed
    state.sortMode = 'custom';
    DOM.sortSelect.value = 'custom';

    saveTasks(state.tasks);
    renderApp();
    showToast('Tasks reordered');
  }

  // ==========================================================================
  // 15. CSV & JSON Export / Import
  // ==========================================================================
  function exportTasksAsJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `focuslist_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Tasks exported to JSON');
  }

  function exportTasksAsCsv() {
    const headers = ['ID', 'Title', 'Priority', 'Tag', 'Due Date', 'Completed', 'Created At'];
    const rows = state.tasks.map(t => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      t.priority,
      t.tag || 'General',
      t.dueDate || '',
      t.completed ? 'Yes' : 'No',
      new Date(t.createdAt).toISOString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent([headers.join(','), ...rows.map(e => e.join(','))].join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", csvContent);
    downloadAnchor.setAttribute("download", `focuslist_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Tasks exported to CSV');
  }

  // ==========================================================================
  // 16. Event Handlers Setup
  // ==========================================================================
  function setupEventListeners() {
    // 1. Theme & Sound Toggles
    DOM.themeToggleBtn.addEventListener('click', toggleTheme);
    DOM.soundToggleBtn.addEventListener('click', toggleSound);

    // 2. Timer Mode & Controls
    DOM.timerModeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-mode');
        const minutes = parseInt(btn.getAttribute('data-minutes'), 10) || 25;
        setTimerMode(mode, minutes);
      });
    });
    DOM.timerToggleBtn.addEventListener('click', toggleTimer);
    DOM.timerResetBtn.addEventListener('click', resetTimer);

    // 3. Add Task Form
    DOM.taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const priorityRadio = DOM.taskForm.querySelector('input[name="taskPriority"]:checked');
      const priority = priorityRadio ? priorityRadio.value : 'medium';
      const tag = DOM.taskTagSelect.value;
      const dueDate = DOM.taskDueDate.value;

      const success = addTask(DOM.taskInput.value, priority, tag, dueDate);
      if (success) {
        DOM.taskInput.value = '';
        DOM.charCount.textContent = '';
        DOM.taskDueDate.value = '';
        DOM.taskInput.focus();
      }
    });

    // Character Counter
    DOM.taskInput.addEventListener('input', () => {
      const len = DOM.taskInput.value.length;
      if (len > 150) {
        DOM.charCount.textContent = `${len}/200`;
        DOM.charCount.className = len >= 190 ? 'char-count warn' : 'char-count';
      } else {
        DOM.charCount.textContent = '';
      }
    });

    // 4. Search Input
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

    // 5. Status Filter Tabs
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

    // 6. Priority & Sort Selects
    DOM.priorityFilter.addEventListener('change', () => {
      state.filterPriority = DOM.priorityFilter.value;
      renderApp();
    });

    DOM.sortSelect.addEventListener('change', () => {
      state.sortMode = DOM.sortSelect.value;
      renderApp();
    });

    // 7. Bulk Actions
    DOM.markAllBtn.addEventListener('click', markAllTasksCompleted);
    DOM.clearCompletedBtn.addEventListener('click', clearCompletedTasks);

    // 8. Reset Filters Button
    DOM.resetFiltersBtn.addEventListener('click', () => {
      state.searchQuery = '';
      DOM.searchInput.value = '';
      DOM.clearSearchBtn.hidden = true;
      state.filterStatus = 'all';
      state.filterPriority = 'all';
      DOM.priorityFilter.value = 'all';
      state.sortMode = 'custom';
      DOM.sortSelect.value = 'custom';
      DOM.statusTabs.forEach(t => {
        const isAll = t.getAttribute('data-status') === 'all';
        t.classList.toggle('active', isAll);
        t.setAttribute('aria-selected', isAll ? 'true' : 'false');
      });
      renderApp();
    });

    // 9. Task List Delegated Events
    DOM.taskList.addEventListener('click', (e) => {
      // Toggle
      const toggleInput = e.target.closest('input[data-action="toggle"]');
      if (toggleInput) {
        const id = toggleInput.getAttribute('data-id');
        toggleTask(id);
        return;
      }

      // Focus
      const focusBtn = e.target.closest('button[data-action="focus"]');
      if (focusBtn) {
        const id = focusBtn.getAttribute('data-id');
        setFocusTask(id);
        return;
      }

      // Edit
      const editBtn = e.target.closest('button[data-action="edit"]');
      if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        startEditingTask(id);
        return;
      }

      // Delete
      const deleteBtn = e.target.closest('button[data-action="delete"]');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        deleteTask(id);
        return;
      }

      // Cancel Edit
      const cancelEditBtn = e.target.closest('.btn-cancel-edit');
      if (cancelEditBtn) {
        cancelEditingTask();
        return;
      }
    });

    // Double-click to edit
    DOM.taskList.addEventListener('dblclick', (e) => {
      const titleSpan = e.target.closest('[data-action="edit-dbl"]');
      if (titleSpan) {
        const id = titleSpan.getAttribute('data-id');
        startEditingTask(id);
      }
    });

    // Save Edit Form
    DOM.taskList.addEventListener('submit', (e) => {
      const form = e.target.closest('.task-edit-form');
      if (form) {
        e.preventDefault();
        const id = form.getAttribute('data-id');
        const input = form.querySelector('.task-edit-input');
        const prioritySelect = form.querySelector('.edit-priority-select');
        const tagSelect = form.querySelector('.edit-tag-select');
        saveEditedTask(id, input.value, prioritySelect.value, tagSelect ? tagSelect.value : 'General');
      }
    });

    // Esc to Cancel Edit
    DOM.taskList.addEventListener('keydown', (e) => {
      if (e.target.classList.contains('task-edit-input') && e.key === 'Escape') {
        cancelEditingTask();
      }
    });

    // 10. Global Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
      const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);

      // Focus Search: '/' or 'Cmd+K' / 'Ctrl+K'
      if ((e.key === '/' && !isInputActive) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        DOM.searchInput.focus();
        DOM.searchInput.select();
        return;
      }

      // Quick focus new task: 'N'
      if (e.key.toLowerCase() === 'n' && !isInputActive) {
        e.preventDefault();
        DOM.taskInput.focus();
        DOM.taskInput.select();
        return;
      }

      // Toggle Theme: 'T'
      if (e.key.toLowerCase() === 't' && !isInputActive) {
        e.preventDefault();
        toggleTheme();
        return;
      }

      // Toggle Audio: 'M'
      if (e.key.toLowerCase() === 'm' && !isInputActive) {
        e.preventDefault();
        toggleSound();
        return;
      }

      // Toggle Timer: Space (when not in input)
      if (e.code === 'Space' && !isInputActive) {
        e.preventDefault();
        toggleTimer();
        return;
      }

      // Open Shortcuts: '?'
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

    // 11. Modal Dialogs
    DOM.shortcutsBtn.addEventListener('click', () => DOM.shortcutsDialog.showModal());
    DOM.closeShortcutsBtn.addEventListener('click', () => DOM.shortcutsDialog.close());
    DOM.shortcutsDialog.addEventListener('click', (e) => {
      if (e.target === DOM.shortcutsDialog) DOM.shortcutsDialog.close();
    });

    DOM.exportImportBtn.addEventListener('click', () => DOM.backupDialog.showModal());
    DOM.closeBackupBtn.addEventListener('click', () => DOM.backupDialog.close());
    DOM.backupDialog.addEventListener('click', (e) => {
      if (e.target === DOM.backupDialog) DOM.backupDialog.close();
    });

    // Export & Import Handlers
    DOM.doExportBtn.addEventListener('click', exportTasksAsJson);
    DOM.exportCsvBtn.addEventListener('click', exportTasksAsCsv);
    DOM.doImportBtn.addEventListener('click', () => DOM.importFileInput.click());
    DOM.importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
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
            showToast('JSON must contain an array of tasks', 'error');
          }
        } catch (err) {
          showToast('Failed to parse JSON file', 'error');
        }
        DOM.importFileInput.value = '';
      };
      reader.readAsText(file);
    });

    DOM.reloadSamplesBtn.addEventListener('click', () => {
      state.tasks = [...INITIAL_SAMPLE_TASKS];
      saveTasks(state.tasks);
      renderApp();
      DOM.backupDialog.close();
      showToast('Starter tasks reloaded');
    });
  }

  // ==========================================================================
  // 17. Application Bootstrapping
  // ==========================================================================
  function init() {
    initSettings();
    state.tasks = loadTasks();
    setupEventListeners();
    updateTimerDisplay();
    renderApp();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
