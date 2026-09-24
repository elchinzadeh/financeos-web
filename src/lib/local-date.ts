/** `<input type="date">` üçün brauzerin yerli saat qurşağında `yyyy-mm-dd`. */
export function toLocalDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Assistant-ın `dayOffset`-ini (0 = bu gün, -1 = dünən ...) yerli tarixə çevirir; backend-də timezone saxlanmır. */
export function dateFromDayOffset(dayOffset: number, now: Date = new Date()): string {
  const date = new Date(now);
  date.setDate(date.getDate() + dayOffset);
  return toLocalDateInput(date);
}

/**
 * Seçilmiş tarixi backend-in `occurredAt` (ISO) sahəsinə çevirir. Bu günkü tarix üçün `undefined` qaytarır — backend
 * default olaraq indiki anı yazır. Keçmiş tarix yerli günortaya (12:00) bağlanır ki, saat qurşağı fərqi günü sürüşdürməsin.
 */
export function occurredAtFromDateInput(dateInput: string, now: Date = new Date()): string | undefined {
  if (dateInput === toLocalDateInput(now)) return undefined;
  const [year, month, day] = dateInput.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0).toISOString();
}
