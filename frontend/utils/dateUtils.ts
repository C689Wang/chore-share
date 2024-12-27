export const formatToLocalDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Add the timezone offset to get local time
  const localDate = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
  return localDate.toLocaleDateString();
};

export const parseUTCDate = (dateString: string): Date => {
  const date = new Date(dateString);
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
};

export const toUTCString = (date: Date): string => {
  const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return utcDate.toISOString();
}; 