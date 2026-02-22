export function formatDuration(minutes: number, hourSuffix: string, minutesSuffix: string): string {
  if (minutes >= 60) {
    return `${(minutes / 60).toFixed(minutes % 60 === 0 ? 0 : 1)}${hourSuffix}`;
  }
  return `${minutes}${minutesSuffix}`;
}
