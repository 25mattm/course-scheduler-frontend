# Course Scheduler — Frontend

A React interface for managing courses, students, and enrollments. Talks to a Spring Boot REST API and makes the many-to-many relationship between students and courses fully interactive — enroll, unenroll, and view rosters from both sides.

This is the frontend half of a full-stack project. The Spring Boot backend lives in a separate repository: [course-scheduler](https://github.com/25mattm/course-scheduler).

![Course Scheduler screenshot](src/assets/screenshot.png)

## Features

- Full CRUD for courses (create, list, inline edit, delete)
- Create and delete students
- Enroll a student in a course via dropdown
- Unenroll with a single click (the × on each enrolled-course chip)
- View a course's roster inline, with multiple rosters open at once
- Rosters and enrollment chips stay in sync automatically when enrollments change

## Tech stack

- **React** (functional components, hooks)
- **Vite** for tooling and dev server
- **fetch** for API calls

## Running locally

**Prerequisites:** Node.js, and the [backend](https://github.com/25mattm/course-scheduler) running on `http://localhost:8080`.

**1. Install dependencies:**

```bash
npm install
```

**2. Start the dev server:**

```bash
npm run dev
```

The app runs on `http://localhost:5173` and expects the backend at `http://localhost:8080`. The backend allows requests from the Vite dev server via CORS configuration.