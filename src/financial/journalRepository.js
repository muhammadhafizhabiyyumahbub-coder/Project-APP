import { db, initializeDatabase } from '../storage/database';
import { validateAccountCode } from './accounts';

// Journal entry structure:
// {
//   id: string (unique ID)
//   journalNumber: string (user-visible number)
//   transactionDate: ISO date string
//   description: string
//   reference: string (transaction type/ID reference)
//   idempotencyKey: string (prevents duplicate posting)
//   entries: [
//     { accountCode: string, debit: number, credit: number },
//     ...
//   ]
//   postedAt: ISO timestamp
//   status: 'DRAFT' | 'POSTED'
// }

function validateJournalEntry(entry) {
  if (!entry?.journalNumber || !entry?.transactionDate) {
    throw new Error('Journal entry memerlukan journalNumber dan transactionDate.');
  }

  if (!Array.isArray(entry.entries) || entry.entries.length === 0) {
    throw new Error('Journal entry harus memiliki setidaknya satu line item.');
  }

  // Validate account codes and monetary lines.
  entry.entries.forEach(line => {
    validateAccountCode(line.accountCode);
    const debit = line.debit || 0;
    const credit = line.credit || 0;
    if (!Number.isInteger(debit) || !Number.isInteger(credit) || debit < 0 || credit < 0 || !Number.isFinite(debit) || !Number.isFinite(credit) || (debit > 0 && credit > 0)) {
      throw new Error('Nilai debit dan kredit harus berupa bilangan rupiah bulat valid.');
    }
  });

  // Calculate totals
  const totalDebit = entry.entries.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = entry.entries.reduce((sum, line) => sum + (line.credit || 0), 0);

  // Must be balanced
  if (totalDebit !== totalCredit) {
    throw new Error(
      `Journal tidak seimbang: debit ${totalDebit} ≠ kredit ${totalCredit}`
    );
  }

  return entry;
}

export async function createJournal(journalData) {
  await initializeDatabase();
  
  const journal = {
    id: journalData.id || `J${Date.now()}`,
    journalNumber: journalData.journalNumber,
    transactionDate: journalData.transactionDate,
    description: journalData.description || '',
    reference: journalData.reference || '',
    idempotencyKey: journalData.idempotencyKey || `IDK${Date.now()}${Math.random()}`,
    entries: journalData.entries || [],
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
  };

  const validated = validateJournalEntry(journal);
  await db.journals.put(validated);
  return validated;
}

export async function postJournal(journalId) {
  await initializeDatabase();

  const journal = await db.journals.get(journalId);
  if (!journal) {
    throw new Error(`Journal ${journalId} tidak ditemukan.`);
  }

  if (journal.status === 'POSTED') {
    throw new Error(`Journal ${journalId} sudah diposting.`);
  }

  // Check if already posted by idempotency key
  const existingPosted = await db.journals
    .where('idempotencyKey')
    .equals(journal.idempotencyKey)
    .first();

  if (existingPosted && existingPosted.status === 'POSTED') {
    return existingPosted;
  }

  journal.status = 'POSTED';
  journal.postedAt = new Date().toISOString();

  await db.transaction('rw', db.journals, db.auditTrail, async () => {
    await db.journals.put(journal);
    await db.auditTrail.put({
      id: `AUDIT-${journal.id}-POSTED`,
      entityId: journal.id,
      action: 'POSTED',
      reference: journal.reference,
      createdAt: journal.postedAt,
      before: { status: 'DRAFT' },
      after: { status: 'POSTED' },
    });
  });
  return journal;
}

export async function getJournal(journalId) {
  await initializeDatabase();
  return db.journals.get(journalId);
}

export async function listJournals(filters = {}) {
  await initializeDatabase();
  let query = db.journals;

  if (filters.status) {
    query = query.where('status').equals(filters.status);
  }

  if (filters.reference) {
    query = query.where('reference').equals(filters.reference);
  }

  return query.toArray();
}

export async function getJournalByIdempotencyKey(idempotencyKey) {
  await initializeDatabase();
  return db.journals
    .where('idempotencyKey')
    .equals(idempotencyKey)
    .first();
}

export async function reverseJournal(journalId, reason = '') {
  await initializeDatabase();

  const original = await db.journals.get(journalId);
  if (!original) {
    throw new Error(`Journal asal ${journalId} tidak ditemukan.`);
  }

  const reversedEntries = original.entries.map(line => ({
    accountCode: line.accountCode,
    debit: line.credit,
    credit: line.debit,
  }));

  if (original.status !== 'POSTED') {
    throw new Error(`Journal ${journalId} belum diposting.`);
  }

  const reverseJournal = {
    id: `J${Date.now()}`,
    journalNumber: `REV-${original.journalNumber}`,
    transactionDate: new Date().toISOString().split('T')[0],
    description: `Reversal: ${original.description}`,
    reference: `REVERSE:${original.id}`,
    idempotencyKey: `REV-${original.idempotencyKey}`,
    entries: reversedEntries,
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
  };

  const validated = validateJournalEntry(reverseJournal);
  await db.journals.put(validated);
  return validated;
}
