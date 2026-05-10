const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { run, all, get } = require('../db');
const { auth, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, (req,res) => {
  try {
    const {category,location,max_price,availability} = req.query;
    let sql = 'SELECT * FROM equipment WHERE status="active"';
    const p = [];
    if (category) { sql+=' AND category=?'; p.push(category); }
    if (location) { sql+=' AND location LIKE ?'; p.push('%'+location+'%'); }
    if (max_price) { sql+=' AND daily_rate<=?'; p.push(Number(max_price)); }
    if (availability) { sql+=' AND availability=?'; p.push(availability); }
    sql+=' ORDER BY created_at DESC';
    const rows = all(sql,p);
    rows.forEach(r=>{ try{r.specs=JSON.parse(r.specs||'[]');}catch{r.specs=[];} try{r.booked_dates=JSON.parse(r.booked_dates||'[]');}catch{r.booked_dates=[];} });
    res.json(rows);
  } catch(e){console.error(e);res.status(500).json({error:'Failed'});}
});

router.get('/:id', (req,res) => {
  try {
    const row = get('SELECT * FROM equipment WHERE id=?',[req.params.id]);
    if (!row) return res.status(404).json({error:'Not found'});
    try{row.specs=JSON.parse(row.specs||'[]');}catch{row.specs=[];}
    try{row.booked_dates=JSON.parse(row.booked_dates||'[]');}catch{row.booked_dates=[];}
    res.json(row);
  } catch(e){res.status(500).json({error:'Failed'});}
});

router.post('/', auth, (req,res) => {
  try {
    const {name,category,brand,model,year,condition,hours_used,location,description,img_url,daily_rate,weekly_rate,deposit,specs,availability} = req.body;
    if (!name||!category||!location||!daily_rate) return res.status(400).json({error:'name,category,location,daily_rate required'});
    const id = uuidv4();
    run(`INSERT INTO equipment (id,owner_id,name,category,brand,model,year,condition,hours_used,location,description,img_url,daily_rate,weekly_rate,deposit,specs,availability) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id,req.user.id,name,category,brand||null,model||null,year||null,condition||'Good',hours_used||0,location,description||null,img_url||null,daily_rate,weekly_rate||daily_rate*5.5,deposit||0,JSON.stringify(specs||[]),availability||'now']);
    res.status(201).json({id,message:'Listed!'});
  } catch(e){console.error(e);res.status(500).json({error:'Failed'});}
});

router.patch('/:id/book-dates', (req,res) => {
  try {
    const equip = get('SELECT booked_dates FROM equipment WHERE id=?',[req.params.id]);
    if (!equip) return res.status(404).json({error:'Not found'});
    const existing = JSON.parse(equip.booked_dates||'[]');
    const merged = [...new Set([...existing,...(req.body.dates||[])])];
    run('UPDATE equipment SET booked_dates=? WHERE id=?',[JSON.stringify(merged),req.params.id]);
    res.json({booked_dates:merged});
  } catch(e){res.status(500).json({error:'Failed'});}
});

module.exports = router;
