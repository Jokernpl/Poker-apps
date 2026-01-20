/**
 * =====================================================
 * AUTH ROUTES
 * =====================================================
 * Registrazione, login, refresh token, logout
 */

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../database/connection';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  authenticateToken,
} from '../middleware/auth';

const router = Router();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10');

// =====================================================
// REGISTER
// =====================================================
/**
 * POST /api/auth/register
 * Crea un nuovo utente
 * Body: { email, password, username }
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username } = req.body;

    // Validazione
    if (!email || !password || !username) {
      res.status(400).json({ error: 'Email, password e username sono obbligatori' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password deve essere almeno 6 caratteri' });
      return;
    }

    if (username.length < 3) {
      res.status(400).json({ error: 'Username deve essere almeno 3 caratteri' });
      return;
    }

    // Check email/username già esistenti
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      res.status(409).json({ error: 'Email o username già in uso' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const userId = uuidv4();

    // Crea utente
    await query(
      'INSERT INTO users (id, email, password_hash, username) VALUES ($1, $2, $3, $4)',
      [userId, email, passwordHash, username]
    );

    // Crea wallet
    await query(
      'INSERT INTO user_wallet (user_id, balance) VALUES ($1, $2)',
      [userId, 1000] // Starting balance
    );

    // Crea stats
    await query(
      'INSERT INTO user_stats (user_id) VALUES ($1)',
      [userId]
    );

    // Genera tokens
    const accessToken = generateAccessToken(userId, email, username);
    const refreshToken = generateRefreshToken(userId);

    res.status(201).json({
      message: 'Utente registrato con successo',
      user: { id: userId, email, username },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error('❌ Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// LOGIN
// =====================================================
/**
 * POST /api/auth/login
 * Autentica un utente
 * Body: { email, password }
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validazione
    if (!email || !password) {
      res.status(400).json({ error: 'Email e password sono obbligatori' });
      return;
    }

    // Trova utente
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      res.status(401).json({ error: 'Credenziali non valide' });
      return;
    }

    const user = userResult.rows[0];

    // Check se bannato
    if (user.is_banned) {
      res.status(403).json({ error: 'Account bannato: ' + user.ban_reason });
      return;
    }

    // Verifica password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      res.status(401).json({ error: 'Credenziali non valide' });
      return;
    }

    // Update last_login
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Genera tokens
    const accessToken = generateAccessToken(user.id, user.email, user.username);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      message: 'Login effettuato',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar_url: user.avatar_url,
      },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// REFRESH TOKEN
// =====================================================
/**
 * POST /api/auth/refresh
 * Genera nuovo access token usando refresh token
 * Body: { refreshToken }
 */
router.post('/refresh', (req: Request, res: Response): void => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ error: 'Refresh token required' });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      res.status(403).json({ error: 'Invalid or expired refresh token' });
      return;
    }

    // Per generare il nuovo access token, abbiamo bisogno di email e username
    // Li recuperiamo dal database
    query('SELECT id, email, username FROM users WHERE id = $1', [decoded.id])
      .then((result) => {
        if (result.rows.length === 0) {
          res.status(404).json({ error: 'User not found' });
          return;
        }

        const user = result.rows[0];
        const newAccessToken = generateAccessToken(user.id, user.email, user.username);

        res.json({
          accessToken: newAccessToken,
          message: 'Token refreshed',
        });
      })
      .catch((error) => {
        console.error('❌ Refresh error:', error);
        res.status(500).json({ error: error.message });
      });
  } catch (error: any) {
    console.error('❌ Refresh error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// ME (Verifica token valido)
// =====================================================
/**
 * GET /api/auth/me
 * Ritorna i dati dell'utente autenticato
 */
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const userResult = await query(
      'SELECT id, email, username, avatar_url, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const walletResult = await query(
      'SELECT balance FROM user_wallet WHERE user_id = $1',
      [userId]
    );

    const user = userResult.rows[0];
    const wallet = walletResult.rows[0] || { balance: 0 };

    res.json({
      user: {
        ...user,
        balance: wallet.balance,
      },
    });
  } catch (error: any) {
    console.error('❌ Me error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
