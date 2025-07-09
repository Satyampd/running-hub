import { parse, isValid, format } from 'date-fns'

const DATE_FORMATS = [
  'yyyy-MM-dd',           // 2024-03-15
  'dd/MM/yyyy',          // 15/03/2024
  'dd-MM-yyyy',          // 15-03-2024
  'dd MMM yyyy',         // 15 Mar 2024
  'dd MMMM yyyy',        // 15 March 2024
  'MMM dd, yyyy',        // Mar 15, 2024
  'MMMM dd, yyyy',       // March 15, 2024
]

function parseDate(dateStringInput: string): Date | null {
  if (!dateStringInput) return null;
  const dateString = dateStringInput.trim();

  // Priority 1: Try parsing with date-fns using the common formats
  for (const dateFormat of DATE_FORMATS) {
    try {
      const parsedWithFormat = parse(dateString, dateFormat, new Date());
      if (isValid(parsedWithFormat)) {
        return parsedWithFormat;
      }
    } catch {
      // Continue if this format fails
    }
  }

  // Priority 2: Try direct JS Date parsing on the original trimmed string
  const directDate = new Date(dateString);
  if (isValid(directDate)) {
    // This handles cases like full ISO strings, or potentially just "YYYY" if no format matched.
    // If 'yyyy-MM-dd' was the input, it should have been caught by Priority 1.
    return directDate;
  }

  // Priority 3: Try to extract the first date if it's a range string like "Date1 to Date2" or "Date1 - Date2"
  // This is a fallback if the original string itself wasn't parsable by the above methods.
  let partToParse = dateString;
  let modifiedForRange = false;

  const toSplit = dateString.split(/\s+to\s+/i); // Case-insensitive " to "
  if (toSplit.length > 1) {
    partToParse = toSplit[0].trim();
    modifiedForRange = true;
  } else {
    const hyphenSplit = dateString.split(/\s+-\s+/); // " - " (with spaces)
    if (hyphenSplit.length > 1) {
      // This is safer for "YYYY-MM-DD" as it won't match if spaces aren't around the hyphen.
      partToParse = hyphenSplit[0].trim();
      modifiedForRange = true;
    }
  }

  if (modifiedForRange) {
    // If we extracted a part because it looked like a range, try parsing that part.
    // Attempt with DATE_FORMATS first for the extracted part.
    for (const dateFormat of DATE_FORMATS) {
      try {
        const parsedPart = parse(partToParse, dateFormat, new Date());
        if (isValid(parsedPart)) return parsedPart;
      } catch {
        // Continue
      }
    }
    // Then try direct JS Date parsing for the extracted part.
    const directDateFromPart = new Date(partToParse);
    if (isValid(directDateFromPart)) return directDateFromPart;
  }

  return null; // All attempts failed
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'Date TBA';

  const trimmedDateString = dateString.trim();
  const parsedDate = parseDate(trimmedDateString); // Use the improved parseDate

  if (!parsedDate) {
    // If we can't parse it, return the original trimmed string, or TBA if applicable
    return trimmedDateString.toUpperCase().includes('TBA') || trimmedDateString.toUpperCase().includes('TBD')
      ? 'Date TBA'
      : trimmedDateString;
  }

  try {
    return format(parsedDate, 'dd MMM yyyy');
  } catch {
    // This fallback should be rare if parsedDate is valid
    return 'Date TBA';
  }
}

export function compareDates(a: string, b: string): number {
  const dateA = parseDate(a)
  const dateB = parseDate(b)

  // Handle cases where one or both dates are invalid
  if (!dateA && !dateB) return 0
  if (!dateA) return 1  // Invalid dates go to the end
  if (!dateB) return -1

  return dateA.getTime() - dateB.getTime()
}

export function isUpcoming(dateString: string): boolean {
  const parsedDate = parseDate(dateString)
  if (!parsedDate) return false

  const now = new Date()
  now.setHours(0, 0, 0, 0) // Compare dates only, not times
  
  return parsedDate >= now
}

export function isWithinNextMonth(dateString: string): boolean {
  const parsedDate = parseDate(dateString)
  if (!parsedDate) return false

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  
  const nextMonth = new Date()
  nextMonth.setMonth(nextMonth.getMonth() + 1)
  nextMonth.setHours(23, 59, 59, 999)

  return parsedDate >= now && parsedDate <= nextMonth
} 