import { LanguageCode, PfzAdvisory } from '../types';
import { MarineAgentOrchestrator } from './agents/marineAgentOrchestrator';
import { AgentQueryResult } from './agents/types';

export interface IntentResult {
  text: string;
  isVerifiedData?: boolean;
  sourceCitation?: string;
  dataTimestamp?: string;
  quickActions?: { label: string; action: string; payload?: any }[];
  cardPreview?: {
    type: 'pfz' | 'case' | 'sos' | 'weather' | 'agent';
    data: any;
  };
}

/**
 * Unified Chat Query Processor:
 * All user queries (typed or voice transcribed) execute through the exact same
 * MarineAgentOrchestrator, ensuring data freshness and zero hallucinations.
 */
export async function processUserChatQuery(
  query: string,
  language: LanguageCode = 'en',
  activeAdvisories?: PfzAdvisory[]
): Promise<IntentResult> {
  const result: AgentQueryResult = await MarineAgentOrchestrator.processMarineQuery(
    query,
    language,
    activeAdvisories
  );

  return {
    text: result.text,
    isVerifiedData: result.isVerifiedData,
    sourceCitation: result.sourceCitation,
    dataTimestamp: result.dataTimestamp,
    quickActions: result.quickActions,
    cardPreview: result.cardPreview,
  };
}


