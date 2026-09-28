import { LanguageCode, PfzAdvisory } from '../../types';
import { usePfzStore } from '../../store/pfzStore';
import { LocationService } from '../locationService';

export class PfzAgent {
  /**
   * Find best active PFZ advisory matching landing centre or return highest confidence
   */
  public static getMatchingAdvisory(query: string, activeAdvisories?: PfzAdvisory[]): PfzAdvisory {
    if (!activeAdvisories) activeAdvisories = usePfzStore.getState().advisories;
    const q = query.toLowerCase();
    const published = activeAdvisories.filter((a) => a.status === 'published');
    const pool = published.length > 0 ? published : activeAdvisories;

    const matched = pool.find(
      (a) =>
        q.includes(a.landingCentreName.toLowerCase()) ||
        q.includes(a.district.toLowerCase()) ||
        q.includes(a.state.toLowerCase()) ||
        q.includes(a.name.toLowerCase())
    );

    if (matched) return matched;

    const resolved = LocationService.resolveLocation(query, pool);
    if (resolved.matchedAdvisory) return resolved.matchedAdvisory;

    return pool[0];
  }

  /**
   * Format localized PFZ response preserving precise numerical data
   */
  public static formatPfzResponse(advisory: PfzAdvisory, lang: LanguageCode): string {
    const direction = advisory.directionFromLandingCentre;
    const distanceKm = advisory.distanceKm;
    const distanceNm = advisory.distanceFromLandingCentre;
    const depth = advisory.depth;
    const bearing = advisory.bearingDegrees;
    const sst = advisory.seaSurfaceTemperature;
    const chloro = advisory.chlorophyll;
    const species = advisory.targetSpecies.join(', ');
    const harbour = advisory.landingCentreName;
    const zoneName = advisory.name;
    const confidence = advisory.confidence;

    switch (lang) {
      case 'ta':
        return `🐟 **${harbour} அருகிலுள்ள இன்றைய சிறந்த PFZ மண்டலம்**: ${zoneName}\n• **திசை & தலைப்பு**: ${direction} (${bearing}° காம்பஸ்)\n• **தூரம்**: ${distanceKm} கி.மீ (${distanceNm} கடல் மைல்)\n• **ஆழம்**: ${depth} மீட்டர்\n• **கடல் வெப்பநிலை (SST)**: ${sst}°C | **குளோரோபில்**: ${chloro} mg/m³\n• **இலக்கு மீன்கள்**: ${species}\n• **நம்பிக்கை நிலை**: ${confidence}`;

      case 'hi':
        return `🐟 **${harbour} के पास आज का सक्रिय मछली पकड़ने का क्षेत्र (PFZ)**: ${zoneName}\n• **दिशा व कम्पास**: ${direction} (${bearing}°)\n• **दूरी**: ${distanceKm} किमी (${distanceNm} समुद्री मील)\n• **गहराई**: ${depth} मीटर\n• **समुद्री सतह तापमान (SST)**: ${sst}°C | **क्लोरोफिल**: ${chloro} mg/m³\n• **प्रमुख मछलियां**: ${species}\n• **सटीकता**: ${confidence}`;

      case 'te':
        return `🐟 **${harbour} సమీపంలోని నేటి ఉత్తమ మత్స్య క్షేత్రం (PFZ)**: ${zoneName}\n• **దిశ & హెడ్డింగ్**: ${direction} (${bearing}° దిక్సూచి)\n• **దూరం**: ${distanceKm} కి.మీ (${distanceNm} నాటికల్ మైళ్ళు)\n• **లోతు**: ${depth} మీటర్లు\n• **సముద్ర ఉపరితల ఉష్ణోగ్రత (SST)**: ${sst}°C | **క్లోరోఫిల్**: ${chloro} mg/m³\n• **లక్ష్య చేపలు**: ${species}\n• **ఖచ్చితత్వం**: ${confidence}`;

      case 'ml':
        return `🐟 **${harbour} അടുത്തുള്ള ഇന്നത്തെ പ്രധാന മത്സ്യബന്ധന മേഖല (PFZ)**: ${zoneName}\n• **ദിശ**: ${direction} (${bearing}° കോമ്പസ്)\n• **ദൂരം**: ${distanceKm} കി.മീ (${distanceNm} നോട്ടിക്കൽ മൈൽ)\n• **ആഴം**: ${depth} മീറ്റർ\n• **സമുദ്രോപരിതല താപനില (SST)**: ${sst}°C | **ക്ലോറോഫിൽ**: ${chloro} mg/m³\n• **ലഭ്യമായ മത്സ്യങ്ങൾ**: ${species}\n• **കൃത്യത**: ${confidence}`;

      case 'kn':
        return `🐟 **${harbour} ಬಳಿಯ ಇಂದಿನ ಪ್ರಮುಖ ಮೀನುಗಾರಿಕೆ ವಲಯ (PFZ)**: ${zoneName}\n• **ದಿಕ್ಕು & ಬೇರಿಂಗ್**: ${direction} (${bearing}° ದಿಕ್ಸೂಚಿ)\n• **ದೂರ**: ${distanceKm} ಕಿ.ಮೀ (${distanceNm} ನಾಟಿಕಲ್ ಮೈಲಿ)\n• **ಆಳ**: ${depth} ಮೀಟರ್\n• **ಸಮುದ್ರದ ಮೇಲ್ಮೈ ತಾಪಮಾನ (SST)**: ${sst}°C | **ಕ್ಲೋರೊಫಿಲ್**: ${chloro} mg/m³\n• **ಪ್ರಮುಖ ಮೀನುಗಳು**: ${species}\n• **ವಿಶ್ವಾಸಾರ್ಹತೆ**: ${confidence}`;

      case 'bn':
        return `🐟 **${harbour}-এর কাছে আজকের সেরা সম্ভাব্য মৎস্য অঞ্চল (PFZ)**: ${zoneName}\n• **দিক ও বিয়ারিং**: ${direction} (${bearing}° কম্পাস)\n• **দূরত্ব**: ${distanceKm} কিমি (${distanceNm} নটিক্যাল মাইল)\n• **গভীরতা**: ${depth} মিটার\n• **সমুদ্র পৃষ্ঠের তাপমাত্রা (SST)**: ${sst}°C | **ক্লোরোফিল**: ${chloro} mg/m³\n• **প্রধান মাছ**: ${species}\n• **নির্ভরযোগ্যতা**: ${confidence}`;

      case 'en':
      default:
        return `🐟 **Active Potential Fishing Zone near ${harbour}**: **${zoneName}**\n• **Compass Heading & Direction**: ${direction} (${bearing}°)\n• **Distance**: ${distanceKm} km (${distanceNm} Nautical Miles)\n• **Operational Depth**: ${depth} meters\n• **Sea Surface Temperature (SST)**: ${sst}°C | **Chlorophyll**: ${chloro} mg/m³\n• **Target Species**: ${species}\n• **Advisory Confidence**: ${confidence}`;
    }
  }

