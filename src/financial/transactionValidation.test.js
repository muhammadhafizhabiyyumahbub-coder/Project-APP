import { describe, expect, it } from 'vitest';
import { requireValidAmount } from './transactionValidation';

describe('transactionValidation', () => {
  it('passes for valid positive integers', () => {
    expect(() => requireValidAmount(1000)).not.toThrow();
    expect(() => requireValidAmount(1)).not.toThrow();
  });

  it('throws for non-integers', () => {
    expect(() => requireValidAmount(1000.5)).toThrow(/bulat/);
    expect(() => requireValidAmount(1000.00001)).toThrow(/bulat/);
  });

  it('throws for zero or negative', () => {
    expect(() => requireValidAmount(0)).toThrow(/lebih dari 0/);
    expect(() => requireValidAmount(-1000)).toThrow(/lebih dari 0/);
  });

  it('throws for NaN, Infinity', () => {
    expect(() => requireValidAmount(NaN)).toThrow();
    expect(() => requireValidAmount(Infinity)).toThrow();
  });

  it('uses custom label in error message', () => {
    expect(() => requireValidAmount(-1, 'Harga')).toThrow(/Harga harus/);
  });
});