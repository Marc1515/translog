const ALPHANUMERIC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const TRACKING_CODE_PATTERN = /^ENV-\d{8}-[A-Z0-9]{4}$/;

export function formatTrackingDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function generateSuffix(length = 4): string {
  let suffix = '';
  for (let i = 0; i < length; i++) {
    suffix += ALPHANUMERIC[Math.floor(Math.random() * ALPHANUMERIC.length)];
  }
  return suffix;
}

export function generateTrackingCode(date: Date = new Date()): string {
  return `ENV-${formatTrackingDate(date)}-${generateSuffix()}`;
}

export function isValidTrackingCodeFormat(code: string): boolean {
  return TRACKING_CODE_PATTERN.test(code);
}
