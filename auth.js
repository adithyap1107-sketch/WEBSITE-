const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { run, get } = require('../db');
const { auth } = require('../middleware/auth');
const JWT_SECRET = process.env.JWT_SECRET || 'agrishare_dev_secret';

router.post('/register', (req, res) => {
  try {
    const { name, phone, email, password, location, role } = req.body;
    if (!name||!phone||!password) return res.status(400).json({error:'name, phone, password required'});
    if (password.length<6) return res.status(400).json({error:'Password must be 6+ chars'});
    const existing = get('SELECT id FROM users WHERE phone=?',[phone]);
    if (existing) return res.status(409).json({error:'Phone already registered'});
    const id = uuidv4();
    run(`INSERT INTO users (id,name,phone,email,password,location,role) VALUES (?,?,?,?,?,?,?)`,
      [id,name,phone,email||null,bcrypt.hashSync(password,10),location||null,role||'farmer']);
    const token = jwt.sign({id,name,phone,role:role||'farmer'},JWT_SECRET,{expiresIn:'30d'});
    res.status(201).json({token,user:{id,name,phone,email,role:role||'farmer',location}});
  } catch(e){console.error(e);res.status(500).json({error:'Registration failed'});}
});

router.post('/login', (req, res) => {
  try {
    const {phone,password} = req.body;
    if (!phone||!password) return res.status(400).json({error:'phone and password required'});
    const user = get('SELECT * FROM users WHERE phone=?',[phone]);
    if (!user||!bcrypt.compareSync(password,user.password)) return res.status(401).json({error:'Invalid credentials'});
    const token = jwt.sign({id:user.id,name:user.name,phone:user.phone,role:user.role},JWT_SECRET,{expiresIn:'30d'});
    const {password:_,...safe} = user;
    res.json({token,user:safe});
  } catch(e){console.error(e);res.status(500).json({error:'Login failed'});}
});

router.get('/me', auth, (req,res) => {
  const user = get('SELECT id,name,phone,email,location,role,created_at FROM users WHERE id=?',[req.user.id]);
  if (!user) return res.status(404).json({error:'Not found'});
  res.json(user);
});

module.exports = router;
