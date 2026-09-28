const API_BASE = 'http://localhost:3001/api';

async function verifyValidation() {
  let hasErrors = false;
  
  function assert(condition, message) {
    if (!condition) {
      console.error('❌ FAIL:', message);
      hasErrors = true;
    } else {
      console.log('✅ PASS:', message);
    }
  }

  const endpoints = [
    { path: '/users', body: { name: 'Incomplete User' } },
    { path: '/agents', body: { name: 'Incomplete Agent' } },
    { path: '/pfz', body: { name: 'Incomplete PFZ' } },
    { path: '/cases', body: { title: 'Incomplete Case' } },
    { path: '/notifications', body: { type: 'Incomplete Notification' } },
    { path: '/sos', body: { callerName: 'Incomplete SOS' } },
    { path: '/vessels', body: { name: 'Incomplete Vessel' } },
    { path: '/voyages', body: { status: 'Incomplete Voyage' } },
    { path: '/alerts', body: { type: 'Incomplete Alert' } },
    { path: '/auth/register', body: { name: 'Incomplete Reg' } },
    { path: '/auth/login', body: { email: 'Incomplete Login' } }
  ];

  console.log('\\n--- VALIDATION TESTS (EXPECT 400) ---');
  for (const ep of endpoints) {
    try {
      const res = await fetch(`${API_BASE}${ep.path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ep.body)
      });
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        assert(res.status === 400, `POST ${ep.path} returned ${res.status}: ${JSON.stringify(data).substring(0, 50)}...`);
      } catch (e) {
        assert(res.status === 400, `POST ${ep.path} returned ${res.status}: ${text.substring(0, 100)}...`);
      }
    } catch (e) {
      console.error(`Error on POST ${ep.path}:`, e.message);
      hasErrors = true;
    }
  }
  
  console.log('\\n--- VALID POST TEST ---');
  try {
    const res = await fetch(`${API_BASE}/vessels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationNumber: 'TEST-VLD-' + Date.now(),
        name: 'Valid Test Vessel',
        ownerName: 'Test Owner',
        contactPhone: '9998887776'
      })
    });
    assert(res.status === 201 || res.status === 200, `POST /vessels returned ${res.status}`);
  } catch (e) {
    console.error('Error on valid test:', e.message);
    hasErrors = true;
  }
  
  if (hasErrors) {
    process.exit(1);
  } else {
    console.log('\\n✅ ALL VALIDATION TESTS PASSED');
  }
}

verifyValidation();
