/**
 * =====================================================
 * USER ROUTES
 * =====================================================
 * Profilo, statistiche, wallet
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { query } from '../database/connection';

const router = Router();

// =====================================================
// GET USER PROFILE
// =====================================================
/**
 * GET /api/users/:userId
 * Ottiene il profilo di un utente
 */
router.get('/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const userResult = await query(
      'SELECT id, email, username, avatar_url, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const statsResult = await query(
      'SELECT * FROM user_stats WHERE user_id = $1',
      [userId]
    );

    const user = userResult.rows[0];
    const stats = statsResult.rows[0] || null;

    res.json({
      user,
      stats,
    });
  } catch (error: any) {
    console.error('❌ Get user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// UPDATE PROFILE (Only own user)
// =====================================================
/**
 * PUT /api/users/me
 * Aggiorna il profilo dell'utente loggato
 * Body: { username?, avatar_url? }
 */
router.put('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { username, avatar_url } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Validazione
    if (username && username.length < 3) {
      res.status(400).json({ error: 'Username deve essere almeno 3 caratteri' });
      return;
    }

    // Check username già in uso
    if (username) {
      const existingResult = await query(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [username, userId]
      );

      if (existingResult.rows.length > 0) {
        res.status(409).json({ error: 'Username già in uso' });
        return;
      }
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    if (username) {
      updateFields.push(`username = $${paramIndex++}`);
      updateValues.push(username);
    }

    if (avatar_url) {
      updateFields.push(`avatar_url = $${paramIndex++}`);
      updateValues.push(avatar_url);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ error: 'Nessun campo da aggiornare' });
      return;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    updateValues.push(userId);

    const result = await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, username, avatar_url`,
      updateValues
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      message: 'Profilo aggiornato',
      user: result.rows[0],
    });
  } catch (error: any) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// GET USER WALLET
// =====================================================
/**
 * GET /api/users/:userId/wallet
 * Ottiene il wallet dell'utente
 */
router.get('/:userId/wallet', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const walletResult = await query(
      'SELECT balance, total_deposited, total_withdrawn FROM user_wallet WHERE user_id = $1',
      [userId]
    );

    if (walletResult.rows.length === 0) {
      res.status(404).json({ error: 'Wallet not found' });
      return;
    }

    res.json(walletResult.rows[0]);
  } catch (error: any) {
    console.error('❌ Get wallet error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// GET USER STATS
// =====================================================
/**
 * GET /api/users/:userId/stats
 * Ottiene le statistiche dell'utente
 */
router.get('/:userId/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const statsResult = await query('SELECT * FROM user_stats WHERE user_id = $1', [userId]);

    if (statsResult.rows.length === 0) {
      res.status(404).json({ error: 'Stats not found' });
      return;
    }

    res.json(statsResult.rows[0]);
  } catch (error: any) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// GET LEADERBOARD
// =====================================================
/**
 * GET /api/users/leaderboard?limit=10&offset=0
 * Ottiene i top giocatori per win rate
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await query(
      `SELECT 
        u.id, u.username, u.avatar_url,
        s.total_hands_played, s.total_wins, s.win_rate,
        s.biggest_win, s.total_chips_won
      FROM users u
      LEFT JOIN user_stats s ON u.id = s.user_id
      WHERE u.is_active = true AND u.is_banned = false
      ORDER BY s.win_rate DESC, s.total_hands_played DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      leaderboard: result.rows,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('❌ Get leaderboard error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
