# ByteLearn 📚

**ByteLearn** is a full-stack E-Learning Management System (LMS) built with the MERN stack, designed to manage the complete lifecycle of online education — from student enrollment and course delivery to educator onboarding and platform administration.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Authentication | JWT, bcryptjs |
| Frontend | React.js *(in development)* |

---

## Server Layer (Backend)

- REST API design with MVC architecture
- JWT-based authentication and session management
- Role-Based Access Control (RBAC) via middleware
- Educator onboarding with admin approval workflow
- Course, enrollment, and progress management
- Password hashing, input validation, and security headers

## Client Layer (Frontend)

- Role-specific dashboards for students, educators, and admins
- Course browsing, enrollment, and progress tracking UI
- Educator course builder interface
- Quiz and assessment interfaces

---

## User Roles

| Role | Access |
|---|---|
| **Student** | Browse courses, enroll, track progress, take quizzes |
| **Educator** | Create and publish courses after admin approval |
| **Admin** | Manage users, approve educators, oversee platform content |

> Educators register with a `pending` status. An admin must approve their application before they can publish courses.

---

## Core Modules

### 🔐 Authentication & Authorization
- Student and educator registration with role enforcement
- Unified login for all roles
- JWT-based session management
- RBAC middleware (`protect`, `admin`, `approvedEducator`)
- Get and update user profile
- Change password

### 👤 User Management
- Admin can view all users and filter educators by status
- Approve or reject educator applications

### 📖 Course Management
- Create, edit, and publish courses with sections and lessons
- Draft and published content states

### 🎓 Enrollment & Progress
- Student course enrollment and progress tracking
- Certificate generation on completion

### 📝 Assessments
- Quiz creation by educators
- Automatic grading and result display

### 💬 Reviews & Ratings
- Students can rate and review enrolled courses

---

## Security

- Encrypted passwords (bcryptjs)
- JWT-based stateless authentication
- Role-based route protection
- HTTP security headers (Helmet.js)
- CORS policy configuration

---

## Project Status

🚧 Under active development — Authentication & Authorization module complete. Course management and frontend in progress.

---

## License

This project is intended for academic and learning purposes.
