export default function formatPrice(amount) {
  const price = (amount / 100).toFixed(2);
  return price.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}
