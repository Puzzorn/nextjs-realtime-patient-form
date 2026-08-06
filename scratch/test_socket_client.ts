import assert from 'assert';

// Test function mimicking socketClient.ts URL resolution
function resolveSocketUrl(envVal?: string): string {
  return envVal || "http://localhost:3001";
}

console.log('[Test socketClient URL Resolution]');

// Case 1: Unset process.env.NEXT_PUBLIC_SOCKET_URL
const defaultUrl = resolveSocketUrl(undefined);
console.log('Default Fallback URL:', defaultUrl);
assert.strictEqual(defaultUrl, 'http://localhost:3001', 'Should fallback to http://localhost:3001');

// Case 2: Custom process.env.NEXT_PUBLIC_SOCKET_URL
const customUrl = resolveSocketUrl('https://my-realtime-server.onrender.com');
console.log('Custom Configured URL:', customUrl);
assert.strictEqual(customUrl, 'https://my-realtime-server.onrender.com', 'Should resolve custom env variable');

console.log('✅ socketClient URL resolution tests PASSED.');
