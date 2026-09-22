const db = require('./db');

const facilities = [
  { name: 'Cardio Zone',  description: 'Treadmills, bikes, rowers & ellipticals.', icon: '🏃' },
  { name: 'Strength Area', description: 'Free weights, racks & deadlift platforms.', icon: '🏋️' },
  { name: 'Functional Zone', description: 'Battle ropes, kettlebells & turf.', icon: '⚡' },
  { name: 'Steam & Sauna', description: 'Relax and recover post-workout.', icon: '♨️' }
];

const trainers = [
  { name: 'Aarav Sharma', specialty: 'Strength & Powerlifting', photo: 'https://i.pravatar.cc/150?img=11' },
  { name: 'Priya Verma',   specialty: 'HIIT & Fat Loss',        photo: 'https://i.pravatar.cc/150?img=47' },
  { name: 'Rohan Mehta',   specialty: 'Yoga & Mobility',        photo: 'https://i.pravatar.cc/150?img=12' }
];

const upsertFacility = db.prepare(
  'INSERT OR IGNORE INTO facilities (id, name, description, icon) VALUES (?, ?, ?, ?)'
);
const upsertTrainer = db.prepare(
  'INSERT OR IGNORE INTO trainers (id, name, specialty, photo) VALUES (?, ?, ?, ?)'
);

facilities.forEach((f, i) => upsertFacility.run(i + 1, f.name, f.description, f.icon));
trainers.forEach((t, i) => upsertTrainer.run(i + 1, t.name, t.specialty, t.photo));

const upsertMembership = db.prepare(
  'INSERT OR IGNORE INTO memberships (id, name, price, features) VALUES (?, ?, ?, ?)'
);
const PLANS = require('./plans');
PLANS.forEach((p, i) => {
  upsertMembership.run(i + 1, p.id, p.price, JSON.stringify(p.perks));
});

console.log('Seed complete');

// Seed a demo member so reviewers can log in instantly
const byEmail = db.prepare('SELECT id FROM members WHERE email = ?');
if (!byEmail.get('demo@fitgym.com')) {
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync('demo123', 10);
  db.prepare(
    `INSERT INTO members (name, email, phone, password, membership_plan, status, start_date, expiry_date)
     VALUES (?, ?, ?, ?, ?, 'active', date('now'), date('now', '+30 days'))`
  ).run('Demo Member', 'demo@fitgym.com', '9876543210', hash, 'pro');
  console.log('Demo member created: demo@fitgym.com / demo123');
}