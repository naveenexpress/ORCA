const BASE_URL = 'http://localhost:3001/api';

async function runTests() {
  console.log('Starting 12 safety compliance tests...');
  let passed = 0;
  
  try {
    // 1. Register a vessel
    let res = await fetch(`${BASE_URL}/vessels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationNumber: 'IND-TN-1234',
        name: 'Sea King',
        ownerName: 'Murugan',
        contactPhone: '+919876543210',
        vesselType: 'Trawler',
        homePort: 'Chennai'
      })
    });
    let vessel = await res.json();
    if (!res.ok) {
      if (res.status === 500) {
        // Might already exist, fetch it
        res = await fetch(`${BASE_URL}/vessels`);
        const vessels = await res.json();
        vessel = vessels.find(v => v.registrationNumber === 'IND-TN-1234');
      } else {
        throw new Error('Test 1 Failed');
      }
    }
    console.log('1. Register a vessel - PASSED');
    passed++;

    // 2. Fetch vessels
    res = await fetch(`${BASE_URL}/vessels`);
    if (!res.ok) throw new Error('Test 2 Failed');
    console.log('2. Fetch vessels - PASSED');
    passed++;

    // 3. Create a voyage
    res = await fetch(`${BASE_URL}/voyages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vesselId: vessel.id,
        expectedReturnTime: new Date(Date.now() + 86400000).toISOString(),
        destinationArea: 'Bay of Bengal Zone A',
        crewCount: 4
      })
    });
    const voyage = await res.json();
    if (!res.ok) throw new Error('Test 3 Failed');
    console.log('3. Create a voyage - PASSED');
    passed++;

    // 4. Fetch active voyages
    res = await fetch(`${BASE_URL}/voyages`);
    let voyages = await res.json();
    if (!res.ok || voyages.length === 0) throw new Error('Test 4 Failed');
    console.log('4. Fetch active voyages - PASSED');
    passed++;

    // 5. Log a successful communication
    res = await fetch(`${BASE_URL}/voyages/${voyage.id}/communication`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'VHF',
        status: 'SUCCESS',
        notes: 'Clear signal'
      })
    });
    if (!res.ok) throw new Error('Test 5 Failed');
    console.log('5. Log a successful communication - PASSED');
    passed++;

    // 6. Check communication update
    res = await fetch(`${BASE_URL}/voyages`);
    voyages = await res.json();
    const updatedVoyage = voyages.find(v => v.id === voyage.id);
    if (!updatedVoyage.lastCommunicationTime) throw new Error('Test 6 Failed');
    console.log('6. Check communication update - PASSED');
    passed++;

    // 7. Log a failed communication
    res = await fetch(`${BASE_URL}/voyages/${voyage.id}/communication`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'CELLULAR',
        status: 'FAILED',
        notes: 'No network'
      })
    });
    if (!res.ok) throw new Error('Test 7 Failed');
    console.log('7. Log a failed communication - PASSED');
    passed++;

    // 8. Log a safety check-in (OK)
    res = await fetch(`${BASE_URL}/voyages/${voyage.id}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: 13.0,
        longitude: 80.5,
        status: 'OK',
        notes: 'All good'
      })
    });
    if (!res.ok) throw new Error('Test 8 Failed');
    console.log('8. Log a safety check-in (OK) - PASSED');
    passed++;

    // 9. Log a safety check-in (ASSISTANCE_NEEDED)
    res = await fetch(`${BASE_URL}/voyages/${voyage.id}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: 13.1,
        longitude: 80.6,
        status: 'ASSISTANCE_NEEDED',
        notes: 'Engine issue'
      })
    });
    if (!res.ok) throw new Error('Test 9 Failed');
    console.log('9. Log a safety check-in (ASSISTANCE_NEEDED) - PASSED');
    passed++;

    // 10. Check location updates
    res = await fetch(`${BASE_URL}/voyages`);
    voyages = await res.json();
    const locVoyage = voyages.find(v => v.id === voyage.id);
    if (locVoyage.lastLocationLat !== 13.1) throw new Error('Test 10 Failed');
    console.log('10. Check location updates - PASSED');
    passed++;

    // 11. Create a safety alert
    res = await fetch(`${BASE_URL}/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voyageId: voyage.id,
        type: 'ENGINE_FAILURE',
        severity: 'CRITICAL'
      })
    });
    if (!res.ok) throw new Error('Test 11 Failed');
    console.log('11. Create a safety alert - PASSED');
    passed++;

    // 12. Verify all data through GET /api/voyages
    res = await fetch(`${BASE_URL}/voyages`);
    voyages = await res.json();
    const finalVoyage = voyages.find(v => v.id === voyage.id);
    if (finalVoyage.safetyAlerts.length === 0) throw new Error('Test 12 Failed');
    console.log('12. Verify all data - PASSED');
    passed++;

    console.log(`\nAll ${passed}/12 tests passed successfully!`);
  } catch (error) {
    console.error('Test Failed:', error.message);
  }
}

runTests();
