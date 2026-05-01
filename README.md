# 🚀 JobPortal — Full Stack Job Searching Platform

A production-grade, full-stack job portal web application inspired by LinkedIn and Naukri.com. Built with **React.js + Node.js + MongoDB Atlas** using industry-standard MVC architecture.

---

## 🏗️ Project Structure

```
job-portal/
├── backend/                    # Node.js + Express REST API
│   ├── config/
│   │   └── db.js               # MongoDB Atlas connection
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, GetMe
│   │   ├── userController.js   # Profile CRUD, Resume Upload
│   │   ├── jobController.js    # Job CRUD + Search/Filter
│   │   └── applicationController.js  # Apply, Track, Manage
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT protect + role authorize
│   │   ├── errorMiddleware.js  # Global error handler
│   │   └── uploadMiddleware.js # Multer file upload config
│   ├── models/
│   │   ├── User.js             # User schema (student/admin)
│   │   ├── Job.js              # Job schema with full details
│   │   └── Application.js      # Application schema + status
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── jobRoutes.js
│   │   └── applicationRoutes.js
│   ├── utils/
│   │   └── helpers.js          # JWT generate/verify, sendResponse
│   ├── uploads/resumes/        # Uploaded resume files
│   ├── server.js               # Express app entry point
│   ├── package.json
│   ├── .env.example
│   └── render.yaml             # Render deployment config
│
└── frontend/                   # React.js + Vite + Tailwind CSS
    ├── src/
    │   ├── api/
    │   │   ├── axios.js         # Axios instance + interceptors
    │   │   ├── authAPI.js
    │   │   ├── jobsAPI.js
    │   │   ├── applicationsAPI.js
    │   │   └── userAPI.js
    │   ├── components/
    │   │   ├── auth/
    │   │   │   └── ProtectedRoute.jsx  # Route guards
    │   │   ├── jobs/
    │   │   │   ├── JobCard.jsx
    │   │   │   └── JobFilters.jsx
    │   │   ├── layout/
    │   │   │   └── Navbar.jsx
    │   │   └── ui/
    │   │       └── index.jsx    # Button, Input, Spinner, etc.
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state
    │   ├── hooks/
    │   │   ├── useJobs.js
    │   │   └── useApplications.js
    │   ├── pages/
    │   │   ├── HomePage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── JobsPage.jsx
    │   │   ├── JobDetailPage.jsx
    │   │   ├── student/
    │   │   │   ├── ApplicationsPage.jsx
    │   │   │   └── StudentProfilePage.jsx
    │   │   └── admin/
    │   │       ├── AdminDashboard.jsx
    │   │       ├── ManageJobsPage.jsx
    │   │       ├── PostJobPage.jsx
    │   │       └── JobApplicantsPage.jsx
    │   ├── App.jsx              # Routes + Providers
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── vercel.json              # Vercel deployment config
```

---

## ⚙️ Technology Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3 |
| Routing | React Router DOM v6 |
| HTTP Client | Axios (with interceptors) |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Backend | Node.js, Express.js |
| Authentication | JWT (jsonwebtoken + bcryptjs) |
| File Upload | Multer |
| Database | MongoDB Atlas + Mongoose ODM |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 🚦 API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login + get token |
| GET | `/api/auth/me` | Protected | Get current user |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/users/profile` | Protected | Get own profile |
| PUT | `/api/users/profile` | Protected | Update profile |
| POST | `/api/users/upload-resume` | Student | Upload resume |
| DELETE | `/api/users/resume` | Student | Delete resume |
| PUT | `/api/users/change-password` | Protected | Change password |
| GET | `/api/users` | Admin | List all users |

### Jobs
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/jobs` | Public | List/search jobs |
| GET | `/api/jobs/:id` | Public | Get job details |
| POST | `/api/jobs` | Admin | Create job |
| PUT | `/api/jobs/:id` | Admin | Update job |
| DELETE | `/api/jobs/:id` | Admin | Delete job |
| GET | `/api/jobs/admin/my-jobs` | Admin | Get admin's jobs |
| PATCH | `/api/jobs/:id/status` | Admin | Toggle job status |

