export function formatDatabaseError(error) {
  const name = error?.name || '';
  const message = error?.message || '';
  const quotaProblem = name === 'QuotaExceededError' || /quota|penuh/i.test(message);
  const reason = quotaProblem
    ? 'Penyimpanan browser penuh sehingga database lokal tidak dapat dibuka.'
    : 'Database lokal gagal dibuka.';
  return `${reason} Muat ulang aplikasi. Jika masih gagal, kosongkan ruang penyimpanan lalu coba lagi.`;
}
