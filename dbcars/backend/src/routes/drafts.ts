import express, { Request, Response } from 'express';
import pool from '../config/database';

const router = express.Router();

// Get all drafts
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, customer_name, vehicle_name, total_price, created_at, updated_at
       FROM booking_drafts
       ORDER BY updated_at DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ error: 'Failed to fetch drafts' });
  }
});

// Get a single draft by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT id, draft_data, customer_name, vehicle_name, total_price, created_at, updated_at FROM booking_drafts WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    
    // Parse draft_data if it's a string (PostgreSQL JSONB sometimes returns as string)
    const draft = result.rows[0];
    if (typeof draft.draft_data === 'string') {
      try {
        draft.draft_data = JSON.parse(draft.draft_data);
      } catch (e) {
        // If parsing fails, keep as is
      }
    }
    
    res.json(draft);
  } catch (error) {
    console.error('Error fetching draft:', error);
    res.status(500).json({ error: 'Failed to fetch draft' });
  }
});

// Create or update a draft
router.post('/', async (req: Request, res: Response) => {
  try {
    const { id, draft_data, customer_name, vehicle_name, total_price } = req.body;
    
    // Validate required fields
    if (!draft_data) {
      return res.status(400).json({ error: 'draft_data is required' });
    }
    
    // If ID is provided, update existing draft
    if (id) {
      const updateResult = await pool.query(
        `UPDATE booking_drafts
         SET draft_data = $1::jsonb, customer_name = $2, vehicle_name = $3, total_price = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING id, draft_data, customer_name, vehicle_name, total_price, created_at, updated_at`,
        [JSON.stringify(draft_data), customer_name || null, vehicle_name || null, total_price || null, id]
      );
      
      if (updateResult.rows.length === 0) {
        return res.status(404).json({ error: 'Draft not found' });
      }
      
      // Parse draft_data if it's a string (PostgreSQL JSONB sometimes returns as string)
      const draft = updateResult.rows[0];
      if (typeof draft.draft_data === 'string') {
        try {
          draft.draft_data = JSON.parse(draft.draft_data);
        } catch (e) {
          // If parsing fails, keep as is
        }
      }
      
      return res.json(draft);
    }
    
    // Create new draft
    const insertResult = await pool.query(
      `INSERT INTO booking_drafts (draft_data, customer_name, vehicle_name, total_price)
       VALUES ($1::jsonb, $2, $3, $4)
       RETURNING id, draft_data, customer_name, vehicle_name, total_price, created_at, updated_at`,
      [JSON.stringify(draft_data), customer_name || null, vehicle_name || null, total_price || null]
    );
    
    // Parse draft_data if it's a string (PostgreSQL JSONB sometimes returns as string)
    const newDraft = insertResult.rows[0];
    if (typeof newDraft.draft_data === 'string') {
      try {
        newDraft.draft_data = JSON.parse(newDraft.draft_data);
      } catch (e) {
        // If parsing fails, keep as is
      }
    }
    
    res.status(201).json(newDraft);
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

// Delete a draft
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM booking_drafts WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Draft not found' });
    }
    
    res.json({ message: 'Draft deleted successfully', id });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ error: 'Failed to delete draft' });
  }
});

export default router;
