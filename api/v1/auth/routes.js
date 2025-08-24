import express from 'express';
import { register, login } from './controller.js';
import { validateRegistration, validateLogin } from './validation.js';

const router = express.Router();

// Authentication Routes
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

export default router; 