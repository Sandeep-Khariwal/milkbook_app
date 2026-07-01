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


export const parseToDateWithShift = (
  dateStr: string,
  shift: "M" | "E"
): Date => {
  const [day, month, year] = dateStr.split("-").map(Number);

  // convert 2-digit year → 4-digit (assume 20xx)
  const fullYear = 2000 + year;

  // set hours based on shift
  const hours = shift === "M" ? 6 : 18;

  return new Date(fullYear, month - 1, day, hours, 0, 0);
};