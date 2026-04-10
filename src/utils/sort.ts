import { SortType, Ticket } from "../API";

export const normalizeSort = (v?: string | null): SortType | null => {
  switch ((v ?? "").toUpperCase()) {
    case "ALPHABETICAL": return SortType.ALPHABETICAL;
    case "EVENT_DATE":   return SortType.EVENT_DATE;
    case "TIME_CREATED": return SortType.TIME_CREATED;
    default:             return null;
  }
};

export function buildEventDate(dateStr: string | null | undefined, timeStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split("-").map(Number);
  if (parts.length < 3) return null;
  const [y, m, d] = parts;
  const timeParts = (timeStr ?? "").split(":").map(Number);
  const h = Number.isFinite(timeParts[0]) ? timeParts[0] : 0;
  const min = Number.isFinite(timeParts[1]) ? timeParts[1] : 0;
  return new Date(y, m - 1, d, h, min, 0, 0);
}

export const sortTickets = (items: Ticket[], sort: SortType): Ticket[] => {
  const copy = [...items];
  if (sort === SortType.ALPHABETICAL) {
    copy.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  } else if (sort === SortType.EVENT_DATE) {
    copy.sort((a, b) => {
      const ad = buildEventDate(a.eventDate, a.eventTime);
      const bd = buildEventDate(b.eventDate, b.eventTime);
      return (bd?.getTime() ?? -Infinity) - (ad?.getTime() ?? -Infinity);
    });
  } else {
    copy.sort((a, b) => (b.timeCreated ?? 0) - (a.timeCreated ?? 0));
  }
  return copy;
};
