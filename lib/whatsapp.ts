export function buildWhatsAppLink(phone: string, text: string) {
  const normalized = phone.replace(/\D/g, '');
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}
