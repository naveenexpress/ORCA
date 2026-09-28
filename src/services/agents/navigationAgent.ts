import { Coordinates, LanguageCode } from '../../types';
import { KNOWN_COASTAL_LOCATIONS } from '../locationService';

export class NavigationAgent {
  /**
   * Calculate distance (km & NM) and initial compass bearing between two GPS coordinates
   */
  public static calculateBearingAndDistance(
    from: Coordinates,
    to: Coordinates
  ): { distanceKm: number; distanceNm: number; bearingDegrees: number; cardinal: string } {
    const R = 6371; // Earth's radius in km
    const dLat = ((to.lat - from.lat) * Math.PI) / 180;
    const dLon = ((to.lng - from.lng) * Math.PI) / 180;
    const lat1 = (from.lat * Math.PI) / 180;
    const lat2 = (to.lat * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = +(R * c).toFixed(1);
    const distanceNm = +(distanceKm / 1.852).toFixed(1);

    const y = Math.sin(dLon) * Math.cos(lat2);
    const x =
      Math.cos(lat1) * Math.sin(lat2) -
      Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    let brng = (Math.atan2(y, x) * 180) / Math.PI;
    brng = (brng + 360) % 360;
    const bearingDegrees = Math.round(brng);

    const val = Math.floor(bearingDegrees / 22.5 + 0.5);
    const cardinals = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const cardinal = cardinals[val % 16];

    return { distanceKm, distanceNm, bearingDegrees, cardinal };
  }

  /**
   * Find nearest coastal landing centre / harbour from given coordinates
   */
  public static findNearestHarbour(from: Coordinates): {
    harbourName: string;
    distanceKm: number;
    distanceNm: number;
    bearingDegrees: number;
    cardinal: string;
    coordinates: Coordinates;
  } {
    let minDistance = Infinity;
    let closest = KNOWN_COASTAL_LOCATIONS[0];
    let navInfo = this.calculateBearingAndDistance(from, { lat: closest.lat, lng: closest.lng });

    for (const loc of KNOWN_COASTAL_LOCATIONS) {
      const nav = this.calculateBearingAndDistance(from, { lat: loc.lat, lng: loc.lng });
      // If exactly at the harbour (distance 0), check other harbours or keep
      if (nav.distanceKm < minDistance) {
        minDistance = nav.distanceKm;
        closest = loc;
        navInfo = nav;
      }
    }

    return {
      harbourName: closest.name,
      distanceKm: navInfo.distanceKm,
      distanceNm: navInfo.distanceNm,
      bearingDegrees: navInfo.bearingDegrees,
      cardinal: navInfo.cardinal,
      coordinates: { lat: closest.lat, lng: closest.lng },
    };
  }

  /**
   * Format localized navigation response for nearest harbour
   */
  public static formatNearestHarbourResponse(
    nearest: ReturnType<typeof NavigationAgent.findNearestHarbour>,
    lang: LanguageCode
  ): string {
    switch (lang) {
      case 'ta':
        return `⚓ **அருகிலுள்ள மீன்பிடித் துறைமுகம்**: **${nearest.harbourName}**\n• **தூரம்**: ${nearest.distanceKm} கி.மீ (${nearest.distanceNm} கடல் மைல்)\n• **திசை & காம்பஸ்**: ${nearest.cardinal} (${nearest.bearingDegrees}°)\n• **ஆயத்தொலைவுகள்**: ${nearest.coordinates.lat.toFixed(3)}°N, ${nearest.coordinates.lng.toFixed(3)}°E`;
      case 'hi':
        return `⚓ **निकटतम बंदरगाह / लैंडिंग केंद्र**: **${nearest.harbourName}**\n• **दूरी**: ${nearest.distanceKm} किमी (${nearest.distanceNm} समुद्री मील)\n• **दिशा व कम्पास**: ${nearest.cardinal} (${nearest.bearingDegrees}°)\n• **निर्देशांक**: ${nearest.coordinates.lat.toFixed(3)}°N, ${nearest.coordinates.lng.toFixed(3)}°E`;
      case 'te':
        return `⚓ **సమీప హార్బర్ / ల్యాండింగ్ సెంటర్**: **${nearest.harbourName}**\n• **దూరం**: ${nearest.distanceKm} కి.మీ (${nearest.distanceNm} నాటికల్ మైళ్ళు)\n• **దిశ & దిక్సూచి**: ${nearest.cardinal} (${nearest.bearingDegrees}°)\n• **కోఆర్డినేట్లు**: ${nearest.coordinates.lat.toFixed(3)}°N, ${nearest.coordinates.lng.toFixed(3)}°E`;
      case 'ml':
        return `⚓ **ഏറ്റവും അടുത്തുള്ള ഹാർബർ**: **${nearest.harbourName}**\n• **ദൂരം**: ${nearest.distanceKm} കി.മീ (${nearest.distanceNm} നോട്ടിക്കൽ മൈൽ)\n• **ദിശ**: ${nearest.cardinal} (${nearest.bearingDegrees}° കോമ്പസ്)\n• **സ്ഥാനം**: ${nearest.coordinates.lat.toFixed(3)}°N, ${nearest.coordinates.lng.toFixed(3)}°E`;
      case 'kn':
        return `⚓ **ಹತ್ತಿರದ ಬಂದರು / ಲ್ಯಾಂಡಿಂಗ್ ಕೇಂದ್ರ**: **${nearest.harbourName}**\n• **ದೂರ**: ${nearest.distanceKm} ಕಿ.ಮೀ (${nearest.distanceNm} ನಾಟಿಕಲ್ ಮೈಲಿ)\n• **ದಿಕ್ಕು & ದಿಕ್ಸೂಚಿ**: ${nearest.cardinal} (${nearest.bearingDegrees}°)\n• **ಸ್ಥಾನ**: ${nearest.coordinates.lat.toFixed(3)}°N, ${nearest.coordinates.lng.toFixed(3)}°E`;
      case 'bn':
        return `⚓ **নিকটতম বন্দর / ল্যান্ডিং সেন্টার**: **${nearest.harbourName}**\n• **দূরত্ব**: ${nearest.distanceKm} কিমি (${nearest.distanceNm} নটিক্যাল মাইল)\n• **দিক ও কম্পাস**: ${nearest.cardinal} (${nearest.bearingDegrees}°)\n• **স্থানাঙ্ক**: ${nearest.coordinates.lat.toFixed(3)}°N, ${nearest.coordinates.lng.toFixed(3)}°E`;
      case 'en':
      default:
        return `⚓ **Nearest Port / Landing Centre**: **${nearest.harbourName}**\n• **Distance**: ${nearest.distanceKm} km (${nearest.distanceNm} Nautical Miles)\n• **Heading & Bearing**: ${nearest.cardinal} (${nearest.bearingDegrees}°)\n• **Coordinates**: ${nearest.coordinates.lat.toFixed(3)}°N, ${nearest.coordinates.lng.toFixed(3)}°E`;
    }
  }
}

