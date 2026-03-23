# 📋 Back-on-Track

> A sleek, aesthetic 3-week academic checklist — built with Next.js and deployed on Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-purple)

---

## ✨ Features

- **3-week task tracker** — DSA, Computer Systems, Programming & Prof. Skills, organised by day
- **Persistent progress** — checked items saved to `localStorage`, survive browser restarts
- **Beautiful UI** — deep purple/indigo gradient, frosted glass cards, per-subject colour coding
- **Live progress bars** — per-day, per-week, and overall completion tracking
- **Responsive** — horizontal scroll on mobile, 5-column grid on desktop
- **Zero backend** — fully static, instant Vercel deploys

---

## 🗂 Project Structure

```
/
├── app/
│   ├── layout.js        # Root layout & metadata
│   ├── page.js          # Entry point
│   └── globals.css      # Gradient background & glass styles
├── components/
│   ├── Checklist.jsx    # State management & localStorage
│   ├── WeekSection.jsx  # Weekly progress + day grid
│   ├── DayColumn.jsx    # Per-day task column
│   └── TaskItem.jsx     # Individual checkbox item
├── data/
│   └── tasks.js         # Structured 3-week task data
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run local dev server
npm run dev

# Production build
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view locally.

---

## 🎨 Subject Colour Key

| Subject | Colour |
|---|---|
| DSA (Data Structures & Algorithms) | Purple |
| Computer Systems | Blue |
| Further Programming | Teal |
| Professional Skills | Pink |

---

## 🌐 Deployment

This project deploys automatically to **Vercel** on every push to the `working` branch.

```
working  →  Vercel preview & production
master   →  stable release
```

---

## 📅 The Schedule

A 3-week catch-up plan covering 4 subjects across Mon–Fri:

- **DSA** — Weeks 1–6 + 8 (Class, Sheet, Lab per week)
- **Systems** — Lectures 1–7, Labs 1–7
- **Programming** — 11 Quizzes + 8 Labs
- **Prof. Skills** — 4 lectures, spaced across the 3 weeks
