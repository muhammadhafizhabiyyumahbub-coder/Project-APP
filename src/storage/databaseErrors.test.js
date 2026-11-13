import { describe, expect, it } from 'vitest';
import { formatDatabaseError } from './databaseErrors';

describe('database errors', () => {
  it('explains quota failures in Indonesian', () => {
    expect(formatDatabaseError({ name: 'QuotaExceededError', message: 'quota' })).toContain('Penyimpanan browser penuh');
  });

  it('falls back to a generic Indonesian message', () => {
    const message = formatDatabaseError(new Error('UnknownError'));
    expect(message).toContain('Database lokal gagal dibuka');
    expect(message).toContain('Muat ulang aplikasi');
  });
});
