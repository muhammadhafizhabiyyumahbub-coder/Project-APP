export function normalizeCategory(value) {
  return String(value || '').trim().toLowerCase();
}

export function normalizeSearch(value) {
  return String(value || '').trim().toLowerCase();
}

export function matchesProduct(product, query = '', category = '') {
  const search = normalizeSearch(query);
  const categoryKey = normalizeCategory(category);
  const name = normalizeSearch(product?.nama);
  const sku = normalizeSearch(product?.sku);
  return (!search || name.includes(search) || sku.includes(search))
    && (!categoryKey || normalizeCategory(product?.kategori) === categoryKey);
}

export function listProductCategories(products = []) {
  return Array.from(new Map(products
    .map(product => String(product?.kategori || '').trim())
    .filter(Boolean)
    .map(category => [normalizeCategory(category), category])).values());
}
