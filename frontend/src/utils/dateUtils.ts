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

function parseDate(dateString: string): Date | null {
  // Remove any date ranges and take the first date
  const firstDate = dateString.split('-')[0].split('to')[0].trim()
  
  // First try direct Date parsing
  const directDate = new Date(firstDate)
  if (isValid(directDate)) {
    return directDate
  }

  // Try each format
  for (const dateFormat of DATE_FORMATS) {
    try {
      const parsedDate = parse(firstDate, dateFormat, new Date())
      if (isValid(parsedDate)) {
        return parsedDate
      }
    } catch {
      continue
    }
  }

  return null
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'Date TBA'
  
  // Remove any date ranges and take the first date
  const firstDate = dateString.split('-')[0].split('to')[0].trim()
  
  const parsedDate = parseDate(firstDate)
  if (!parsedDate) {
    // If we can't parse it, return the original string or TBA
    return firstDate.includes('TBA') || firstDate.includes('TBD') 
      ? 'Date TBA'
      : firstDate
  }

  try {
    return format(parsedDate, 'dd MMM yyyy')
  } catch {
    return 'Date TBA'
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