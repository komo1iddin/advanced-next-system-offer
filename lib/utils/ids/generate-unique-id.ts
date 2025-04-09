/**
 * Utility function to generate unique IDs for study offers
 * The ID format is: PREFIX~RANDOM_STRING
 * 
 * Prefixes based on degree level:
 * - Bachelor: BCHLR
 * - Master: MSTR
 * - PhD: PHD
 * - Certificate: CERT
 * - Diploma: DPLM
 * - Language Course: LANG
 */

// Map of degree level to prefix
const prefixMap: Record<string, string> = {
  'Bachelor': 'BCHLR',
  'Master': 'MSTR',
  'PhD': 'PHD',
  'Certificate': 'CERT',
  'Diploma': 'DPLM',
  'Language Course': 'LANG'
};

// Generate a random alphanumeric string of specified length
function generateRandomString(length: number): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * Generate a unique ID for a study offer based on its degree level
 * @param degreeLevel The degree level of the study offer
 * @returns A unique ID in the format PREFIX~RANDOM_STRING
 */
export function generateUniqueId(degreeLevel: string): string {
  // Get the prefix based on degree level or use 'OFFER' as default
  const prefix = prefixMap[degreeLevel] || 'OFFER';
  
  // Generate a random string of length 6
  const randomString = generateRandomString(6);
  
  // Current year (last two digits)
  const year = new Date().getFullYear().toString().slice(-2);
  
  // Return the unique ID
  return `${prefix}~${year}${randomString}`;
} 