# 📅 Calendar & Event Management App

## 🚀 Introduction
The **Calendar & Event Management App** helps users efficiently manage schedules, events, and tasks. It features a user-friendly interface for creating, editing, and viewing events, with support for multi-day events, reminders, and guest management.

---

## ✨ Features

- **Event Creation & Editing:** Add, update, or delete events with details like title, description, location, and time.
- **Task Management:** Convert events to tasks with due dates and priorities.
- **Advanced Task Management:** Jira-like kanban board with drag-and-drop functionality, list view, filters, and search.
- **Multi-Day Selection:** Manage events spanning multiple days.
- **Reminders:** Set custom reminders for upcoming events.
- **Guest Invitations:** Add guests via email and manage the guest list.
- **Color-coded Labels:** Categorize events and tasks visually.
- **Responsive UI:** Works on desktop and mobile devices.

---

## 🛠️ Tech Stack

- **Frontend:** React, Day.js, Tailwind CSS
- **State Management:** React Context API
- **API:** Custom REST API for events/tasks

---

## 📁 Project Structure

```
/src
  /components
    EventModal.js
    TaskModal.js
    Calendar.js
    ...
  /context
    GlobalContext.js
  /api
    eventsApi.js
  App.js
  index.js
```

---

## ⚡ Installation & Setup

**Clone the repository:**
```bash
git clone <your-repo-url>
cd <project-folder>
```

**Install dependencies:**
```bash
npm install
```

**Start the development server:**
```bash
npm start
```

**Backend Setup:**  
Ensure your REST API for events/tasks is running and accessible.

---

## 📖 Usage Guide

### Creating an Event
1. Click the **"Add Event"** button.
2. Fill in event details: title, description, location, email, label, reminder, start/end time, and guests.
3. Select single or multiple days for the event.
4. Click **"Save"** to create the event.

### Editing or Deleting Events
1. Click on an event in the calendar to open the edit modal.
2. Update details as needed or click **"Delete"** to remove the event.

### Managing Tasks
1. Switch to the **Task Management** view to access the advanced task management interface.
2. Use the **Kanban Board** for drag-and-drop task organization.
3. Switch to **List View** for detailed task information in table format.
4. Filter tasks by status, priority, or search for specific tasks.
5. Use keyboard shortcuts: **Ctrl+N** to create new tasks.
6. Tasks can be converted to events and vice versa.

### Adding Guests
1. Enter guest emails in the event modal.
2. Guests are added to the event and can be managed from the guest list.

### Setting Reminders
1. Choose a reminder time before the event (e.g., 10 minutes, 1 hour).

---

## 🧩 Component Overview

### `EventModal.js`
Handles event creation and editing.

**Key state/props:**
- `selectedEvent`, `selectedTask`
- `multiDaySelection`
- `title`, `description`, `location`, `email`, `selectedLabel`, `reminder`, `startTime`, `endTime`, `guests`

### `Calendar.js`
Displays the calendar view and events.

### `GlobalContext.js`
Manages global state for events, tasks, and modal visibility.

### `eventsApi.js`
Handles API requests for creating, updating, and deleting events.

### `TaskManagement.js`
Advanced task management interface with Jira-like functionality:
- **Kanban Board**: Drag-and-drop task organization with status columns
- **List View**: Detailed table view with sorting and filtering
- **Real-time Search**: Search tasks by title or description
- **Advanced Filters**: Filter by status, priority, and overdue tasks
- **Task Statistics**: Visual overview of task distribution
- **Keyboard Shortcuts**: Quick task creation with Ctrl+N

---

## 📚 API Reference

### Event Object
```json
{
  "EventId": "string",
  "Title": "string",
  "Description": "string",
  "Location": "string",
  "Email": "string",
  "Label": "string",
  "Day": "YYYY-MM-DD",
  "EndDay": "YYYY-MM-DD",
  "Reminder": "string",
  "StartTime": "HH:mm",
  "EndTime": "HH:mm",
  "Guests": ["email1", "email2"],
  "LastUpdated": "timestamp",
  "IsMultiDay": true,
  "Views": ["month", "week", "day"]
}
```

### Task Object
```json
{
  "TaskId": "string",
  "Title": "string",
  "Description": "string",
  "DueDate": "YYYY-MM-DD",
  "Priority": "Low | Medium | High",
  "Label": "string",
  "Completed": true,
  "LastUpdated": "timestamp"
}
```

### Venue Object
```json
{
  "VenueId": "string",
  "Name": "string",
  "Address": "string",
  "Capacity": 100,
  "ContactEmail": "string"
}
```

---

## 🔗 API Endpoints

### Event API
- `GET /events` — List all events
- `POST /events` — Create a new event
- `PUT /events/:id` — Update an event
- `DELETE /events/:id` — Delete an event

### Task API
- `GET /tasks` — List all tasks
- `GET /tasks/:id` — Get a single task
- `POST /tasks` — Create a new task
- `PUT /tasks/:id` — Update a task
- `DELETE /tasks/:id` — Delete a task

### Venue API
- `GET /venues` — List all venues
- `GET /venues/:id` — Get a single venue
- `POST /venues` — Create a new venue
- `PUT /venues/:id` — Update a venue
- `DELETE /venues/:id` — Delete a venue

---

## 🎨 Customization

- **Labels:**  
  Edit `labelsClasses` in your components to add or change label colors.

- **Views:**  
  Modify the calendar view logic in `Calendar.js` to add new views (e.g., year view).

- **Reminders:**  
  Adjust reminder options in the event modal.

---

## 🛠️ Troubleshooting

- **No response from server:**  
  Ensure the backend API is running and the endpoint URLs are correct.

- **Events not saving:**  
  Check API responses and browser console for errors.

- **UI issues:**  
  Verify CSS and component state logic.

---

## 🚧 Future Improvements

- Calendar sync with Google/Outlook
- Push notifications
- Recurring events
- Mobile app version

---
