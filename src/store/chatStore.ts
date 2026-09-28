import { create } from 'zustand';
import { ChatMessage, LanguageCode } from '../types';
import { processUserChatQuery } from '../services/chatService';

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isOpen: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (text: string, lang?: LanguageCode) => void;
  clearMessages: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-01',
    sender: 'assistant',
    senderName: 'ORCA Marine Assistant',
    text: '🌊 Vanakkam & Welcome! I am ORCA — your Maritime Intelligence & PFZ Assistant.\n\nI can provide today’s satellite-derived PFZ locations, compass bearings, safe depth advice, or coordinate SOS responses in multiple languages.',
    timestamp: new Date().toISOString(),
    language: 'en',
    isVerifiedData: true,
    sourceCitation: 'INCOIS PFZ Ocean Intelligence Grid',
    quickActions: [
      { label: '🐟 Today\'s Kasimedu PFZs', action: 'QUERY_PFZ', payload: 'Kasimedu' },
      { label: '🧭 Bearing & Distance to PFZ', action: 'QUERY_BEARING' },
      { label: '🚨 Maritime SOS Protocols', action: 'QUERY_SOS' },
    ],
  },
];

export const useChatStore = create<ChatState>((set) => ({
  messages: INITIAL_MESSAGES,
  isTyping: false,
  isOpen: false,

  toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),

  sendMessage: (text: string, lang: LanguageCode = 'en') => {
    const userMsg: ChatMessage = {
      id: `msg-usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
      language: lang,
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isTyping: true,
    }));

    // Simulate natural AI reasoning response delay if needed, or just await
    setTimeout(async () => {
      try {
        const response = await processUserChatQuery(text, lang);
        const assistantMsg: ChatMessage = {
          id: `msg-ast-${Date.now()}`,
          sender: 'assistant',
          senderName: 'ORCA Marine Reasoning Agent',
          text: response.text,
          timestamp: new Date().toISOString(),
          language: lang,
          confidenceScore: 0.98,
          isVerifiedData: response.isVerifiedData,
          sourceCitation: response.sourceCitation,
          quickActions: response.quickActions,
          cardPreview: response.cardPreview,
        };

        set((state) => ({
          messages: [...state.messages, assistantMsg],
          isTyping: false,
        }));
      } catch (error) {
        set((state) => ({
          messages: [...state.messages, {
            id: `msg-err-${Date.now()}`,
            sender: 'assistant',
            senderName: 'System',
            text: 'I am currently unable to reach the marine intelligence servers. Please try again.',
            timestamp: new Date().toISOString(),
            language: lang,
          }],
          isTyping: false,
        }));
      }
    }, 600);
  },

  clearMessages: () => set({ messages: INITIAL_MESSAGES }),
}));
