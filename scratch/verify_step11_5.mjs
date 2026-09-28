import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:3001/api';

async function verifyAll() {
  console.log('\\n--- 1. & 8. DATABASE ROW COUNTS ---');
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
      events: await prisma.communicationEvent.count(),
      alerts: await prisma.safetyAlert.count(),
    };
    console.table(counts);
  } catch (e) {
    console.error('Prisma count error:', e);
  }

  console.log('\\n--- 1. SEA COMMUNICATION API ---');
  try {
    const vRes = await fetch(`${API_BASE}/vessels`);
    console.log('Vessels GET ok:', vRes.ok);
    const voyRes = await fetch(`${API_BASE}/voyages`);
    console.log('Voyages GET ok:', voyRes.ok);
  } catch (e) {
    console.error('Sea comm error:', e);
  }

  console.log('\\n--- 2. AI ASSISTANT API ---');
  try {
    const chatQueries = [
      'Hello ORCA',
      'What is the weather like?',
      'Where is the nearest PFZ?',
      'Weather in Vizag',
      'Help boat sinking',
      'Nearest harbour',
      'Show me fish data from Antarctica'
    ];
    for (const q of chatQueries) {
      const chatRes = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, language: 'en' })
      });
      const chatData = await chatRes.json();
      console.log(`Q: ${q.substring(0, 20)} -> Res ok: ${chatRes.ok}, type: ${chatData.cardPreview?.type}`);
    }
  } catch(e) {
    console.error('Chat error:', e);
  }
  
  await prisma.$disconnect();
}

verifyAll();
