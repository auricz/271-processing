// Converts a YYYYMMDD string to a JavaScript Date object
export function strToDate(yyyymmdd) {
  // Validate input format
  if (!/^\d{8}$/.test(yyyymmdd)) {
    console.error("Invalid date format. Expected YYYYMMDD.");
    return null;
  }

  const year = parseInt(yyyymmdd.substring(0, 4), 10);
  const month = parseInt(yyyymmdd.substring(4, 6), 10) - 1; // JS months are 0-based
  const day = parseInt(yyyymmdd.substring(6, 8), 10);

  // Create date object
  const date = new Date(year, month, day);

  // Validate that the date matches the input (to catch invalid dates like 20230230)
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    console.error("Invalid date value.");
    return null;
  }

  return date;
}
