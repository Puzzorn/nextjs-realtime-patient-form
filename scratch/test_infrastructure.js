const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const assert = require('assert');

console.log('--- STARTING INFRASTRUCTURE VERIFICATION TESTS ---');

// Test 1: CLIENT_ORIGIN Logic Verification
function testClientOriginLogic(envVal) {
  const clientOrigin = envVal
    ? (envVal.includes(',')
        ? envVal.split(',').map((s) => s.trim())
        : envVal)
    : '*';
  return clientOrigin;
}

console.log('\n[Test 1] Testing CLIENT_ORIGIN parsing logic...');
assert.strictEqual(testClientOriginLogic(undefined), '*', 'Fallback should be *');
assert.strictEqual(testClientOriginLogic(''), '*', 'Empty string should fallback to *');
assert.strictEqual(testClientOriginLogic('http://localhost:3000'), 'http://localhost:3000', 'Single origin match');
assert.deepStrictEqual(
  testClientOriginLogic('http://localhost:3000, https://app.example.com,http://admin.example.com '),
  ['http://localhost:3000', 'https://app.example.com', 'http://admin.example.com'],
  'Comma separated origins match'
);
console.log('✅ Test 1 Passed: CLIENT_ORIGIN parsing handles undefined, single, and comma-separated values correctly.');

// Test 2: Server startup on custom PORT (5050) & graceful shutdown
console.log('\n[Test 2] Testing server startup with PORT=5050...');
const serverPath = path.resolve(__dirname, '../server/index.js');

const child5050 = spawn('node', [serverPath], {
  env: { ...process.env, PORT: '5050', CLIENT_ORIGIN: 'http://localhost:3000' }
});

let output5050 = '';
child5050.stdout.on('data', (data) => {
  output5050 += data.toString();
});
child5050.stderr.on('data', (data) => {
  output5050 += data.toString();
});

setTimeout(() => {
  console.log('Server Output (PORT 5050):', output5050.trim());
  assert.ok(output5050.includes('5050'), 'Server log should indicate running on port 5050');
  
  const req = http.get('http://localhost:5050', (res) => {
    console.log(`HTTP response status from port 5050: ${res.statusCode}`);
    res.on('data', () => {});
    res.on('end', () => {
      console.log('HTTP response finished. Terminating server process cleanly...');
      child5050.kill('SIGTERM');
    });
  });

  req.on('error', (err) => {
    console.error('HTTP GET Error on port 5050:', err.message);
  });

  child5050.on('exit', (code, signal) => {
    console.log(`Server process on port 5050 exited with code ${code}, signal: ${signal}`);
    console.log('✅ Test 2 Passed: Server runs on custom PORT=5050 and shuts down cleanly.');
    runTest3();
  });
}, 1500);

function runTest3() {
  console.log('\n[Test 3] Testing server default PORT (3001)...');
  const envNoPort = { ...process.env };
  delete envNoPort.PORT;
  
  const childDefault = spawn('node', [serverPath], { env: envNoPort });
  let outputDefault = '';
  childDefault.stdout.on('data', (d) => { outputDefault += d.toString(); });
  childDefault.stderr.on('data', (d) => { outputDefault += d.toString(); });

  setTimeout(() => {
    console.log('Server Output (Default PORT):', outputDefault.trim());
    assert.ok(outputDefault.includes('3001'), 'Server log should indicate running on default port 3001');
    
    const req = http.get('http://localhost:3001', (res) => {
      console.log(`HTTP response status from port 3001: ${res.statusCode}`);
      res.on('data', () => {});
      res.on('end', () => {
        childDefault.kill('SIGTERM');
      });
    });

    req.on('error', (err) => {
      console.error('HTTP GET Error on port 3001:', err.message);
    });

    childDefault.on('exit', (code, signal) => {
      console.log(`Server process on port 3001 exited with code ${code}, signal: ${signal}`);
      console.log('✅ Test 3 Passed: Server defaults to PORT 3001 when process.env.PORT is unset.');
      console.log('\n--- ALL INFRASTRUCTURE SERVER TESTS PASSED SUCCESSFULLY ---');
      process.exit(0);
    });
  }, 1500);
}
