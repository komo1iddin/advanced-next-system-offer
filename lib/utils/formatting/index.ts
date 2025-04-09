/**
 * Format a date string or Date object to a consistent format
 */
export function formatDate(date: string | Date | undefined): string {
  if (!date) return "—";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    return typeof date === "string" ? date : "—";
  }
}

/**
 * Handle null, undefined, or empty values with a consistent placeholder
 */
export function formatNullable(value: string | null | undefined, placeholder: string = "—"): string {
  if (value === null || value === undefined || value === "") {
    return placeholder;
  }
  return value;
}

/**
 * Format a price with currency and period
 */
export function formatPrice(
  amount: number | string | null | undefined,
  currency: string = "USD",
  period: string = "year"
): string {
  if (amount === null || amount === undefined) return "—";
  
  const amountNum = typeof amount === "string" ? parseFloat(amount) : amount;
  
  if (isNaN(amountNum)) return "—";
  
  return `${amountNum.toLocaleString()} ${currency}/${period}`;
} 