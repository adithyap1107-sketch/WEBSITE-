// backend/src/db.js — sql.js wrapper with file persistence
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../db/agrishare.db');
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

let db = null;

function persist() {
  if (db) {
    try { fs.writeFileSync(DB_PATH, Buffer.from(db.export())); } catch(e) { console.error('Persist err:', e.message); }
  }
}

setInterval(persist, 30000);
process.on('exit', () => { try { persist(); } catch {} });
['SIGINT','SIGTERM'].forEach(sig => process.on(sig, () => { persist(); process.exit(0); }));

async function initDb() {
  if (db) return db;
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }
  return db;
}

function getDb() {
  if (!db) throw new Error('DB not initialized');
  return db;
}

function run(sql, params = []) {
  const d = getDb();
  d.run(sql, params);
  return { changes: d.getRowsModified() };
}

function all(sql, params = []) {
  const d = getDb();
  const result = d.exec(sql, params);
  if (!result || result.length === 0) return [];
  const { columns, values } = result[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

function get(sql, params = []) {
  return all(sql, params)[0] || null;
}

function exec(sql) {
  getDb().run(sql);
}

module.exports = { initDb, getDb, run, all, get, exec, persist };
