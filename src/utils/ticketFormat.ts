export const handleTicketDate = (date: string | null | undefined): string => {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${month}/${day}/${year}`;
};

export const handleTicketTime = (time: string | null | undefined): string => {
  if (!time) return "";
  const t = time.substring(0, 5);
  const parts = t.split(":");
  if (parts.length < 2) return "";
  const hour = parseInt(parts[0], 10);
  const minute = parts[1];
  if (isNaN(hour)) return "";
  if (hour === 12) return `${t}pm`;
  if (hour > 12) return `${hour - 12}:${minute}pm`;
  if (hour === 0) return `${hour + 12}:${minute}am`;
  return `${hour}:${minute}am`;
};
