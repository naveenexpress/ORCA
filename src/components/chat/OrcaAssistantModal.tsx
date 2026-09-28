import React, { useState } from 'react';
import { Send, Sparkles, X, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { VoiceSessionService } from '../../services/voice/voiceSessionService';
import { TTSManager } from '../../services/voice/tts/ttsManager';

export const OrcaAssistantModal: React.FC = () => {
  const { t } = useTranslation();
  const { isOpen, toggleChat, closeChat, messages, isTyping, sendMessage } = useChatStore();
  const { language } = useAuthStore();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);

  const [ttsManager] = useState(() => new TTSManager({
    onEnd: () => setActiveSpeakingMsgId(null),
    onError: () => setActiveSpeakingMsgId(null),
  }));

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input, language);
    setInput('');
  };

  const handleMicToggle = async () => {
    const voiceSession = VoiceSessionService.getInstance();
    if (isListening) {
      await voiceSession.stopSession();
      setIsListening(false);
    } else {
      setIsListening(true);
      await voiceSession.startSession(language);
      const unsubscribe = voiceSession.subscribe({
        onStateChange: (state) => {
          if (state !== 'listening') setIsListening(false);
        },
        onTranscript: (text) => {
          setInput(text);
        },
        onAiResponse: () => {},
        onError: () => setIsListening(false),
      });
      // auto unsubscribe after 10s
      setTimeout(unsubscribe, 10000);
    }
  };

  const handleSpeakMessage = (msgId: string, text: string) => {
    if (activeSpeakingMsgId === msgId) {
      ttsManager.stop();
      setActiveSpeakingMsgId(null);
    } else {
      ttsManager.stop();
      setActiveSpeakingMsgId(msgId);
      ttsManager.speak(text, language);
    }
  };

  return (
    <>
      {/* Floating Trigger Icon in Bottom Right */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 w-14 h-14 rounded-2xl bg-white dark:bg-[#1E1216] border border-[#D7E7F0] dark:border-[#563943] p-2 shadow-lg hover:shadow-xl hover:scale-105 transition flex items-center justify-center group"
          aria-label={t('nav.chat', 'Ask ORCA Assistant')}
        >
          <img
            src="/orca-symbol.png"
            alt="ORCA Assistant"
            className="w-full h-full object-contain group-hover:scale-110 transition duration-300"
          />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#19B7C9] rounded-full animate-ping" />
        </button>
      )}

      {/* Floating Modal Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-80 sm:w-96 h-[500px] bg-white dark:bg-[#1E1216] border border-[#D7E7F0] dark:border-[#563943] backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#F4FAFD] to-[#E8F8FB] dark:from-[#24181E] dark:to-[#2A1C24] border-b border-[#D7E7F0] dark:border-[#563943] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#140C14] border border-[#D7E7F0] dark:border-[#563943] p-1 flex items-center justify-center shadow-sm">
                <img src="/orca-symbol.png" alt="ORCA" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#123B6D] dark:text-[#FFF6EE]">{t('chat.title', 'ORCA Marine AI Assistant')}</h3>
                <span className="text-[10px] text-[#24A978] font-mono font-medium">{t('chat.verifiedSource', 'Verified INCOIS Data')}</span>
              </div>
            </div>
            <button
              onClick={closeChat}
              className="p-1 text-[#55718D] hover:text-[#123B6D] dark:text-[#D4C2B6] dark:hover:text-[#FFF6EE] rounded-lg hover:bg-[#E8F8FB] dark:hover:bg-white/5 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#F7FBFE] dark:bg-[#140C14]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSpeakingThis = activeSpeakingMsgId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm relative group ${
                      isUser
                        ? 'bg-[#E8F8FB] dark:bg-[#2E1D27] border border-[#CFE6EF] dark:border-[#563943] text-[#123B6D] dark:text-[#FFF6EE] font-semibold rounded-br-none'
                        : 'bg-white dark:bg-[#1E1216] border border-[#D7E7F0] dark:border-[#563943] text-[#123B6D] dark:text-[#FFF6EE] rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-line font-sans">{msg.text}</p>

                    {/* Audio speech icon for assistant responses */}
                    {!isUser && (
                      <div className="flex items-center justify-between pt-1 mt-1 border-t border-[#D7E7F0]/60 dark:border-[#563943]/60">
                        <span className="text-[9px] text-[#7890A5] font-mono">
                          {msg.sourceCitation || 'ORCA Multi-Agent'}
                        </span>
                        <button
                          onClick={() => handleSpeakMessage(msg.id, msg.text)}
                          className="p-1 text-[#1769AA] dark:text-[#E7A928] hover:bg-[#E8F8FB] dark:hover:bg-white/5 rounded-md transition flex items-center gap-1 text-[10px] font-bold"
                          title="Listen with Local Voice Synthesizer"
                        >
                          {isSpeakingThis ? (
                            <>
                              <VolumeX className="w-3 h-3 text-red-500 animate-pulse" />
                              <span className="text-red-500">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isTyping && (
              <div className="p-2 bg-white dark:bg-[#1E1216] border border-[#D7E7F0] dark:border-[#563943] rounded-xl text-[10px] text-[#1769AA] dark:text-[#E7A928] font-mono w-28 animate-pulse flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </div>

          {/* Input Bar with Microphone & Send Button */}
          <form onSubmit={handleSend} className="p-2.5 bg-white dark:bg-[#1E1216] border-t border-[#D7E7F0] dark:border-[#563943] flex gap-1.5 shrink-0 items-center">
            <button
              type="button"
              onClick={handleMicToggle}
              className={`p-2 rounded-xl transition shadow-sm ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-[#F4FAFD] hover:bg-[#E8F8FB] dark:bg-[#24181E] dark:hover:bg-[#2E1D27] text-[#1769AA] dark:text-[#E7A928] border border-[#CFE6EF] dark:border-[#563943]'
              }`}
              title={isListening ? 'Listening...' : 'Voice Input (whisper.cpp / WebSpeech)'}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chat.inputPlaceholder', 'Ask a question in your preferred language...')}
              className="flex-1 bg-[#F4FAFD] dark:bg-[#140C14] border border-[#D7E7F0] dark:border-[#563943] rounded-xl px-3 py-1.5 text-xs text-[#123B6D] dark:text-[#FFF6EE] placeholder-[#7890A5] focus:outline-none focus:border-[#19B7C9]"
            />

            <button
              type="submit"
              className="p-2 bg-[#1769AA] hover:bg-[#123B6D] text-white rounded-xl font-bold transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
