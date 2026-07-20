const IST_OFFSET_MINUTES = 5 * 60 + 30;

const istDateParts = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
};

const dayBoundsFromParts = ({ year, month, day }) => {
  const start = new Date(
    Date.UTC(year, month - 1, day, 0, -IST_OFFSET_MINUTES),
  );
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { start, end };
};

/** Returns the start and end of the calendar day in Asia/Kolkata. */
export const getIstDayBounds = (value = new Date()) => {
  const parts = istDateParts(value);
  if (!parts) return null;
  return dayBoundsFromParts(parts);
};

/** Parses a YYYY-MM-DD calendar date as an Asia/Kolkata date. */
export const parseIstDate = (value) => {
  if (typeof value !== 'string') return new Date(Number.NaN);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return new Date(Number.NaN);

  const [, year, month, day] = match;
  const result = dayBoundsFromParts({
    year: Number(year),
    month: Number(month),
    day: Number(day),
  }).start;

  // Reject values normalized by JavaScript, such as 2026-02-30.
  const verified = istDateParts(result);
  if (
    !verified ||
    verified.year !== Number(year) ||
    verified.month !== Number(month) ||
    verified.day !== Number(day)
  ) {
    return new Date(Number.NaN);
  }
  return result;
};
