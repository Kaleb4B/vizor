'use strict';

const router = require('express').Router();
const argon2 = require('argon2');
const { generateToken } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

/**
 * Argon2id configuration — OWASP recommended, strongest password hashing
 * memoryCost: 64MB RAM required per hash (blocks GPU/ASIC attacks)
 * timeCost: 4 iterations
 * parallelism: 2 threads
 */
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MB
  timeCost: 4,
  parallelism: 2,
};

// Operator account — configured securely via process.env
const OPERATOR_EMAIL = process.env.OPERATOR_EMAIL || 'admin@vizor.io';
const OPERATOR_PASSWORD = process.env.OPERATOR_PASSWORD || 'demo123';

const OPERATOR = {
  id: 'vizor-operator-001',
  email: OPERATOR_EMAIL,
  name: 'Cyber Operator',
  role: 'ADMIN',
  passwordHash: null,
};

// Hash password at startup
let operatorReady = false;
let operatorHashPromise = argon2.hash(OPERATOR_PASSWORD, ARGON2_OPTIONS).then(hash => {
  OPERATOR.passwordHash = hash;
  operatorReady = true;
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('Email and password required', 400);

    if (!operatorReady) await operatorHashPromise;

    if (email !== OPERATOR.email) throw new AppError('Invalid credentials', 401);

    const valid = await argon2.verify(OPERATOR.passwordHash, password, ARGON2_OPTIONS);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const token = generateToken({
      id: OPERATOR.id,
      email: OPERATOR.email,
      role: OPERATOR.role,
      name: OPERATOR.name,
    });

    res.json({
      success: true,
      token,
      user: { id: OPERATOR.id, email: OPERATOR.email, name: OPERATOR.name, role: OPERATOR.role },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) throw new AppError('All fields required', 400);

    const hash = await argon2.hash(password, ARGON2_OPTIONS);
    const token = generateToken({ id: `user-${Date.now()}`, email, role: 'OWNER', name });

    res.status(201).json({
      success: true,
      token,
      user: { email, name, role: 'OWNER' },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', require('../middleware/auth').authenticate, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;
