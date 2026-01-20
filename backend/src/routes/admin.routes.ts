/**
 * =====================================================
 * ADMIN ROUTES
 * =====================================================
 * Gestione utenti, tavoli, ban, etc
 * NOTE: Per MVP, non c'è autenticazione admin stretta
 * Implementare in FASE 2
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { query } from '../database/connection';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// =====================================================
// BAN USER
// =====================================================
/**
 * POST /api/admin/users/:userId/ban
 * Banna un utente
 * Body: { reason, duration_hours? }
 */
router.post(
  '/users/:userId/ban',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = req.user?.id;
      const { userId } = req.params;
      const { reason, duration_hours } = req.body;

      if (!adminId || !reason) {
        res.status(400).json({ error: 'Admin ID e reason sono obbligatori' });
        return;
      }

      // TODO: Verificare che adminId sia un admin vero
      // Per MVP, tutti gli utenti autenticati possono bannare

      const banId = uuidv4();
      const expiresAt = duration_hours
        ? new Date(Date.now() + duration_hours * 3600000).toISOString()
        : null;

      // Crea ban record
      await query(
        `INSERT INTO bans (id, user_id, banned_by, reason, duration_hours, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [banId, userId, adminId, reason, duration_hours || null, expiresAt]
      );

      // Update user
      await query(
        'UPDATE users SET is_banned = true, ban_reason = $1 WHERE id = $2',
        [reason, userId]
      );

      // Log admin action
      await query(
        `INSERT INTO admin_logs (id, admin_id, action, target_user_id)
         VALUES ($1, $2, $3, $4)`,
        [uuidv4(), adminId, 'BAN_USER', userId]
      );

      res.json({ message: `User ${userId} bannato` });
    } catch (error: any) {
      console.error('❌ Ban user error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// =====================================================
// UNBAN USER
// =====================================================
/**
 * POST /api/admin/users/:userId/unban
 * Sbanna un utente
 */
router.post(
  '/users/:userId/unban',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = req.user?.id;
      const { userId } = req.params;

      if (!adminId) {
        res.status(401).json({ error: 'Not authenticated' });
        return;
      }

      // Update user
      await query(
        'UPDATE users SET is_banned = false, ban_reason = NULL WHERE id = $1',
        [userId]
      );

      // Log admin action
      await query(
        `INSERT INTO admin_logs (id, admin_id, action, target_user_id)
         VALUES ($1, $2, $3, $4)`,
        [uuidv4(), adminId, 'UNBAN_USER', userId]
      );

      res.json({ message: `User ${userId} sbannato` });
    } catch (error: any) {
      console.error('❌ Unban user error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// =====================================================
// ADJUST USER BALANCE
// =====================================================
/**
 * POST /api/admin/users/:userId/adjust-balance
 * Ajusta il balance di un utente (admin only)
 * Body: { amount, reason }
 */
router.post(
  '/users/:userId/adjust-balance',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = req.user?.id;
      const { userId } = req.params;
      const { amount, reason } = req.body;

      if (!adminId || amount === undefined || !reason) {
        res.status(400).json({ error: 'Admin, amount e reason sono obbligatori' });
        return;
      }

      // Update wallet
      const walletResult = await query(
        'UPDATE user_wallet SET balance = balance + $1 WHERE user_id = $2 RETURNING balance',
        [amount, userId]
      );

      if (walletResult.rows.length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Log transaction
      await query(
        `INSERT INTO transactions (id, user_id, type, amount, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), userId, 'ADMIN_ADJUSTMENT', amount, reason]
      );

      // Log admin action
      await query(
        `INSERT INTO admin_logs (id, admin_id, action, target_user_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), adminId, 'ADJUST_BALANCE', userId, JSON.stringify({ amount, reason })]
      );

      res.json({
        message: 'Balance aggiustato',
        new_balance: walletResult.rows[0].balance,
      });
    } catch (error: any) {
      console.error('❌ Adjust balance error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// =====================================================
// GET ALL USERS (Admin)
// =====================================================
/**
 * GET /api/admin/users?limit=50&offset=0
 * Lista di tutti gli utenti
 */
router.get('/users', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await query(
      `SELECT 
        id, email, username, is_active, is_banned, ban_reason, created_at, last_login
      FROM users
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      users: result.rows,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('❌ Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// GET ADMIN LOGS
// =====================================================
/**
 * GET /api/admin/logs?limit=100&offset=0
 * Log di tutte le azioni admin
 */
router.get('/logs', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 500);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await query(
      `SELECT 
        al.id, al.admin_id, al.action, al.target_user_id, al.target_table_id,
        al.created_at,
        u.username as admin_username
      FROM admin_logs al
      LEFT JOIN users u ON al.admin_id = u.id
      ORDER BY al.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      logs: result.rows,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('❌ Get logs error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
