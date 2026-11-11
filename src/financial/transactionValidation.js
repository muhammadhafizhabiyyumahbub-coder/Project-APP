export function requireValidAmount(amount, label = 'Jumlah') {
  if (!Number.isInteger(amount) || amount <= 0 || !Number.isFinite(amount)) {
    throw new Error(`${label} harus berupa bilangan rupiah bulat lebih dari 0.`);
  }
}
