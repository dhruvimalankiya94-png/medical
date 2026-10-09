/**
 * Calendar-day helpers.
 *
 * Date keys must be derived in the server's local timezone. Using
 * `toISOString().split('T')[0]` converts to UTC first, so in any timezone ahead
 * of UTC a local midnight lands on the previous calendar day, while a task
 * logged at midday lands on the correct one. Mixing the two shifted streaks and
 * the progress heatmap by a day for every user east of Greenwich.
 */

/** Format a date as YYYY-MM-DD using local calendar fields. */
const toDateKey = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Local midnight at the start of the given day. */
const startOfDay = (value = new Date()) => {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Local end of the given day. */
const endOfDay = (value = new Date()) => {
  const d = new Date(value);
  d.setHours(23, 59, 59, 999);
  return d;
};

/** A new date n days before the given day, preserving the time of day. */
const subtractDays = (value, n) => {
  const d = new Date(value);
  d.setDate(d.getDate() - n);
  return d;
};

module.exports = { toDateKey, startOfDay, endOfDay, subtractDays };
