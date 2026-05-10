const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { run, all } = require('../db');
const { auth, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, (req,res) => {
  try {
    const {owner_name,owner_phone,equipment_type,brand,model,condition,hours_used,location,description,pricing_model,asking_price,min_rental} = req.body;
    if (!owner_name||!owner_phone||!equipment_type||!location) return res.status(400).json({error:'Required fields missing'});
    const id = uuidv4();
    run(`INSERT INTO listings (id,owner_id,owner_name,owner_phone,equipment_type,brand,model,condition,hours_used,location,description,pricing_model,asking_price,min_rental,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'pending')`,
      [id,req.user?.id||null,owner_name,owner_phone,equipment_type,brand||null,model||null,condition||null,hours_used||null,location,description||null,pricing_model||'daily',asking_price||null,min_rental||'1 day minimum']);
    res.status(201).json({id,message:'Submitted! Verification within 24 hours.'});
  } catch(e){console.error(e);res.status(500).json({error:'Submission failed'});}
});

router.get('/', auth, (req,res) => {
  if (req.user.role!=='admin') return res.status(403).json({error:'Admin only'});
  res.json(all('SELECT * FROM listings ORDER BY created_at DESC',[]));
});

module.exports = router;
