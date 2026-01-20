/**
 * =====================================================
 * DATABASE CONNECTION
 * =====================================================
 * Pool di connessioni PostgreSQL
 */

import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'poker_user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'poker_game_db',
});

/**
 * Inizializza il database (crea tabelle se non esistono)
 */
export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    // Esegui il file migrations.sql
    const fs = require('fs');
    const path = require('path');
    const migrationPath = path.join(__dirname, 'migrations.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    await client.query(sql);
    console.log('✅ Database migrations eseguite');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Esegui query sul database
 */
export async function query(text: string, params?: any[]): Promise<any> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Query eseguita', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
}

/**
 * Get a client per transazioni
 */
export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

/**
 * Chiudi la connessione
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

export default pool;
