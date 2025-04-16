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
<img width="1438" alt="Screenshot 2025-04-15 at 10 32 15 PM" src="https://github.com/user-attachments/assets/33418eb7-0cd9-4f07-8e22-f61e27416dc9" />

### Cashiers
- Create transactions
- Process redemption requests
- Register new users manually
<img width="1439" alt="Screenshot 2025-04-15 at 10 32 36 PM" src="https://github.com/user-attachments/assets/8d59ec10-a8e5-4cbd-9ddd-2b8337a5d011" />

### Managers
- Manage all users and their roles
- Approve/reject suspicious activity
- Create/update/delete promotions and events
- Assign event organizers
- View all transactions (with filters & pagination)
<img width="1440" alt="Screenshot 2025-04-15 at 10 33 12 PM" src="https://github.com/user-attachments/assets/acf1977c-f4f0-4269-a5b3-cb152044c726" />

### Superusers
- Promote/demote any user to any role, including superuser
<img width="1440" alt="Screenshot 2025-04-15 at 10 33 57 PM" src="https://github.com/user-attachments/assets/499ece45-4e74-4675-aa5f-d4b3083d1d60" />

### Event Organizers
- View and edit events they’re responsible for
- Add users as guests
- Award points to RSVPed guests
<img width="1440" alt="Screenshot 2025-04-15 at 10 35 52 PM" src="https://github.com/user-attachments/assets/38920c38-3fe0-4a27-859b-91a5426aa3c7" />

---

## 📦 Installation & Deployment

See `INSTALL.txt` for detailed instructions on:

- Prerequisite packages
- Local setup (`npm install`, `npm run dev`)
- Production build & deployment with Railway

---

