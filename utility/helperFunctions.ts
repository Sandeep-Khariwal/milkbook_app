export const formatDate = (date: string | number | Date): string => {
  if (typeof date === 'string' && date.includes('/')) {
    const [d, m, y] = date.split('/').map(Number);

    if (!d || !m || !y) return '';

    const day = String(d).padStart(2, '0');
    const month = String(m).padStart(2, '0');
    const year = String(y).slice(-2);

    return `${day}/${month}/${year}`;
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);

  return `${day}/${month}/${year}`;
};
