import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { supabase } from '../lib/supabase';

// Strict Domain Schema
export const transactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  merchant: z.string().min(1, "Merchant is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  amount: z.number().positive("Amount must be greater than zero"),
  account: z.string().min(1, "Account is required"),
  status: z.enum(['Cleared', 'Pending']),
  type: z.enum(['expense', 'income'])
});

export type TransactionDTO = z.infer<typeof transactionSchema> & { id: string };

const transactionsRouter = new Hono()
  
  // GET: Fetch all records directly from PostgreSQL via Supabase
  .get('/', async (c) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase GET Error:", error);
      return c.json({ success: false, error: 'Failed to fetch database records' }, 500);
    }

    return c.json({
      success: true,
      data: data as TransactionDTO[],
      timestamp: new Date().toISOString()
    });
  })

  // POST: Validate with Zod, then securely insert into Supabase
  .post(
    '/',
    zValidator('json', transactionSchema, (result, c) => {
      if (!result.success) {
        return c.json({ success: false, error: 'Validation failed', details: result.error.issues }, 400);
      }
    }),
    async (c) => {
      const payload = await c.req.valid('json');
      
      const newRecord: TransactionDTO = {
        id: randomUUID(),
        ...payload
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert([newRecord])
        .select()
        .single();

      if (error) {
        console.error("Supabase POST Error:", error);
        return c.json({ success: false, error: 'Failed to persist record' }, 500);
      }

      return c.json({
        success: true,
        data: data as TransactionDTO
      }, 201);
    }
  )

  // DELETE: Remove record from Supabase
  .delete('/:id', async (c) => {
    const id = c.req.param('id');
    
    const { data, error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error("Supabase DELETE Error:", error);
      return c.json({ success: false, error: 'Failed to delete record' }, 500);
    }

    if (!data || data.length === 0) {
      return c.json({ success: false, error: 'Record not found' }, 404);
    }

    return c.json({ success: true, deletedId: id });
  });

export default transactionsRouter;