### Applications
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/applications/:jobId/apply` | Student | Apply for job |
| GET | `/api/applications/my` | Student | Get my applications |
| DELETE | `/api/applications/:id/withdraw` | Student | Withdraw application |
| GET | `/api/applications/job/:jobId` | Admin | Get job applicants |
| PATCH | `/api/applications/:id/status` | Admin | Update app status |
| GET | `/api/applications/admin/stats` | Admin | Dashboard stats |

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/job-portal.git
cd job-portal
```

### 2. Setup Backend
```bash
cd backend
npm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

**.env file:**
```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/job-portal
JWT_SECRET=your_super_secret_key_minimum_32_chars
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
# Start backend in development
npm run dev
# Backend runs at http://localhost:5000
```

### 3. Setup Frontend
```bash
cd ../frontend
npm install

# Copy and configure environment
cp .env.example .env
# Edit VITE_API_URL if needed
```

**.env file:**
```
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start frontend dev server
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🌐 Deployment

### Backend → Render.com
1. Push `backend/` folder to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set **Root Directory** to `backend`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add environment variables from `.env`

### Frontend → Vercel
1. Push `frontend/` folder to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your GitHub repo
4. Set **Root Directory** to `frontend`
5. Add env var: `VITE_API_URL=https://your-backend.onrender.com/api`
6. Deploy!

### Database → MongoDB Atlas
1. Create free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user and whitelist IPs (0.0.0.0/0 for production)
3. Get connection string and paste into backend `.env`

---

## 🔐 Role-Based Access

| Feature | Student | Admin |
|---|---|---|
| Browse Jobs | ✅ | ✅ |
| Apply for Jobs | ✅ | ❌ |
| Track Applications | ✅ | ❌ |
| Upload Resume | ✅ | ❌ |
| Edit Profile | ✅ | ✅ |
| Post Jobs | ❌ | ✅ |
| Edit/Delete Jobs | ❌ | ✅ |
| View Applicants | ❌ | ✅ |
| Update App Status | ❌ | ✅ |
| Admin Dashboard | ❌ | ✅ |

---

## 📄 Application Status Flow

```
pending → reviewed → shortlisted → interviewed → offered
                                              ↘ rejected
(Student can withdraw at any non-offered stage)
```

---

## 🗂️ MongoDB Models

### User
- `fullName`, `email`, `password` (bcrypt hashed)
- `role`: `student` | `admin`
- `phone`, `location`, `bio`, `skills[]`
- `education[]`, `experience[]`
- `resume`: `{ filename, originalName, path, uploadedAt }`
- `companyName`, `companyWebsite` (admin only)

### Job
- `title`, `description`, `requirements[]`, `responsibilities[]`
- `company`: `{ name, website, logo, description }`
- `location`, `locationType`: `onsite | remote | hybrid`
- `jobType`: `full-time | part-time | contract | internship | freelance`
- `salary`: `{ min, max, currency, period, isVisible }`
- `skills[]`, `experienceLevel`, `openings`, `deadline`
- `status`: `active | closed | draft`
- `postedBy` (ref: User), `applicantsCount`

### Application
- `job` (ref: Job), `applicant` (ref: User)
- `coverLetter`, `resume`
- `status`: `pending | reviewed | shortlisted | interviewed | offered | rejected | withdrawn`
- `statusHistory[]`, `adminNotes`

---

## 🔧 Available Scripts

### Backend
```bash
npm run dev     # nodemon development server
npm start       # production start
```

### Frontend
```bash
npm run dev     # Vite development server
npm run build   # Production build
npm run preview # Preview production build
```

---

## 📝 GitHub Setup

```bash
# Initialize and push
git init
git add .
git commit -m "feat: initial full-stack job portal setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/job-portal.git
git push -u origin main
```

---

## 🎯 Future Enhancements

- [ ] Email notifications (Nodemailer) for status updates
- [ ] Job bookmarking / save for later
- [ ] Company profile pages
- [ ] Advanced salary range filter
- [ ] Candidate ranking with AI scoring
- [ ] Export applicants to CSV
- [ ] Google / GitHub OAuth login
- [ ] Push notifications (Socket.io)
- [ ] Mobile app (React Native)

---

## 👤 Author

**Your Name**  
GitHub: [@your_username](https://github.com/your_username)  
LinkedIn: [Your Profile](https://linkedin.com/in/your_profile)

---

*Built with ❤️ as an industry-level full-stack project*
