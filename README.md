# FocusList 🎯

FocusList is a modern, responsive, frontend-only daily task manager designed with an obsession for speed, craftsmanship, and simplicity. Built with zero dependencies using semantic HTML5, modern CSS custom properties, and modular ES6+ JavaScript.

![FocusList Preview](https://via.placeholder.com/800x450/1e293b/ffffff?text=FocusList+-+Task+Management)

---

## ✨ Features

### 1. Task Creation & Quick Add
- Quick-add input with auto-focus support and character limit tracking.
- Assign priorities on creation: **High** (🔴 Rose), **Medium** (🟡 Amber), **Low** (🟢 Emerald). Defaults to Medium.
- Keyboard shortcut: Press `Enter` to instantly add a task; press `N` anytime to focus the input.

### 2. Task Lifecycle & Management
- **Completion**: Accessible custom checkbox with smooth animation. Completed tasks are visually distinguished with strikethrough styling and muted contrast.
- **Inline Editing**: Double-click any task title or click the Edit button to edit in place. Modify title and change priority on the fly. Press `Enter` to save, `Esc` to cancel.
- **Delete with Undo**: Delete tasks with immediate feedback. A toast notification with an **Undo** button stays active for 5 seconds to easily reverse accidental deletions.
- **Clear Completed**: One-click cleanup of all finished tasks (with undo support).

### 3. Clear Priority Visual Hierarchy
- Color-coded badges with glowing dots:
  - **High**: Urgent tasks highlighted in rose/crimson.
  - **Medium**: Important tasks in warm amber.
  - **Low**: General tasks in fresh emerald.
- Fully adapted to both dark and light modes.

### 4. Search & Multi-Axis Filtering
- **Instant Search**: Real-time title search as you type, with clear button (`✕`). Shortcut: `/` or `Ctrl/Cmd + K`.
- **Status Filter Tabs**: Filter by **All**, **Active**, or **Completed**. Each tab displays a live counter badge.
- **Priority Filter**: Filter by High, Medium, or Low priority.
- **Conjunctive Filtering**: Search query, status, and priority filters work seamlessly together.
- Contextual empty states with a quick **"Reset Search & Filters"** action when no matches are found.

### 5. Live Statistics & Progress Tracking
- Header dashboard tracking:
  - **Total Tasks**
  - **Pending Tasks**
  - **Completed Tasks**
  - **Completion Rate %** with an animated gradient progress bar.
- Counters update reactively on every addition, deletion, or toggle.

### 6. Themes & Local Persistence
- **Light & Dark Mode**: Respects OS system preference by default, with an instant toggle (`T` shortcut or sun/moon button).
- **Local Storage**: Automatically saves all tasks and theme preferences (`focuslist_tasks_v1`).
- **Starter Tasks**: Preloaded with 4 helpful starter tasks on initial launch so the app is immediately usable.
- **Data Backup & Restore**: Export all tasks to a formatted JSON file or import from a backup file.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `N` | Focus new task input |
| `/` or `Ctrl/Cmd + K` | Focus search bar |
| `Enter` | Submit new task / Save inline edit |
| `Esc` | Cancel task edit / Close modal |
| `T` | Toggle Dark / Light theme |
| `?` | View keyboard shortcuts |

---

## 🚀 Getting Started

### Local Development Server

You can run the included lightweight Python 3 server:

```bash
python3 server.py
```

Then navigate to:
```
http://localhost:8080
```

Alternatively, open `index.html` directly in any web browser:
```bash
open index.html
```

---

## 🌐 Live Deployment Options

Since FocusList is a 100% frontend-only static web application, it can be deployed anywhere in seconds:

### Option 1: GitHub Pages (Recommended)
1. Push this repository to GitHub:
   ```bash
   git init -b main
   git add .
   git commit -m "Initial commit of FocusList"
   gh repo create focuslist --public --source=. --push
   ```
2. Enable GitHub Pages in Repository Settings (`Settings` > `Pages` > Source: `main` branch / root).

### Option 2: Netlify Drop / CLI
- Drag and drop this folder into [Netlify Drop](https://app.netlify.com/drop) for instant deployment.
- Or using Netlify CLI:
  ```bash
  npx netlify deploy --dir=. --prod
  ```

### Option 3: Vercel
```bash
npx vercel --prod
```

### Option 4: Surge.sh
```bash
npx surge . focuslist.surge.sh
```

---

## 🛠️ Project Structure

```
focuslist/
├── index.html       # Semantic HTML5 markup, SVG icons & modal dialogs
├── styles.css       # Design system, CSS custom properties, responsive layout
├── app.js           # Reactive state management, LocalStorage sync & event handlers
├── server.py        # Lightweight development server
├── README.md        # Comprehensive documentation
└── .gitignore       # Git ignore patterns
```

---

## 📄 License
MIT
