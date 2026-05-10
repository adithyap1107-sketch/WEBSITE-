const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { run, all, get } = require('../db');

router.get('/', (req,res) => {
  try {
    const {skill,location,max_rate} = req.query;
    let sql = 'SELECT * FROM labour_workers WHERE status="active"';
    const p = [];
    if (location) { sql+=' AND location LIKE ?'; p.push('%'+location+'%'); }
    if (max_rate) { sql+=' AND daily_rate<=?'; p.push(Number(max_rate)); }
    if (skill) { sql+=' AND skills LIKE ?'; p.push('%'+skill+'%'); }
    sql+=' ORDER BY rating DESC';
    const rows = all(sql,p);
    rows.forEach(r=>{ try{r.skills=JSON.parse(r.skills||'[]');}catch{r.skills=[];} try{r.tags=JSON.parse(r.tags||'[]');}catch{r.tags=[];} try{r.avail_days=JSON.parse(r.avail_days||'[]');}catch{r.avail_days=[];} });
    res.json(rows);
  } catch(e){console.error(e);res.status(500).json({error:'Failed'});}
});

router.get('/:id', (req,res) => {
  try {
    const row = get('SELECT * FROM labour_workers WHERE id=?',[req.params.id]);
    if (!row) return res.status(404).json({error:'Not found'});
    try{row.skills=JSON.parse(row.skills||'[]');}catch{row.skills=[];}
    try{row.tags=JSON.parse(row.tags||'[]');}catch{row.tags=[];}
    try{row.avail_days=JSON.parse(row.avail_days||'[]');}catch{row.avail_days=[];}
    res.json(row);
  } catch(e){res.status(500).json({error:'Failed'});}
});

router.post('/register', (req,res) => {
  try {
    const {name,phone,location,aadhaar,experience,daily_rate,skills,avail_days,bio} = req.body;
    if (!name||!phone||!location) return res.status(400).json({error:'name,phone,location required'});
    const id = uuidv4();
    const initials = name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
    const colors = ['#5DBD7A','#D4A853','#7db8e8','#b87dde','#e87d7d'];
    const color = colors[Math.floor(Math.random()*colors.length)];
    run(`INSERT INTO labour_workers (id,name,initials,color,role,location,daily_rate,skills,avail_days,bio,aadhaar,phone,status) VALUES (?,?,?,?,'Farm Worker',?,?,?,?,?,?,?,'pending')`,
      [id,name,initials,color,location,daily_rate||500,JSON.stringify(skills||[]),JSON.stringify(avail_days||[]),bio||null,aadhaar||null,phone]);
    res.status(201).json({id,message:'Registration submitted! Verification within 24 hours.'});
  } catch(e){console.error(e);res.status(500).json({error:'Registration failed'});}
});

module.exports = router;
