const { initDb, run, get, persist } = require('./db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function seed() {
  await initDb();

  const count = get('SELECT COUNT(*) as c FROM equipment');
  if (count && count.c > 0) { console.log('Already seeded.'); return; }

  console.log('Seeding...');
  const adminId = uuidv4();
  const pw = bcrypt.hashSync('admin123', 10);
  try {
    run(`INSERT OR IGNORE INTO users (id,name,phone,email,password,role,location) VALUES (?,?,?,?,?,?,?)`,
      [adminId,'AgriShare Admin','9999999999','admin@agrishare.in',pw,'admin','Bengaluru, Karnataka']);
  } catch(e) { console.log('Admin user exists'); }

  const eq = [
    ['John Deere 5050D Tractor','tractor','John Deere','5050D',2021,'Excellent',320,'Ludhiana, Punjab','Well-maintained 50 HP 4WD tractor ideal for ploughing and transportation.','https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/John_Deere_5055E.jpg/640px-John_Deere_5055E.jpg',2800,16800,5000,'["50 HP","4WD","With Operator"]','now'],
    ['Mahindra JIVO 245 DI','tractor','Mahindra','JIVO 245 DI',2022,'Good',180,'Amritsar, Punjab','Compact 24 HP mini-tractor, fuel-efficient, self-drive.','https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Mahindra_Tractor.jpg/640px-Mahindra_Tractor.jpg',1400,8000,3000,'["24 HP","Mini Tractor","Self-Drive"]','now'],
    ['CLAAS Crop Tiger 40','harvester','CLAAS','Crop Tiger 40',2020,'Good',850,'Patiala, Punjab','Combine harvester, 2 acres/hour, wheat and paddy.','https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/CLAAS_combine_harvester.jpg/640px-CLAAS_combine_harvester.jpg',8500,50000,15000,'["40 HP","2 ac/hr","Wheat & Paddy"]','booked'],
    ['KisanKraft Spray Drone 10L','drone','KisanKraft','AG-10L',2023,'Excellent',90,'Nashik, Maharashtra','GPS-guided spray drone with certified pilot.','https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/XAG_P100_Pro_Agriculture_Drone.jpg/640px-XAG_P100_Pro_Agriculture_Drone.jpg',3500,20000,8000,'["10L Tank","10 ac/hr","GPS Guided"]','now'],
    ['DJI Agras T40 Pro','drone','DJI','Agras T40',2023,'Excellent',45,'Indore, M.P.','AI-guided heavy-lift spray drone, 40L capacity.','https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/XAG_P100_Pro_Agriculture_Drone.jpg/640px-XAG_P100_Pro_Agriculture_Drone.jpg',5500,32000,12000,'["40L Tank","20 ac/hr","AI Obstacle Avoid"]','now'],
    ['Kirloskar Pump Set 7.5HP','irrigation','Kirloskar','Star-2',2021,'Good',430,'Jaipur, Rajasthan','Diesel pump with 500m pipe for flood and drip irrigation.','https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Drip_irrigation_Ventura.jpg/640px-Drip_irrigation_Ventura.jpg',600,3500,2000,'["7.5 HP Diesel","500m Pipe","Flood/Drip"]','now'],
    ['Jain Drip Irrigation Kit','irrigation','Jain Irrigation','5-Acre Kit',2022,'Excellent',0,'Pune, Maharashtra','Complete drip system for 5 acres, saves 50% water.','https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Drip_irrigation_p1040042.jpg/640px-Drip_irrigation_p1040042.jpg',900,5200,3500,'["5 Acres","Drip + Sprinkler","Filter Included"]','soon'],
    ['Fieldking Rotavator 7ft','implement','Fieldking','FKT-7',2021,'Good',560,'Ahmedabad, Gujarat','Heavy-duty rotavator, compatible with 35+ HP tractors.','https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Rotary_tiller.jpg/640px-Rotary_tiller.jpg',1200,7000,2500,'["7ft Width","35+ HP Required","Tractor-Mount"]','now'],
    ['New Holland TC5.30 Harvester','harvester','New Holland','TC5.30',2019,'Good',1200,'Moga, Punjab','Large combine harvester, 130HP, 5 acres/hour with operator.','https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/New_Holland_combine.jpg/640px-New_Holland_combine.jpg',12000,70000,25000,'["130 HP","5 ac/hr","Wheat/Soybean/Paddy"]','now'],
  ];

  for (const e of eq) {
    run(`INSERT INTO equipment (id,owner_id,name,category,brand,model,year,condition,hours_used,location,description,img_url,daily_rate,weekly_rate,deposit,specs,availability) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [uuidv4(), adminId, ...e]);
  }

  const lw = [
    ['Ramesh Yadav','RY','#5DBD7A','Senior Harvesting Expert','Amritsar, Punjab',4.9,138,'14 yrs',312,750,'["harvest","general"]','["Wheat","Paddy","Mustard"]','["Mon","Tue","Wed","Thu","Fri"]','Specialist in wheat and paddy harvesting.','9876501001'],
    ['Sunita Devi','SD','#D4A853','Sowing & Transplanting','Varanasi, U.P.',4.8,92,'9 yrs',211,580,'["sowing","general"]','["Rice","Vegetables","Pulses"]','["Mon","Wed","Fri","Sat"]','Expert in kharif and rabi crop sowing.','9876501002'],
    ['Mohan Patel','MP','#7db8e8','Tractor & Machine Operator','Indore, M.P.',4.7,74,'11 yrs',186,900,'["operator","general"]','["Tractor","Rotavator","Ploughing"]','["Tue","Thu","Fri","Sat","Sun"]','Licensed heavy machinery operator.','9876501003'],
    ['Kavitha Reddy','KR','#b87dde','Pesticide & Spray Specialist','Nashik, Maharashtra',4.9,115,'7 yrs',248,700,'["pesticide","general"]','["Grapes","Cotton","Onion"]','["Mon","Tue","Wed","Thu"]','Certified in safe pesticide handling.','9876501004'],
    ['Arjun Meena','AM','#e87d7d','Irrigation & Water Management','Jaipur, Rajasthan',4.6,63,'8 yrs',142,620,'["irrigation","general"]','["Drip","Sprinkler","Flood"]','["Mon","Wed","Thu","Sat"]','Expert in drip and sprinkler systems.','9876501005'],
    ['Lakshmi Nair','LN','#5DBD7A','General Farm Labour','Thrissur, Kerala',4.8,201,'16 yrs',530,540,'["harvest","sowing","general"]','["Paddy","Coconut","Banana"]','["Mon","Tue","Wed","Thu","Fri","Sat"]','Experienced across all Kerala farm operations.','9876501006'],
    ['Deepak Singh','DS','#D4A853','Drone Operator & Field Tech','Ludhiana, Punjab',4.7,58,'3 yrs',97,1100,'["operator","pesticide"]','["DJI Agras","XAG","GPS Mapping"]','["Wed","Thu","Fri","Sat","Sun"]','Certified DJI agricultural drone pilot.','9876501007'],
    ['Geeta Bai','GB','#7db8e8','Weeding & Land Prep','Bhopal, M.P.',4.5,44,'6 yrs',89,490,'["general","sowing"]','["Weeding","Transplanting","Planting"]','["Mon","Tue","Thu","Sat"]','Efficient in manual weeding and transplanting.','9876501008'],
  ];

  for (const l of lw) {
    run(`INSERT INTO labour_workers (id,name,initials,color,role,location,rating,reviews,experience,jobs_done,daily_rate,skills,tags,avail_days,bio,phone) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [uuidv4(), ...l]);
  }

  persist();
  console.log('✅ Seeded successfully!');
}

module.exports = { seed };
if (require.main === module) seed().catch(console.error);
