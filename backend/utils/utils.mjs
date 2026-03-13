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

// Takes err object and makes readable string for client
export function formatErr(err) {
  return `${err.name}: ${err.message}`;
}

// Returns closure for finding user in an org
export function findUser(username, organization) {
  const func = (r) => r.username === username && r.organization === organization;
  return func;
}

export function randomNumberString(length) {
  return Math.floor(Math.random() * 10 ** length)
    .toString()
    .padStart(length, "0");
}

export function getCurrentTime(format) {
  const now = new Date()

  const parts = {
    yyyy: now.getFullYear().toString(),
    yy: now.getFullYear().toString().slice(-2),
    mm: String(now.getMonth() + 1).padStart(2, "0"),
    dd: String(now.getDate()).padStart(2, "0"),
    hh: String(now.getHours()).padStart(2, "0"),
    mi: String(now.getMinutes()).padStart(2, "0"),
    ss: String(now.getSeconds()).padStart(2, "0")
  }

  return format.replace(/yyyy|yy|mm|dd|hh|mi|ss/g, match => parts[match])
}

let counter = 1;
export function getRequestsSentCounter(len) {
  return counter.toString().padStart(len, '0');
}

export function incrementSentCounter() {
  counter++;
}