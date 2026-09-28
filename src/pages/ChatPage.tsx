import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore';
import {
  Send,
  Sparkles,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { messages, isTyping, sendMessage, clearMessages } = useChatStore();
  const { language } = useAuthStore();
  const [inputText, setInputText] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText, language);
    setInputText('');
  };

  const handleQuickAction = (action: string, payload?: any) => {
    if (action === 'NAVIGATE_MAP') {
      navigate(`/map?focus=${payload?.pfzId}`);
    } else if (action === 'TRIGGER_SOS') {
      navigate('/sos');
    } else if (action === 'NAVIGATE_RESEARCH') {
      navigate('/dashboard');
    } else if (action === 'QUERY_PFZ') {
      sendMessage(`Show today's best PFZ near ${payload}`, language);
    } else if (action === 'QUERY_SOS') {
      sendMessage('What are the official Indian Coast Guard maritime emergency contact protocols?', language);
    } else if (action === 'QUERY_SST') {
      sendMessage('Explain sea surface temperature and chlorophyll ocean fronts', language);
    } else {
      sendMessage(action, language);
    }
  };

  return (
    <div className="space-y-4 pb-12 max-w-4xl mx-auto h-[calc(100vh-5.5rem)] flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 bg-white border border-[#D7E7F0] rounded-2xl shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white border border-[#D7E7F0] p-1 flex items-center justify-center shadow-sm">
            <img src="/orca-symbol.png" alt="ORCA Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#123B6D]">{t('chat.title', 'ORCA Multilingual Marine Assistant')}</h2>
              <span className="px-2 py-0.5 bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1] rounded text-[10px] font-mono font-bold">
                {t('chat.verifiedSource', 'INCOIS VERIFIED RAG')}
              </span>
            </div>
            <p className="text-[11px] text-[#55718D] font-mono">
              Active Language: <strong className="text-[#1769AA] uppercase">{language}</strong> &bull; Zero Paid Cloud APIs
            </p>
          </div>
        </div>

        <button
          onClick={clearMessages}
          className="p-2 text-[#7890A5] hover:text-[#E5484D] rounded-lg hover:bg-[#FFF0F1] transition"
          title="Clear Conversation History"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-[#F7FBFE] border border-[#D7E7F0] rounded-3xl p-5 overflow-y-auto space-y-4 shadow-sm">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div
                className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed space-y-2.5 ${
                  isUser
                    ? 'bg-[#1769AA] text-white font-medium rounded-br-none shadow-sm'
                    : 'bg-white border border-[#D7E7F0] text-[#123B6D] rounded-bl-none shadow-sm'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between text-[10px] text-[#55718D] font-mono border-b border-[#D7E7F0] pb-1.5">
                    <span className="text-[#1769AA] font-bold">{msg.senderName || 'ORCA Assistant'}</span>
                    {msg.sourceCitation && (
                      <span className="flex items-center gap-1 text-[#24A978]">
                        <ShieldCheck className="w-3 h-3" />
                        {msg.sourceCitation}
                      </span>
                    )}
                  </div>
                )}

                <div className="whitespace-pre-line font-sans">{msg.text}</div>

                {/* Card Preview if attached */}
                {msg.cardPreview?.type === 'pfz' && (
                  <div className="p-3 bg-[#F4FAFD] border border-[#CFE6EF] rounded-xl space-y-2 text-[#123B6D] font-mono">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-[#123B6D]">{msg.cardPreview.data.name}</span>
                      <span className="text-[#24A978] font-bold">{msg.cardPreview.data.confidence}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px] text-[#55718D]">
                      <div>Bearing: {msg.cardPreview.data.bearingDegrees}° {msg.cardPreview.data.directionFromLandingCentre}</div>
                      <div>Dist: {msg.cardPreview.data.distanceKm} km</div>
                    </div>
                  </div>
                )}

                {/* Quick Actions Buttons */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.quickActions.map((qa, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleQuickAction(qa.action, qa.payload)}
                        className="px-2.5 py-1 bg-white border border-[#BFD6E4] hover:border-[#19B7C9] rounded-lg text-[11px] text-[#1769AA] hover:bg-[#E8F8FB] font-medium transition"
                      >
                        {qa.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-[10px] text-[#7890A5] font-mono px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 p-3 bg-white border border-[#D7E7F0] rounded-2xl w-32 shadow-sm text-xs text-[#1769AA] font-mono">
            <Sparkles className="w-4 h-4 animate-spin text-[#19B7C9]" />
            <span>Reasoning...</span>
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="flex gap-2 shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t('chat.inputPlaceholder', 'Ask a question in your preferred language...')}
          className="flex-1 bg-white border border-[#C9DDE8] rounded-2xl px-4 py-3 text-xs text-[#123B6D] focus:outline-none focus:border-[#19B7C9] shadow-sm"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-[#1769AA] hover:bg-[#123B6D] text-white font-extrabold text-xs rounded-2xl shadow-sm flex items-center gap-2 transition"
        >
          <Send className="w-4 h-4" />
          <span>{t('common.submit', 'Send')}</span>
        </button>
      </form>
    </div>
  );
};
