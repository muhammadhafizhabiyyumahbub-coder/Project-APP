import 'fake-indexeddb/auto';
import { afterEach, describe, expect, it } from 'vitest';
import { resetDatabase } from './database';
import { deleteEmployee, getEmployee, listEmployees, saveEmployee } from './employeeRepository';

afterEach(resetDatabase);

describe('employee repository', () => {
  it('supports CRUD and trims names', async () => {
    await saveEmployee({ id: 'EMP-001', nama: ' Kasir 1 ' });
    await expect(getEmployee('EMP-001')).resolves.toMatchObject({ nama: 'Kasir 1' });
    await saveEmployee({ id: 'EMP-001', nama: 'Kasir Utama' });
    await expect(listEmployees()).resolves.toHaveLength(1);
    await deleteEmployee('EMP-001');
    await expect(getEmployee('EMP-001')).resolves.toBeUndefined();
  });

  it('rejects missing name', async () => {
    await expect(saveEmployee({ id: 'EMP-002', nama: ' ' })).rejects.toThrow('Karyawan memerlukan id dan nama.');
  });
});
