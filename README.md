# FocusList 🎯

A clean, responsive, frontend-only to-do app for planning and managing daily tasks. Zero dependencies, no backend — built with semantic HTML5, modern CSS, and vanilla ES6 JavaScript.

## Features

- **Task creation** — add tasks with a title and a priority (High / Medium / Low)
- **Task management** — mark complete, inline edit (title + priority, `Esc` to cancel), and delete
- **Priority badges** — color-coded, always visible on each task
- **Search & filters** — search by title, filter by status (All / Active / Completed) and by priority, all combinable
- **Statistics** — live Total / Completed / Pending counts that update on every change
- **Persistence** — tasks saved to `localStorage`, survive page refreshes
- **Responsive** — optimized for desktop and mobile

## Structure

```
focuslist/
├── index.html      # App shell
├── css/styles.css  # Styling (cleaning, responsive)
└── js/app.js       # Logic (CRUD, filters, stats, localStorage)
```

## Run locally

Serve the folder as static files (no build step):

```bash
cd focuslist
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy

Pure static site — drag-and-drop onto Netlify Drop/Vercel, or push to GitHub and enable Pages (this repo uses a GitHub Actions workflow). Deployed at:
https://yashuraghuvanshi4-pixel.github.io/focuslist/