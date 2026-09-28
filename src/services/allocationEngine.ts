import { Agent, AllocationExplanation, CaseItem, OperationalZone } from '../types';

export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function rankAgentsForCase(
  caseItem: Partial<CaseItem>,
  agents: Agent[],
  _zones: OperationalZone[] = []
): AllocationExplanation[] {
  const caseLat = caseItem.coordinates?.lat ?? 13.125;
  const caseLng = caseItem.coordinates?.lng ?? 80.298;
  const targetLang = caseItem.language || 'en';

  const scoredAgents = agents
    .filter((agent) => agent.status !== 'inactive' && agent.status !== 'suspended' && agent.status !== 'on_leave')
    .map((agent) => {
      // 1. Distance Calculation & Score (Max 35 pts)
      const dist = calculateHaversineDistance(caseLat, caseLng, agent.coordinates.lat, agent.coordinates.lng);
      // Closer is better: < 10km = 35pts, 10-30km = 25pts, 30-60km = 15pts, >60km = 5pts
      let distanceScore = Math.max(5, Math.min(35, 35 - (dist / 100) * 30));
      if (dist <= 10) distanceScore = 35;
      else if (dist <= 30) distanceScore = 28;
      else if (dist <= 60) distanceScore = 18;

      // 2. Workload Score (Max 25 pts)
      const loadRatio = agent.currentWorkload / Math.max(1, agent.maxWorkload);
      const workloadScore = Math.round((1 - loadRatio) * 25);

      // 3. Language Match Score (Max 25 pts)
      const hasDirectLanguage = agent.languages.includes(targetLang);
      const hasUniversalLanguage = agent.languages.includes('en') || agent.languages.includes('hi');
      let languageMatchScore = 5;
      if (hasDirectLanguage) languageMatchScore = 25;
      else if (hasUniversalLanguage) languageMatchScore = 15;

      // 4. Skills Match Score (Max 15 pts)
      const matchedSkills = agent.skills.filter((skill) => {
        if (caseItem.priority === 'CRITICAL_SOS') {
          return skill.toLowerCase().includes('safety') || skill.toLowerCase().includes('first aid');
        }
        if (caseItem.requestType?.includes('PFZ')) {
          return skill.toLowerCase().includes('gis') || skill.toLowerCase().includes('navigation');
        }
        return true;
      });
      const skillMatchScore = Math.min(15, matchedSkills.length * 5 + 5);

      // Total Composite Score (0 - 100)
      const totalScore = Math.round(distanceScore + workloadScore + languageMatchScore + skillMatchScore);

      // Build explainability rationale
      const reasons: string[] = [];
      if (hasDirectLanguage) {
        reasons.push(`fluent in ${targetLang.toUpperCase()} (direct language match)`);
      }
      reasons.push(`${dist} km proximity from operational incident site`);
      reasons.push(`workload capacity at ${agent.currentWorkload}/${agent.maxWorkload}`);
      if (agent.performance.rating >= 4.8) {
        reasons.push(`exceptional historical rating (${agent.performance.rating}/5.0)`);
      }

      const reasonText = `Assigned to ${agent.name} because: ${reasons.join(', ')}.`;

      return {
        agentId: agent.id,
        agentName: agent.name,
        score: totalScore,
        distanceKm: dist,
        distanceScore: Math.round(distanceScore),
        workloadScore,
        languageMatchScore,
        skillMatchScore,
        ratingScore: Math.round(agent.performance.rating * 10),
        reasonText,
        matchedLanguages: agent.languages,
        matchedSkills,
      };
    });

  return scoredAgents.sort((a, b) => b.score - a.score);
}
