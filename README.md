# MERN Notes App (TypeScript)

A full‑stack **MERN** application built with **TypeScript**, featuring **secure JWT authentication**, **real‑time notifications**, and a clean UI powered by **Tailwind CSS**. Users can create, update, delete their notes, browse public notes from others, like them, and receive instant updates via **Socket.IO**.

---

## 🚀 Features

### Authentication & Security

* **Access Token** stored in React state (NOT cookies/localStorage) to avoid XSS attacks.
* **Refresh Token** stored securely in **HTTP‑only cookies**.
* Automatic token refreshing.
* Protected routes (frontend + backend).
* Secure password hashing.

### Notes Functionality

* Create, edit, delete personal notes.
* View and like other users' notes.
* Public/private note visibility.

###  Real‑Time System

* **Online users tracking** using Socket.IO.
* **Real‑time notifications** (likes).
* Presence updates.

###  Tech Stack

#### **Frontend**

* React + TypeScript
* Tailwind CSS
* Axios
* Socket.IO Client

#### **Backend**

* Node.js + Express + TypeScript
* MongoDB + Mongoose
* JWT (Access + Refresh tokens)
* Socket.IO Server

---

##  Project Structure

### **Backend**

```
backend/
 ├── src/
 │   ├── config/
 │   ├── controllers/
 │   ├── middleware/
 │   ├── models/
 │   ├── routes/
 │   ├── sockets/
 │   └── utils/
 ├── package.json
 └── tsconfig.json
```

### **Frontend**

```
frontend/
 ├── src/
 │   ├── components/
 │   ├── context/
 |   |---api/
 │   ├── hooks/
 │   ├── pages/
 │   ├── services/
 │   └── utils/
 ├── package.json
 └── tsconfig.json
```

---

##  Authentication Flow

1. User logs in → server returns **access token** + **refresh token**.
2. Frontend stores:

   * **Access token in React state** (volatile, safer).
   * **Refresh token in HttpOnly cookie**.
3. For every secure API call, frontend sends the **access token**.
4. When the access token expires, frontend silently requests a new one using the refresh token.

###  Why this approach?

* Prevents **XSS** attacks (no tokens in localStorage).
* Prevents **token replay**.
* Cookie‑based refresh tokens ensure long‑term security.

---

##  Real‑Time Notifications (Socket.IO)

* User connects → added to online users list.
* Server broadcasts online/offline events.
* Actions like **like a note** trigger notifications.
* Notifications appear instantly in the UI.

---

##  Installation

###  Clone Repository

```
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### Install Backend

```
cd backend
npm install
```

Create `.env` file:

```
PORT=5000
MONGO_URI=your_mongo_url
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
```

Start server:

```
npm run dev
```

###  Install Frontend

```
cd frontend
npm install
npm run dev
```

---

## Tailwind Styling

* Fully responsive.
* Reusable components.
* Modern & minimal UI for notes and notifications.

---

##  API Overview

Below is the updated and detailed API reference based on your current folder structure and endpoints.

---

##  **Auth Routes** (`/auth`)

### **POST /signup**

Create a new user account.

### **POST /login**

Authenticate user and return access + refresh tokens.

### **GET /auth-user** *(protected)*

Return authenticated user information.

### **POST /refresh-token**

Issue new access token using refresh token.

### **POST /logout** *(protected)*

Invalidate refresh token and clear cookie.

### **PUT /update-profile-picture** *(protected)*

Upload/update user profile image.
Field: `profilePicture` (Multer upload).

---

## 📝 **Notes Routes** (`/notes`)

### **GET /auth-notes** *(protected)*

List notes created by the authenticated user.

### **GET /general-notes** *(protected)*

Fetch public/general notes from other users.

### **POST /create-note** *(protected)*

Create a new note.

### **PUT /update-note/:id** *(protected)*

Update a specific user-owned note.

### **DELETE /delete-note/:id** *(protected)*

Delete a specific note.

### **POST /toogle-like** *(protected)*

Like or unlike a note.
Body: `{ noteId: string }`.

---

##  **Notifications Routes** (`/notifications`)

### **GET /** *(protected)*

Get all notifications for logged-in user.

### **GET /unread-count** *(protected)*

Return count of unread notifications.

### **PUT /mark-read/:notificationId** *(protected)*

Mark a specific notification as read.

### **PUT /mark-all-read** *(protected)*

Mark all notifications as read.

---

##  Folder Structure

```
backend/
 ├── src/
 │   ├── __tests__/
 │   ├── controllers/
 │   ├── database/
 │   ├── interfaces/
 │   ├── middleware/
 │   ├── models/
 │   ├── public/
 │   ├── routes/
 │   ├── services/
 │   ├── socket/
 │   ├── utils/
 │   └── server.ts
 ├── uploads/
 ├── .env
 ├── jest.config.cjs
 ├── nodemon.json
 ├── package.json
 ├── tsconfig.json
 └── README.md

frontend/
 ├── src/
 │   ├── components/
 │   ├── pages/
 │   ├── hooks/
 │   ├── context/
 │   ├── services/
 │   └── utils/
 ├── package.json
 └── tsconfig.json
```

---

## 🧪 Future Improvements

* Dark mode
* Comments on notes
* User profiles & followers
* Push notifications

---

##  License

MIT

---

##  Contributing

Feel free to submit issues or pull requests to improve the project.

---

##  Support

If you liked this project, consider giving it a **star**  on GitHub!
