const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatResumeDate(value: string): string {
  const date = value.trim();
  if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(date)) return value;

  const [yearText, monthText, dayText] = date.split('-');
  const year = Number(yearText);
  if (!year) return value;
  if (monthText === undefined) return yearText;

  const month = Number(monthText);
  if (month < 1 || month > 12) return value;
  const monthName = monthNames[month - 1];
  if (dayText === undefined) return `${monthName} ${yearText}`;

  const day = Number(dayText);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  // Keep incomplete or invalid draft dates readable without normalizing them.
  if (day < 1 || day > daysInMonth[month - 1]) return value;

  const suffix = day >= 11 && day <= 13
    ? 'th'
    : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[day % 10] ?? 'th';
  return `${monthName} ${day}${suffix}, ${yearText}`;
}
