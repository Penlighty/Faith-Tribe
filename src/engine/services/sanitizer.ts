/**
 * Sanitizes user-entered text to prevent XSS and formatting breakage
 */
export function sanitizeInput(text: string, maxLength: number = 200): string {
  if (!text) return '';
  return text
    .replace(/[<>]/g, '') // strip HTML brackets
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates display names (2 to 18 characters, friendly alphanumeric)
 */
export function sanitizePlayerName(rawName: string): string {
  const cleaned = rawName
    .replace(/[<>'"\\/]/g, '')
    .trim()
    .slice(0, 18);
  return cleaned || 'Disciple';
}