  /**
   * Format localized response for all active PFZ advisories
   */
  public static formatAllPfzResponse(advisories: PfzAdvisory[], lang: LanguageCode): string {
    const published = advisories.filter((a) => a.status === 'published');
    const pool = published.length > 0 ? published : advisories;

    const introMap: Record<LanguageCode, string> = {
      ta: '🌊 **அனைத்து செயலில் உள்ள மீன்பிடி மண்டலங்கள் (PFZ)**:',
      hi: '🌊 **सभी सक्रिय मत्स्य पालन क्षेत्र (PFZ)**:',
      te: '🌊 **అన్ని క్రియాశీల మత్స్య క్షేత్రాలు (PFZ)**:',
      ml: '🌊 **എല്ലാ സജീവ മത്സ്യബന്ധന മേഖലകളും (PFZ)**:',
      kn: '🌊 **ಎಲ್ಲಾ ಸಕ್ರಿಯ ಮೀನುಗಾರಿಕೆ ವಲಯಗಳು (PFZ)**:',
      bn: '🌊 **সমস্ত সক্রিয় মৎস্য অঞ্চল (PFZ)**:',
      en: '🌊 **All Active Potential Fishing Zones (PFZ)**:',
    };

    const intro = introMap[lang] || introMap.en;
    
    const formattedList = pool.map(advisory => {
      const harbour = advisory.landingCentreName;
      const zoneName = advisory.name;
      const distanceKm = advisory.distanceKm;
      const species = advisory.targetSpecies.join(', ');
      
      switch (lang) {
        case 'ta': return `📍 **${harbour}**: ${zoneName} (${distanceKm} கி.மீ) - ${species}`;
        case 'hi': return `📍 **${harbour}**: ${zoneName} (${distanceKm} किमी) - ${species}`;
        case 'te': return `📍 **${harbour}**: ${zoneName} (${distanceKm} కి.మీ) - ${species}`;
        case 'ml': return `📍 **${harbour}**: ${zoneName} (${distanceKm} കി.മീ) - ${species}`;
        case 'kn': return `📍 **${harbour}**: ${zoneName} (${distanceKm} ಕಿ.ಮೀ) - ${species}`;
        case 'bn': return `📍 **${harbour}**: ${zoneName} (${distanceKm} কিমি) - ${species}`;
        case 'en':
        default: return `📍 **${harbour}**: ${zoneName} (${distanceKm} km) - ${species}`;
      }
    }).join('\n');

    return `${intro}\n\n${formattedList}`;
  }
}

