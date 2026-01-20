/**
 * =====================================================
 * GAME ROUTES
 * =====================================================
 * Creazione tavoli, lista tavoli, join/leave
 */

import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { query } from '../database/connection';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// =====================================================
// GET AVAILABLE TABLES
// =====================================================
/**
 * GET /api/game/tables?limit=20&offset=0
 * Lista i tavoli disponibili
 */
router.get('/tables', async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await query(
      `SELECT 
        t.id, t.name, t.table_type, t.status,
        t.small_blind, t.big_blind, t.min_buy_in, t.max_buy_in,
        t.max_players, t.current_players,
        u.username as created_by,
        COUNT(ts.id) as seated_players
      FROM tables t
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN table_seats ts ON t.id = ts.table_id AND ts.is_active = true
      WHERE t.status IN ('WAITING', 'PLAYING')
      GROUP BY t.id, u.username
      ORDER BY t.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      tables: result.rows,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error('❌ Get tables error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// GET TABLE DETAILS
// =====================================================
/**
 * GET /api/game/tables/:tableId
 * Dettagli di un tavolo specifico
 */
router.get('/tables/:tableId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { tableId } = req.params;

    const tableResult = await query('SELECT * FROM tables WHERE id = $1', [tableId]);

    if (tableResult.rows.length === 0) {
      res.status(404).json({ error: 'Table not found' });
      return;
    }

    const seatsResult = await query(
      `SELECT ts.*, u.username, u.avatar_url 
       FROM table_seats ts
       LEFT JOIN users u ON ts.user_id = u.id
       WHERE ts.table_id = $1
       ORDER BY ts.seat_number`,
      [tableId]
    );

    res.json({
      table: tableResult.rows[0],
      seats: seatsResult.rows,
    });
  } catch (error: any) {
    console.error('❌ Get table error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// CREATE TABLE
// =====================================================
/**
 * POST /api/game/tables
 * Crea un nuovo tavolo
 * Body: { name, table_type, small_blind, big_blind, min_buy_in, max_buy_in }
 */
router.post('/tables', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, table_type, small_blind, big_blind, min_buy_in, max_buy_in } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Validazione
    if (!name || !table_type || small_blind === undefined || big_blind === undefined) {
      res.status(400).json({ error: 'Campi obbligatori: name, table_type, small_blind, big_blind' });
      return;
    }

    if (big_blind <= small_blind) {
      res.status(400).json({ error: 'Big blind deve essere > small blind' });
      return;
    }

    const tableId = uuidv4();

    const result = await query(
      `INSERT INTO tables 
       (id, name, table_type, small_blind, big_blind, min_buy_in, max_buy_in, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [tableId, name, table_type, small_blind, big_blind, min_buy_in, max_buy_in, userId]
    );

    res.status(201).json({
      message: 'Tavolo creato',
      table: result.rows[0],
    });
  } catch (error: any) {
    console.error('❌ Create table error:', error);
    res.status(500).json({ error: error.message });
  }
});

// =====================================================
// JOIN TABLE
// =====================================================
/**
 * POST /api/game/tables/:tableId/join
 * Join a un tavolo
 * Body: { seat_number, buy_in }
 */
router.post(
  '/tables/:tableId/join',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { tableId } = req.params;
      const { seat_number, buy_in } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Validazione
      if (!seat_number || !buy_in) {
        res.status(400).json({ error: 'seat_number e buy_in sono obbligatori' });
        return;
      }

      if (seat_number < 1 || seat_number > 9) {
        res.status(400).json({ error: 'Seat number deve essere tra 1 e 9' });
        return;
      }

      // Check tavolo esiste
      const tableResult = await query('SELECT * FROM tables WHERE id = $1', [tableId]);

      if (tableResult.rows.length === 0) {
        res.status(404).json({ error: 'Table not found' });
        return;
      }

      const table = tableResult.rows[0];

      // Validazione buy-in
      if (buy_in < table.min_buy_in || buy_in > table.max_buy_in) {
        res.status(400).json({
          error: `Buy-in deve essere tra ${table.min_buy_in} e ${table.max_buy_in}`,
        });
        return;
      }

      // Check wallet
      const walletResult = await query('SELECT balance FROM user_wallet WHERE user_id = $1', [
        userId,
      ]);

      if (walletResult.rows.length === 0 || walletResult.rows[0].balance < buy_in) {
        res.status(400).json({ error: 'Saldo insufficiente' });
        return;
      }

      // Check seat disponibile
      const seatResult = await query(
        'SELECT id FROM table_seats WHERE table_id = $1 AND seat_number = $2',
        [tableId, seat_number]
      );

      if (seatResult.rows.length > 0) {
        res.status(400).json({ error: 'Seat già occupato' });
        return;
      }

      // Crea seat
      const seatId = uuidv4();
      await query(
        `INSERT INTO table_seats (id, table_id, user_id, seat_number, chip_stack)
         VALUES ($1, $2, $3, $4, $5)`,
        [seatId, tableId, userId, seat_number, buy_in]
      );

      // Decrementa wallet
      await query('UPDATE user_wallet SET balance = balance - $1 WHERE user_id = $2', [
        buy_in,
        userId,
      ]);

      // Update player count
      await query(
        'UPDATE tables SET current_players = current_players + 1 WHERE id = $1',
        [tableId]
      );

      res.status(201).json({
        message: 'Sei entrato al tavolo',
        seat_id: seatId,
        chip_stack: buy_in,
      });
    } catch (error: any) {
      console.error('❌ Join table error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// =====================================================
// LEAVE TABLE
// =====================================================
/**
 * POST /api/game/tables/:tableId/leave
 * Lascia un tavolo
 */
router.post(
  '/tables/:tableId/leave',
  authenticateToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { tableId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Check seat
      const seatResult = await query(
        'SELECT * FROM table_seats WHERE table_id = $1 AND user_id = $2',
        [tableId, userId]
      );

      if (seatResult.rows.length === 0) {
        res.status(404).json({ error: 'Non sei seduto a questo tavolo' });
        return;
      }

      const seat = seatResult.rows[0];

      // Aggiungi chip al wallet
      await query(
        'UPDATE user_wallet SET balance = balance + $1 WHERE user_id = $2',
        [seat.chip_stack, userId]
      );

      // Elimina seat
      await query('DELETE FROM table_seats WHERE id = $1', [seat.id]);

      // Decrementa player count
      await query(
        'UPDATE tables SET current_players = current_players - 1 WHERE id = $1',
        [tableId]
      );

      res.json({ message: 'Hai lasciato il tavolo', cash_out: seat.chip_stack });
    } catch (error: any) {
      console.error('❌ Leave table error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
