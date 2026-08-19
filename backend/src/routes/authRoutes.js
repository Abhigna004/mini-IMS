import { Router } from 'express';
import { body } from 'express-validator';
import { login } from '../controllers/authController.js';

const router = Router();

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/login', loginValidation, login);

export default router;
