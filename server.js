require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "fonts.gstatic.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    }
  }
}));

app.use(cors({ origin: '*', methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));

const apiLimiter  = rateLimit({ windowMs: 15*60*1000, max: 300 });
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 30  });
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── INIT DB THEN START ─────────────────────────────────────────
const { initDb, run, all, get, persist } = require('./db');

async function startServer() {
  await initDb();

  // Create schema
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, phone TEXT UNIQUE NOT NULL,
      email TEXT, password TEXT NOT NULL, location TEXT, aadhaar TEXT,
      role TEXT DEFAULT 'farmer', created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS equipment (
      id TEXT PRIMARY KEY, owner_id TEXT, name TEXT NOT NULL, category TEXT NOT NULL,
      brand TEXT, model TEXT, year INTEGER, condition TEXT DEFAULT 'Good',
      hours_used INTEGER DEFAULT 0, location TEXT NOT NULL, description TEXT,
      img_url TEXT, daily_rate REAL NOT NULL, weekly_rate REAL, deposit REAL DEFAULT 0,
      specs TEXT DEFAULT '[]', availability TEXT DEFAULT 'now',
      status TEXT DEFAULT 'active', booked_dates TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS labour_workers (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, initials TEXT NOT NULL,
      color TEXT DEFAULT '#5DBD7A', role TEXT NOT NULL, location TEXT NOT NULL,
      rating REAL DEFAULT 4.5, reviews INTEGER DEFAULT 0, experience TEXT,
      jobs_done INTEGER DEFAULT 0, daily_rate REAL NOT NULL,
      skills TEXT DEFAULT '[]', tags TEXT DEFAULT '[]', avail_days TEXT DEFAULT '[]',
      bio TEXT, aadhaar TEXT, phone TEXT, status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY, type TEXT NOT NULL, item_id TEXT NOT NULL,
      renter_id TEXT, renter_name TEXT NOT NULL, renter_phone TEXT NOT NULL,
      renter_location TEXT, purpose TEXT, start_date TEXT, end_date TEXT,
      days INTEGER DEFAULT 1, daily_rate REAL NOT NULL, rental_amount REAL NOT NULL,
      deposit REAL DEFAULT 0, platform_fee REAL DEFAULT 0, gst REAL DEFAULT 0,
      total_amount REAL NOT NULL, payment_method TEXT DEFAULT 'upi',
      payment_status TEXT DEFAULT 'completed', txn_id TEXT UNIQUE NOT NULL,
      notes TEXT, created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS listings (
      id TEXT PRIMARY KEY, owner_id TEXT, owner_name TEXT NOT NULL,
      owner_phone TEXT NOT NULL, equipment_type TEXT NOT NULL, brand TEXT,
      model TEXT, condition TEXT, hours_used INTEGER, location TEXT NOT NULL,
      description TEXT, pricing_model TEXT DEFAULT 'daily', asking_price REAL,
      min_rental TEXT, status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `;

  const db = require('./db');
  db.exec(schema);

  // Auto-seed if empty
  const count = get('SELECT COUNT(*) as c FROM equipment');
  if (!count || count.c === 0) {
    console.log('First run — seeding database...');
    await require('./initDb').seed();
  }

  // ── ROUTES ────────────────────────────────────────────────────
  app.use('/api/auth',      require('./routes/auth'));
  app.use('/api/equipment', require('./routes/equipment'));
  app.use('/api/labour',    require('./routes/labour'));
  app.use('/api/bookings',  require('./routes/bookings'));
  app.use('/api/listings',  require('./routes/listings'));

  app.get('/api/health', (req,res) => res.json({ status:'ok', ts: new Date().toISOString() }));

  app.get('/api/stats', (req,res) => {
    try {
      const equipment = get('SELECT COUNT(*) as c FROM equipment WHERE status="active"').c;
      const workers   = get('SELECT COUNT(*) as c FROM labour_workers WHERE status="active"').c;
      const bookings  = get('SELECT COUNT(*) as c FROM bookings').c;
      const revenue   = get('SELECT COALESCE(SUM(total_amount),0) as s FROM bookings WHERE payment_status="completed"').s;
      res.json({ equipment, workers, bookings, revenue });
    } catch(e) { res.status(500).json({error:'Stats error'}); }
  });

  // Serve frontend
  const FRONTEND = path.join(__dirname, '../../frontend/public');
  if (fs.existsSync(FRONTEND)) {
    app.use(express.static(FRONTEND));
    app.get('*', (req,res) => res.sendFile(path.join(FRONTEND,'index.html')));
  }

  app.use((err,req,res,next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(PORT, () => {
    console.log(`\n🌾 AgriShare running on http://localhost:${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api/health\n`);
  });
}

startServer().catch(e => { console.error('Failed to start:', e); process.exit(1); });
