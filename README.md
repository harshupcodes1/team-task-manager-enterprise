<div align="center">

# ⚡ Enterprise Team Task Manager

**A high-performance, secure, and enterprise-ready project management ecosystem.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-Online-00E676?style=for-the-badge&logo=railway)](https://ample-adaptation-production-554a.up.railway.app)
[![Tech Stack](https://img.shields.io/badge/Stack-MERN-311C87?style=for-the-badge&logo=react)](https://react.dev/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-FFB300?style=for-the-badge&logo=opslevel)](#)

<img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop" alt="Dashboard Preview" width="100%" style="border-radius: 12px; margin-top: 20px; box-shadow: 0px 10px 30px rgba(0,0,0,0.1);">

<br>
</div>

## 🌐 Live Application
- **Production URL:** [https://ample-adaptation-production-554a.up.railway.app](https://ample-adaptation-production-554a.up.railway.app)
- **Demo Video:** `[Add Your Video Link Here (Loom/YouTube)]`

*(Note: Use the email `admin@company.com` and password `Admin@123` to access the Admin privileges).*

---

## 💎 The Architecture
Built to scale, this application completely transforms traditional task management by introducing enterprise-tier security, deep auditing, and a flawless fluid UI.

### 🛡️ Zero-Trust Security
- **Stateless Authentication:** Highly secure `JWT` (JSON Web Tokens) implementation ensuring stateless, scaleable sessions.
- **Cryptographic Hashing:** Passwords are never stored in plain text. They are heavily salted and hashed using `bcryptjs`.
- **Role-Based Access Control (RBAC):** Normal users are strictly isolated from Admin functions. Backend endpoints (`PUT`, `DELETE`) utilize custom middleware to validate the `ADMIN` role before processing destructive mutations.

### 📊 Flagship Features
- **Project Insights Engine:** Admins have access to a dedicated dashboard showing real-time task velocity, completion progress bars, and execution breakdowns.
- **Multi-Assignee Avatar Stacks:** Enterprise tasks require collaboration. The schema supports array-based multi-user assignments, visually represented via dynamic avatar stacking on the UI.
- **Immutable Commit Auditing:** Replaced generic comment threads with a robust timeline. Every task update generates a unique, cryptographically random `7-character commitHash` to establish an undeniable audit trail (`Issued By` vs `Completed By`).
- **Framer Motion Fluid UI:** The interface is not just functional; it's premium. Features parallax scrolling, dynamic modals, and staggered micro-animations for a native-app feel.

---

## 🛠 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Architecture** | `React.js` (Vite), `Tailwind CSS`, `Framer Motion`, `Lucide React` |
| **Backend API** | `Node.js`, `Express.js`, `RESTful Design` |
| **Database & ORM** | `MongoDB Atlas`, `Mongoose ODM` |
| **Security & Auth** | `JWT`, `Bcrypt.js`, `Node Crypto` |
| **Deployment & CI/CD** | `Railway`, `GitHub Actions` |

---

## ⚙️ Local Development Setup

Clone the repository and install dependencies for both ends of the stack.

```bash
# Clone the repository
git clone https://github.com/your-username/team-task-manager-enterprise.git
cd team-task-manager-enterprise
```

### Backend Setup
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
```bash
npm start
```

### Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
```
```bash
npm run dev
```

---
<div align="center">
  <p><i>Architected and Engineered for High-Velocity Teams.</i></p>
</div>
