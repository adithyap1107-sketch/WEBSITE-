const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { run, all, get } = require('../db');
const { auth, optionalAuth } = require('../middleware/auth');

function txnId(p){ return p+Date.now().toString().slice(-8)+Math.random().toString(36).slice(2,5).toUpperCase(); }

router.post('/equipment', optionalAuth, (req,res) => {
  try {
    const {equipment_id,renter_name,renter_phone,renter_location,purpose,start_date,end_date,payment_method} = req.body;
    if (!equipment_id||!renter_name||!renter_phone||!start_date||!end_date) return res.status(400).json({error:'Missing required fields'});
    const equip = get('SELECT * FROM equipment WHERE id=?',[equipment_id]);
    if (!equip) return res.status(404).json({error:'Equipment not found'});
    if (equip.availability==='booked') return res.status(409).json({error:'Equipment fully booked'});
    const days = Math.max(1,Math.round((new Date(end_date)-new Date(start_date))/86400000)+1);
    const rental_amount = equip.daily_rate*days;
    const deposit = equip.deposit||0;
    const platform_fee = Math.round(rental_amount*0.05);
    const gst = Math.round((rental_amount+platform_fee)*0.18);
    const total_amount = rental_amount+deposit+platform_fee+gst;
    const tid = txnId('RNT'); const id = uuidv4();
    run(`INSERT INTO bookings (id,type,item_id,renter_id,renter_name,renter_phone,renter_location,purpose,start_date,end_date,days,daily_rate,rental_amount,deposit,platform_fee,gst,total_amount,payment_method,payment_status,txn_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id,'equipment',equipment_id,req.user?.id||null,renter_name,renter_phone,renter_location||null,purpose||null,start_date,end_date,days,equip.daily_rate,rental_amount,deposit,platform_fee,gst,total_amount,payment_method||'upi','completed',tid]);
    const existing = JSON.parse(equip.booked_dates||'[]');
    const newDates=[];
    for(let d=new Date(start_date);d<=new Date(end_date);d.setDate(d.getDate()+1)) newDates.push(d.toISOString().split('T')[0]);
    run('UPDATE equipment SET booked_dates=? WHERE id=?',[JSON.stringify([...new Set([...existing,...newDates])]),equipment_id]);
    res.status(201).json({id,txn_id:tid,total_amount,days,rental_amount,deposit,platform_fee,gst,equipment_name:equip.name,start_date,end_date,message:'Booking confirmed!'});
  } catch(e){console.error(e);res.status(500).json({error:'Booking failed'});}
});

router.post('/labour', optionalAuth, (req,res) => {
  try {
    const {worker_id,renter_name,renter_phone,renter_location,work_description,selected_days,payment_method} = req.body;
    if (!worker_id||!renter_name||!renter_phone||!selected_days?.length) return res.status(400).json({error:'Missing required fields'});
    const worker = get('SELECT * FROM labour_workers WHERE id=?',[worker_id]);
    if (!worker) return res.status(404).json({error:'Worker not found'});
    const days = selected_days.length;
    const rental_amount = worker.daily_rate*days;
    const platform_fee = Math.round(rental_amount*0.08);
    const total_amount = rental_amount+platform_fee;
    const tid = txnId('LBR'); const id = uuidv4();
    run(`INSERT INTO bookings (id,type,item_id,renter_id,renter_name,renter_phone,renter_location,purpose,days,daily_rate,rental_amount,deposit,platform_fee,gst,total_amount,payment_method,payment_status,txn_id,notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,0,?,0,?,?,?,?,?)`,
      [id,'labour',worker_id,req.user?.id||null,renter_name,renter_phone,renter_location||null,work_description||null,days,worker.daily_rate,rental_amount,platform_fee,total_amount,payment_method||'upi','completed',tid,JSON.stringify(selected_days)]);
    run('UPDATE labour_workers SET jobs_done=jobs_done+1 WHERE id=?',[worker_id]);
    res.status(201).json({id,txn_id:tid,total_amount,days,rental_amount,platform_fee,worker_name:worker.name,selected_days,message:'Booking confirmed!'});
  } catch(e){console.error(e);res.status(500).json({error:'Booking failed'});}
});

router.post('/token', optionalAuth, (req,res) => {
  try {
    const {product_id,token_nums,buyer_name,buyer_phone,buyer_location,payment_method,token_price} = req.body;
    if (!product_id||!token_nums?.length||!buyer_name||!buyer_phone) return res.status(400).json({error:'Missing required fields'});
    const price = token_price||0;
    const base = price*token_nums.length;
    const platform_fee = Math.round(base*0.02);
    const gst = Math.round((base+platform_fee)*0.18);
    const total_amount = base+platform_fee+gst;
    const tid = txnId('AGS'); const id = uuidv4();
    run(`INSERT INTO bookings (id,type,item_id,renter_id,renter_name,renter_phone,renter_location,days,daily_rate,rental_amount,deposit,platform_fee,gst,total_amount,payment_method,payment_status,txn_id,notes) VALUES (?,?,?,?,?,?,?,?,?,?,0,?,?,?,?,?,?,?)`,
      [id,'token',product_id,req.user?.id||null,buyer_name,buyer_phone,buyer_location||null,token_nums.length,price,base,platform_fee,gst,total_amount,payment_method||'upi','completed',tid,JSON.stringify(token_nums)]);
    res.status(201).json({id,txn_id:tid,total_amount,base,platform_fee,gst,token_nums,message:'Token purchase confirmed!'});
  } catch(e){console.error(e);res.status(500).json({error:'Purchase failed'});}
});

router.get('/my', auth, (req,res) => {
  const rows = all('SELECT * FROM bookings WHERE renter_id=? ORDER BY created_at DESC',[req.user.id]);
  res.json(rows);
});

router.get('/:txn_id', (req,res) => {
  const row = get('SELECT * FROM bookings WHERE txn_id=?',[req.params.txn_id]);
  if (!row) return res.status(404).json({error:'Not found'});
  res.json(row);
});

module.exports = router;
