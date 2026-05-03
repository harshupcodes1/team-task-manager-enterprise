# Enterprise Team Task Manager

<div align="center">
  <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop" alt="Enterprise Workflow Dashboard" width="100%" style="border-radius: 12px; margin-bottom: 20px;">
</div>

> **A high-performance, secure, and enterprise-ready project management ecosystem.** Built with the MERN stack, featuring advanced Role-Based Access Control (RBAC), multi-user assignments, and a GitHub-style cryptographic commit timeline.

---

## 🚀 Live Demo & Assignment Submission
- **Frontend Live App:** `[Insert Railway Frontend Link Here]`
- **Backend API URL:** `[Insert Railway Backend Link Here]`
- **Video Walkthrough:** `[Insert YouTube/Loom Link Here]`

---

## 🛡️ Enterprise Security & Architecture
Security and data integrity are at the absolute core of this application.

- **Stateless Authentication:** Highly secure JWT (JSON Web Tokens) implementation ensuring stateless, scaleable sessions.
- **Cryptographic Hashing:** Passwords are never stored in plain text; heavily salted and hashed using `bcryptjs` before entering the database.
- **Role-Based Access Control (RBAC):** "Zero-trust" API architecture. Normal users are strictly isolated from Admin functions. Backend endpoints (`PUT`, `DELETE`) utilize custom middleware to validate the `ADMIN` role before processing destructive mutations.
- **Immutable Commit Auditing:** Every task update generates a unique, cryptographically random 7-character `commitHash` to establish an undeniable audit trail.
- **Environment Protection:** Sensitive MongoDB URIs and JWT Secrets are isolated via `.env` protocols and strictly excluded from version control via `.gitignore`.

## ✨ Flagship Technical Features

- **Project Insights Analytics Engine:** Admins have access to a dedicated dashboard showing real-time task velocity, completion progress bars, and execution breakdowns.
- **Multi-Assignee Avatar Stacks:** Enterprise tasks require collaboration. The schema supports array-based multi-user assignments, visually represented via dynamic avatar stacking on the UI.
- **GitHub-Style Timeline Architecture:** Replaced generic comment threads with a robust timeline. Users "Push" updates to a task, providing a full history of the ticket's lifecycle (`Issued By` vs `Completed By`).
- **Framer Motion Fluid UI:** The interface is not just functional; it's premium. Features parallax scrolling, dynamic modals, and staggered micro-animations for a native-app feel.

---

## 🛠 Technology Stack

**Frontend Architecture:**
- `React.js` (Bootstrapped with Vite for maximum speed)
- `Tailwind CSS` (Custom utility-first styling)
- `Framer Motion` (Physics-based animation engine)
- `Lucide React` (Scalable vector iconography)

**Backend Infrastructure:**
- `Node.js` & `Express.js` (RESTful API Design)
- `MongoDB` & `Mongoose ODM` (NoSQL Database & Schema Relationships)
- `JSON Web Tokens` (Auth)
- `Bcrypt.js` & `Crypto` (Security Layers)

---

## ⚙️ Local Deployment Guide

1. **Clone the repository**
   ```bash
   git clone <your-repo-link>
   cd TeamTaskManager
   ```

2. **Initialize Backend Server**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   ```
   Start the API server:
   ```bash
   npm start
   ```

3. **Initialize Frontend Client**
   ```bash
   cd ../frontend
   npm install
   ```
   Start the Development Client:
   ```bash
   npm run dev
   ```

---

## 🔒 Default Admin Credentials (For App Evaluation)
- **Email:** `admin@company.com`
- **Password:** *(Enter your test password here so reviewers can test)*

---
*Architected and Engineered for the Full-Stack Assessment.*
