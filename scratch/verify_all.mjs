import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:3001/api';

async function verifyAll() {
  let hasErrors = false;
  
  function assert(condition, message) {
    if (!condition) {
      console.error('❌ FAIL:', message);
      hasErrors = true;
    } else {
      console.log('✅ PASS:', message);
    }
  }

  console.log('\\n--- 1. DATABASE ROW COUNTS ---');
  try {
    const counts = {
      users: await prisma.user.count(),
      agents: await prisma.agent.count(),
      pfz: await prisma.pfzAdvisory.count(),
      cases: await prisma.case.count(),
      sos: await prisma.sosIncident.count(),
      notifications: await prisma.notification.count(),
      vessels: await prisma.vessel.count(),
      voyages: await prisma.voyage.count(),
      checkins: await prisma.safetyCheckIn.count(),
      alerts: await prisma.safetyAlert.count(),
    };
    console.table(counts);
    assert(counts.users > 0, 'Users table has records');
  } catch (e) {
    console.error('Prisma count error:', e);
    hasErrors = true;
  }

  console.log('\\n--- 2. AUTHENTICATION REGRESSION ---');
  let token = '';
  let testUserId = '';
  try {
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Verify Test', email: 'verify@orca.marine', password: 'password123', role: 'fisherman' })
    });
    const regData = await regRes.json();
    if (regRes.ok) {
      assert(regData.token, 'Register returned token');
      testUserId = regData.user.id;
    } else if (regData.error === 'Email already in use') {
      console.log('User already exists, attempting login...');
    } else {
      assert(false, 'Register failed: ' + regData.error);
    }

    const logRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'verify@orca.marine', password: 'password123' })
    });
    const logData = await logRes.json();
    assert(logRes.ok && logData.token, 'Login successful');
    token = logData.token;
    testUserId = logData.user.id;
    assert(!logData.user.passwordHash && !logData.user.password, 'Login response does not expose password');

    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    assert(meRes.ok && meData.user, 'Auth ME endpoint works');

    const unauthRes = await fetch(`${API_BASE}/auth/me`);
    assert(unauthRes.status === 401, 'Unauthenticated access rejected');

  } catch (e) {
    console.error('Auth error:', e);
    hasErrors = true;
  }

  console.log('\\n--- 3. SOS DYNAMIC LOCATION ---');
  try {
    const sosRes1 = await fetch(`${API_BASE}/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callerName: 'SOS Verify',
        callerPhone: '1234567890',
        incidentCode: 'ORCA-SOS-TEST-1',
        emergencyType: 'medical',
        severity: 'CRITICAL_LIFE_THREAT',
        status: 'responding',
        locationDescription: 'Test Location',
        assignedAgentIds: ['test'],
        assignedSupervisorId: 'test',
        timeline: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        peopleAffectedCount: 1,
        coordinates: { lat: 12.95, lng: 80.3 }
      })
    });
    const sosData1 = await sosRes1.json();
    assert(sosRes1.ok, 'SOS POST 1 succeeded: ' + JSON.stringify(sosData1));
    if (sosData1.incident) {
        assert(sosData1.incident.nearestLandingCentre !== 'Kasimadu Fishing Harbour' || sosData1.incident.distanceFromShoreKm !== 28.5, 'SOS 1 calculated dynamically: ' + sosData1.incident.nearestLandingCentre + ' @ ' + sosData1.incident.distanceFromShoreKm + 'km');
    }

    const sosRes2 = await fetch(`${API_BASE}/sos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callerName: 'SOS Verify',
        callerPhone: '1234567890',
        incidentCode: 'ORCA-SOS-TEST-2',
        emergencyType: 'medical',
        severity: 'CRITICAL_LIFE_THREAT',
        status: 'responding',
        locationDescription: 'Test Location',
        assignedAgentIds: ['test'],
        assignedSupervisorId: 'test',
        timeline: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        peopleAffectedCount: 1,
        coordinates: { lat: 17.5, lng: 83.5 }
      })
    });
    const sosData2 = await sosRes2.json();
    assert(sosRes2.ok, 'SOS POST 2 succeeded: ' + JSON.stringify(sosData2));
    if (sosData1.incident && sosData2.incident) {
        assert(sosData1.incident.nearestLandingCentre !== sosData2.incident.nearestLandingCentre, 'Different coordinates produced different nearest centres');
    }

    await prisma.sosIncident.deleteMany({ where: { callerName: 'SOS Verify' } });
  } catch (e) {
    console.error('SOS error:', e);
    hasErrors = true;
  }

  console.log('\\n--- 4. WEATHER PROXY ---');
  try {
    const wRes = await fetch(`${API_BASE}/weather?lat=13.0827&lon=80.2707&units=metric`);
    assert(wRes.ok, 'Weather proxy HTTP 200');
    const wData = await wRes.json();
    assert(wData && wData.weather && wData.main, 'Weather returns valid JSON payload');
    
    const wResFail = await fetch(`${API_BASE}/weather?lat=invalid&lon=invalid&units=metric`);
    assert(wResFail.status >= 400, 'Weather proxy handles invalid coordinates');
  } catch(e) {
    console.error('Weather error:', e);
    hasErrors = true;
  }

  console.log('\\n--- 5. API CRUD SMOKE TESTS ---');
  try {
    const pfzRes = await fetch(`${API_BASE}/pfz`);
    assert(pfzRes.ok, 'PFZ GET succeeded');
    const casesRes = await fetch(`${API_BASE}/cases`);
    assert(casesRes.ok, 'Cases GET succeeded');
    const agentsRes = await fetch(`${API_BASE}/agents`);
    assert(agentsRes.ok, 'Agents GET succeeded');
    const notifRes = await fetch(`${API_BASE}/notifications`);
    assert(notifRes.ok, 'Notifications GET succeeded');
  } catch(e) {
    console.error('CRUD error:', e);
    hasErrors = true;
  }

  // Cleanup test user
  await prisma.user.deleteMany({ where: { email: { contains: 'verify@orca.marine' } } });
  
  await prisma.$disconnect();

  if (hasErrors) {
    process.exit(1);
  } else {
    console.log('\\n✅ ALL VERIFICATIONS PASSED');
  }
}

verifyAll();
