import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { db, initializeDatabase, resetDatabase } from '../storage/database';
import { createJournal, postJournal } from './journalRepository';
import { getAccountBalance, getTrialBalance } from './financialEngine';

beforeEach(async () => {
  await initializeDatabase();
});

afterEach(async () => {
  await resetDatabase();
});

describe('Financial Engine - Phase 3', () => {
  it('posts capital contribution with balanced journal and correct balances', async () => {
    // RED PHASE: Test modal contribution Rp100,000
    // Expected: Kas +100,000 (debit), Modal +100,000 (credit)
    
    const journal = await createJournal({
      journalNumber: 'JE-001',
      transactionDate: '2026-11-10',
      description: 'Modal awal pemilik',
      reference: 'CAPITAL:INIT',
      idempotencyKey: 'CAPITAL-INIT-001',
      entries: [
        { accountCode: '1010', debit: 100000, credit: 0 },  // Kas debit
        { accountCode: '3000', debit: 0, credit: 100000 },  // Modal credit
      ],
    });

    expect(journal.id).toBeDefined();
    expect(journal.status).toBe('DRAFT');

    // Post the journal
    const posted = await postJournal(journal.id);
    expect(posted.status).toBe('POSTED');
    expect(posted.postedAt).toBeDefined();

    // Verify account balances
    const kasBalance = await getAccountBalance('1010');
    expect(kasBalance).toBe(100000);

    const modalBalance = await getAccountBalance('3000');
    expect(modalBalance).toBe(100000);

    // Verify trial balance is balanced
    const trialBalance = await getTrialBalance();
    expect(trialBalance.isBalanced).toBe(true);
    expect(trialBalance.totalDebit).toBe(100000);
    expect(trialBalance.totalCredit).toBe(100000);
  });

  it('sums every line for an account in one journal', async () => {
    const journal = await createJournal({
      journalNumber: 'JE-MULTI-LINE',
      transactionDate: '2026-11-10',
      description: 'Multiple cash lines',
      entries: [
        { accountCode: '1010', debit: 40000, credit: 0 },
        { accountCode: '1010', debit: 60000, credit: 0 },
        { accountCode: '3000', debit: 0, credit: 100000 },
      ],
    });

    await postJournal(journal.id);

    await expect(getAccountBalance('1010')).resolves.toBe(100000);
  });

  it('prevents duplicate posting with same idempotency key', async () => {
    const journalData = {
      journalNumber: 'JE-002',
      transactionDate: '2026-11-10',
      description: 'Test duplicate prevention',
      idempotencyKey: 'TEST-IDEM-001',
      entries: [
        { accountCode: '1010', debit: 50000, credit: 0 },
        { accountCode: '3000', debit: 0, credit: 50000 },
      ],
    };

    const journal1 = await createJournal(journalData);
    await postJournal(journal1.id);

    // Try to post another journal with same idempotency key
    const journal2 = await createJournal({
      ...journalData,
      id: `J${Date.now()}`, // Different ID
    });
    
    const result = await postJournal(journal2.id);
    
    // Should return the first posted journal, not create duplicate
    expect(result.id).toBe(journal1.id);

    // Verify balance only increased once
    const kasBalance = await getAccountBalance('1010');
    expect(kasBalance).toBe(50000);
  });

  it('writes an audit record when a journal is posted', async () => {
    const journal = await createJournal({
      journalNumber: 'JE-AUDIT',
      transactionDate: '2026-11-10',
      description: 'Audit posting',
      entries: [
        { accountCode: '1010', debit: 10000, credit: 0 },
        { accountCode: '3000', debit: 0, credit: 10000 },
      ],
    });

    await postJournal(journal.id);

    await expect(db.auditTrail.get(`AUDIT-${journal.id}-POSTED`)).resolves.toMatchObject({
      entityId: journal.id,
      action: 'POSTED',
      before: { status: 'DRAFT' },
      after: { status: 'POSTED' },
    });
  });

  it('rejects unbalanced journal entry', async () => {
    await expect(
      createJournal({
        journalNumber: 'JE-BAD',
        transactionDate: '2026-11-10',
        description: 'Unbalanced entry',
        entries: [
          { accountCode: '1010', debit: 100000, credit: 0 },
          { accountCode: '3000', debit: 0, credit: 90000 }, // Not balanced!
        ],
      })
    ).rejects.toThrow('Journal tidak seimbang');
  });

  it('prevents posting already posted journal', async () => {
    const journal = await createJournal({
      journalNumber: 'JE-003',
      transactionDate: '2026-11-10',
      description: 'Test double posting prevention',
      entries: [
        { accountCode: '1010', debit: 25000, credit: 0 },
        { accountCode: '3000', debit: 0, credit: 25000 },
      ],
    });

    await postJournal(journal.id);

    // Try to post again
    await expect(postJournal(journal.id)).rejects.toThrow('sudah diposting');
  });

  it('rolls back transaction on failure', async () => {
    const journal = await createJournal({
      journalNumber: 'JE-004',
      transactionDate: '2026-11-10',
      description: 'Test rollback',
      entries: [
        { accountCode: '1010', debit: 30000, credit: 0 },
        { accountCode: '3000', debit: 0, credit: 30000 },
      ],
    });

    // Use Dexie transaction to test rollback
    await expect(
      db.transaction('rw', db.journals, db.auditTrail, async () => {
        await postJournal(journal.id);
        throw new Error('Simulated failure');
      })
    ).rejects.toThrow('Simulated failure');

    // Verify journal was not posted
    const reloaded = await db.journals.get(journal.id);
    expect(reloaded.status).toBe('DRAFT');

    // Verify no balance change
    const kasBalance = await getAccountBalance('1010');
    expect(kasBalance).toBe(0);
  });
});
