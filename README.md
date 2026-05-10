# 🌾 AgriShare — Fractional Agricultural Ownership Platform

**AgriShare** empowers Indian farmers to co-own high-value agricultural equipment through tokenized fractional ownership, rent machinery from other farmers, and hire verified farm workers.

## 🚀 Live Features

| Module | Description |
|--------|-------------|
| 🪙 **Token Marketplace** | Buy 1/5th ownership tokens for tractors, harvesters, drones |
| 🔑 **Equipment Rental** | Rent farm equipment by the day with calendar booking |
| 📋 **List Your Equipment** | List idle machinery and earn rental income |
| 👷 **Hire Labour** | Book verified farm workers by the day |
| 🔐 **Auth System** | JWT-based login/register for farmers and owners |
| 📦 **REST API** | Full backend with SQLite, rate limiting, and security |

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS (single-file, dark theme)
- **Backend**: Node.js + Express
- **Database**: SQLite via `better-sqlite3`
- **Auth**: JWT (JSON Web Tokens) + bcrypt
- **Security**: Helmet, CORS, rate limiting
- **Deploy**: Render.com (free tier)

---

## ⚡ Local Setup

### Prerequisites
- Node.js v18+
- npm v8+

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/agrishare.git
cd agrishare

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env
# Edit .env and set your JWT_SECRET

# 4. Initialize database (creates & seeds SQLite DB)
npm run init-db

# 5. Start the server
npm start
# or for development with auto-reload:
npm run dev
```

Visit: **http://localhost:3000**

---

## 🌐 Deploy to the Internet (Free — Render.com)

### Step 1: Push to GitHub

```bash
cd agrishare
git init
git add .
git commit -m "🌾 Initial AgriShare commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/agrishare.git
git push -u origin main
```

### Step 2: Deploy on Render.com

1. Go to **[render.com](https://render.com)** and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select the **agrishare** repository
4. Fill in these settings:

| Setting | Value |
|---------|-------|
| Name | `agrishare` |
| Runtime | `Node` |
| Build Command | `npm install && npm run init-db` |
| Start Command | `npm start` |

5. Under **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = *(click "Generate" for a random secret)*

6. Under **Disks** (for persistent SQLite), add:
   - Mount Path: `/opt/render/project/src/backend/db`
   - Size: `1 GB`

7. Click **"Create Web Service"**

✅ Render will build and deploy. Your site will be live at:
**`https://agrishare.onrender.com`** (or your chosen name)

### Alternative: Railway.app

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

---

## 📡 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new farmer/owner |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user profile |

### Equipment
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/equipment` | List all equipment (supports `?category=tractor&location=Punjab`) |
| GET | `/api/equipment/:id` | Get single equipment |
| POST | `/api/equipment` | Create new equipment listing (auth required) |
| DELETE | `/api/equipment/:id` | Remove listing (owner only) |

### Labour
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/labour` | List all workers (supports `?skill=harvest`) |
| GET | `/api/labour/:id` | Get single worker |
| POST | `/api/labour/register` | Register as a farm worker |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings/equipment` | Book equipment rental |
| POST | `/api/bookings/labour` | Hire a worker |
| POST | `/api/bookings/token` | Purchase an ownership token |
| GET | `/api/bookings/my` | Get my bookings (auth required) |
| GET | `/api/bookings/:txn_id` | Lookup booking by transaction ID |

### Listings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/listings` | Submit equipment for listing |

### Misc
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/stats` | Platform statistics |

---

## 🔑 Demo Credentials

| Role | Phone | Password |
|------|-------|----------|
| Admin | `9999999999` | `admin123` |

---

## 📁 Project Structure

```
agrishare/
├── frontend/
│   └── public/
│       └── index.html          # Complete frontend SPA
├── backend/
│   ├── db/                     # SQLite database (auto-created)
│   └── src/
│       ├── server.js           # Express app entry point
│       ├── db.js               # DB connection singleton
│       ├── initDb.js           # Schema + seed data
│       ├── middleware/
│       │   └── auth.js         # JWT middleware
│       └── routes/
│           ├── auth.js         # Register / Login
│           ├── equipment.js    # Equipment CRUD
│           ├── labour.js       # Workers API
│           ├── bookings.js     # All booking types
│           └── listings.js     # Equipment listing submissions
├── .env.example                # Environment variable template
├── .gitignore
├── render.yaml                 # Render.com deploy config
├── package.json
└── README.md
```

---

## 🌱 Currency & Locale
All prices in **Indian Rupees (₹)**. Platform serves Indian farmers across all 22 states.

## 📞 Support
- Email: support@agrishare.in
- Phone: 1800-XXX-XXXX (9am–6pm IST)

---

*Built with ❤️ for Indian farmers. AgriShare Pvt. Ltd.*
