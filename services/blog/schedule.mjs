const pragueClock = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Prague", year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23"
});

export function pragueSchedule(now = new Date()) {
  const parts = Object.fromEntries(pragueClock.formatToParts(now).map(({ type, value }) => [type, value]));
  return {
    day: `${parts.year}-${parts.month}-${parts.day}`,
    due: Number(parts.hour) * 60 + Number(parts.minute) >= 6 * 60 + 20
  };
}
