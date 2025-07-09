export function formatPrice(price?: string): string {
  if (!price) return 'Check website';

  const cleaned = price.replace(/₹/g, '').trim(); // Remove ₹ if present

  if (/\d/.test(cleaned)) {
    return `Rs. ${cleaned}`;
  }

  return 'Check website';
}