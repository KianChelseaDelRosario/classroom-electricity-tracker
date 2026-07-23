// Returns whole minutes between two Date objects. 0 if off is not after on.
export function getDurationMinutes(onTime, offTime) {
  if (!onTime || !offTime) return 0;
  const diffMs = offTime.getTime() - onTime.getTime();
  return diffMs > 0 ? Math.round(diffMs / 60000) : 0;
}

// 95 -> "1h 35m"
export function formatDuration(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10); // "2026-07-12"
}

// "2026-07-13" or a Date -> "July 13, 2026"
export function formatDisplayDate(dateOrKey = new Date()) {
  const date = typeof dateOrKey === 'string' ? new Date(`${dateOrKey}T00:00:00`) : dateOrKey;
  return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
}

// Merges overlapping/touching time ranges so simultaneous appliance usage
// isn't counted twice. intervals: [{ start: Date, end: Date }, ...]
export function mergeIntervals(intervals) {
  if (!intervals.length) return [];
  const sorted = [...intervals].sort((a, b) => a.start.getTime() - b.start.getTime());
  const merged = [{ ...sorted[0] }];
  for (let i = 1; i < sorted.length; i++) {
    const last = merged[merged.length - 1];
    const curr = sorted[i];
    if (curr.start.getTime() <= last.end.getTime()) {
      if (curr.end.getTime() > last.end.getTime()) last.end = curr.end;
    } else {
      merged.push({ ...curr });
    }
  }
  return merged;
}

// Total minutes actually covered by a set of intervals (no double-counting
// of overlapping time). This is what "hours electricity was used" should use.
export function getCoveredMinutes(intervals) {
  const merged = mergeIntervals(intervals);
  return merged.reduce((sum, i) => sum + getDurationMinutes(i.start, i.end), 0);
}
