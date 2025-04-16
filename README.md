# 🪙 Loyalink

**Loyalink** is a full-stack, role-based loyalty rewards platform designed to simulate a real-world points system for purchases, promotions, and events. Built with React.js, Node.js, and SQLite, it supports a diverse range of user roles such as regular users, cashiers, managers, superusers, and event organizers.

---

## Live Demo

[Loyalink Website](https://loyalink.up.railway.app/login)  
*Application deployed via Railway*

---

## 🔧 Tech Stack

- **Frontend**: React.js, React Router, Vite, Axios, QRCode, React Hot Toast
- **Backend**: Node.js, Express.js, Prisma ORM, SQLite
- **Deployment**: Railway (frontend & backend), serve for production build

---

## Authentication & Role Management

- Secure JWT-based authentication
- Role-based dashboards for:
  - Regular Users
  - Cashiers
  - Managers
  - Superusers
  - Event Organizers
- Password reset, session persistence, role switching

---

## 👥 User Role Features

### Regular Users
- View current points and recent transactions
- QR code generation for purchases and redemptions
- Point redemption and transfer features
- RSVP to events and view event/promotion listings

### Cashiers
- Create transactions
- Process redemption requests
- Register new users manually

### Managers
- Manage all users and their roles
- Approve/reject suspicious activity
- Create/update/delete promotions and events
- Assign event organizers
- View all transactions (with filters & pagination)

### Superusers
- Promote/demote any user to any role, including superuser

### Event Organizers
- View and edit events they’re responsible for
- Add users as guests
- Award points to RSVPed guests

---

## 📦 Installation & Deployment

See `INSTALL.txt` for detailed instructions on:

- Prerequisite packages
- Local setup (`npm install`, `npm run dev`)
- Production build & deployment with Railway

---

