const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateWorkoutPlan } = require('../ai');
const router = express.Router();

const VALID_STATUSES = ['active', 'expired', 'pending'];

function memberToJSON(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    membershipPlan: row.membership_plan,
    membershipStatus: row.status,
    startDate: row.start_date,
    expiryDate: row.expiry_date
  };
}

function membershipToJSON(row) {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    features: JSON.parse(row.features)
  };
}

function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// POST /api/members
router.post('/members', (req, res) => {
  const {
    name, email, phone, membershipPlan,
    membershipStatus = 'active', startDate, expiryDate
  } = req.body || {};

  if (!name || !email || !phone || !membershipPlan) {
    return res.status(400).json({ error: 'name, email, phone and membershipPlan are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }
  if (!/^[0-9]{10}$/.test(String(phone).trim())) {
    return res.status(400).json({ error: 'phone must be a 10-digit number.' });
  }
  if (!VALID_STATUSES.includes(membershipStatus)) {
    return res.status(400).json({ error: `membershipStatus must be one of: ${VALID_STATUSES.join(', ')}.` });
  }

  const plan = db.prepare('SELECT name FROM memberships WHERE name = ?').get(membershipPlan);
  if (!plan) {
    return res.status(400).json({ error: `Unknown membershipPlan '${membershipPlan}'.` });
  }

  const exists = db.prepare('SELECT id FROM members WHERE email = ?').get(String(email).trim().toLowerCase());
  if (exists) {
    return res.status(409).json({ error: 'A member with this email already exists.' });
  }

  const start = startDate || new Date().toISOString().slice(0, 10);
  const expiry = expiryDate || addDays(start, 30);

  try {
    const password = bcrypt.hashSync(Math.random().toString(36).slice(2, 10), 10);
    const info = db.prepare(
      `INSERT INTO members (name, email, phone, password, membership_plan, status, start_date, expiry_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      String(name).trim(),
      String(email).trim().toLowerCase(),
      String(phone).trim(),
      password,
      membershipPlan,
      membershipStatus,
      start,
      expiry
    );
    const row = db.prepare('SELECT * FROM members WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(memberToJSON(row));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create member.' });
  }
});

// GET /api/members/:id
router.get('/members/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'A numeric positive member id is required.' });
  }
  const row = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
  if (!row) {
    return res.status(404).json({ error: 'Member not found.' });
  }
  res.json(memberToJSON(row));
});

// POST /api/memberships
router.post('/memberships', (req, res) => {
  const { name, price, features } = req.body || {};

  if (!name || price === undefined || price === null || !Array.isArray(features) || features.length === 0) {
    return res.status(400).json({ error: 'name, a numeric price and a non-empty features array are required.' });
  }
  if (typeof price !== 'number' || !isFinite(price) || price < 0) {
    return res.status(400).json({ error: 'price must be a non-negative number.' });
  }
  if (features.some((f) => typeof f !== 'string' || !f.trim())) {
    return res.status(400).json({ error: 'features must be an array of non-empty strings.' });
  }

  const exists = db.prepare('SELECT id FROM memberships WHERE name = ?').get(String(name).trim());
  if (exists) {
    return res.status(409).json({ error: 'A membership with this name already exists.' });
  }

  try {
    const info = db.prepare('INSERT INTO memberships (name, price, features) VALUES (?, ?, ?)')
      .run(String(name).trim(), price, JSON.stringify(features.map((f) => f.trim())));
    const row = db.prepare('SELECT * FROM memberships WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(membershipToJSON(row));
  } catch (err) {
    res.status(500).json({ error: 'Failed to create membership.' });
  }
});

// GET /api/memberships
router.get('/memberships', (req, res) => {
  const rows = db.prepare('SELECT * FROM memberships ORDER BY id').all();
  res.json(rows.map(membershipToJSON));
});

// POST /api/workout-assistant — AI-backed weekly plan (key stays server-side)
router.post('/workout-assistant', async (req, res) => {
  const { goal, level, days } = req.body || {};
  const GOALS = ['strength', 'fat-loss', 'muscle', 'fitness'];
  const LEVELS = ['beginner', 'intermediate', 'advanced'];
  const d = Number(days);

  const invalid = [];
  if (!GOALS.includes(goal)) invalid.push('goal (strength|fat-loss|muscle|fitness)');
  if (!LEVELS.includes(level)) invalid.push('level (beginner|intermediate|advanced)');
  if (!Number.isInteger(d) || d < 3 || d > 6) invalid.push('days (integer 3–6)');
  if (invalid.length) {
    return res.status(400).json({ error: `Missing or invalid fields: ${invalid.join(', ')}.` });
  }

  try {
    const plan = await generateWorkoutPlan({ goal, level, days: d });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: 'Workout generation failed. Please try again.' });
  }
});

module.exports = router;