import 'dotenv/config';
import { prisma } from '../src/prisma';

async function main() {
  const count = await prisma.pfzAdvisory.count();
  console.log('PFZ Advisories in DB:', count);
  const advisories = await prisma.pfzAdvisory.findMany({ take: 5 });
  console.log('Advisories count:', advisories.length);
  for (const a of advisories) {
    console.log(`- [${a.advisoryId}] ${a.name} (${a.landingCentreName}, ${a.state}) lat:${a.latitude} lng:${a.longitude} depth:${a.depth}m sst:${a.seaSurfaceTemperature}°C`);
  }
  await prisma.$disconnect();
}

main().catch(console.error);
