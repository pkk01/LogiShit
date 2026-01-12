export const formatDate = (dateString: string | Date): string => {
  // Ensure we parse as UTC
  const date = typeof dateString === 'string' 
    ? new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z')
    : dateString;
  
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  
  return `${day}/${month}/${year}`;
};

export const formatDateTime = (dateString: string | Date): string => {
  // Ensure we parse as UTC
  const date = typeof dateString === 'string' 
    ? new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z')
    : dateString;
  
  // Get UTC hours and minutes, then add IST offset (5:30)
  let hours = date.getUTCHours();
  let minutes = date.getUTCMinutes();
  let day = date.getUTCDate();
  let month = date.getUTCMonth() + 1;
  let year = date.getUTCFullYear();
  
  // Add 5 hours 30 minutes for IST
  minutes += 30;
  if (minutes >= 60) {
    minutes -= 60;
    hours += 1;
  }
  
  hours += 5;
  if (hours >= 24) {
    hours -= 24;
    day += 1;
    // Handle month/year rollover if needed (simplified)
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) {
      day = 1;
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
  }
  
  const dayStr = String(day).padStart(2, '0');
  const monthStr = String(month).padStart(2, '0');
  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  
  return `${dayStr}/${monthStr}/${year}, ${hoursStr}:${minutesStr} IST`;
};

// Format time as 'HH:MM IST'
export const formatTimeIST = (dateString: string | Date): string => {
  // Ensure we parse as UTC
  const date = typeof dateString === 'string' 
    ? new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z')
    : dateString;
  
  // Get UTC hours and minutes, then add IST offset (5:30)
  let hours = date.getUTCHours();
  let minutes = date.getUTCMinutes();
  
  // Add 5 hours 30 minutes for IST
  minutes += 30;
  if (minutes >= 60) {
    minutes -= 60;
    hours += 1;
  }
  
  hours += 5;
  if (hours >= 24) {
    hours -= 24;
  }
  
  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  
  return `${hoursStr}:${minutesStr} IST`;
};
