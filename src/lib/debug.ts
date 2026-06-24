export function debugLog(message: string, data?: any) {
  if (typeof window !== 'undefined') {
    fetch('/api/debug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, data }),
    }).catch(() => {});
  }
}
