import React from 'react';
import { X, CheckCircle2, AlertCircle, Cpu, Volume2, Mic } from 'lucide-react';
import { LANGUAGE_CAPABILITY_MATRIX } from '../../services/voice/languageMatrix';
import { LanguageCode } from '../../types';

interface LanguageMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
}

export const LanguageMatrixModal: React.FC<LanguageMatrixModalProps> = ({
  isOpen,
  onClose,
  activeLanguage,
  onSelectLanguage,
}) => {
  if (!isOpen) return null;

  const languages = Object.values(LANGUAGE_CAPABILITY_MATRIX);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1216] border border-[#D7E7F0] dark:border-[#563943] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#D7E7F0] dark:border-[#563943] flex items-center justify-between bg-[#F4FAFD] dark:bg-[#24181E]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#E8F8FB] dark:bg-[#2E1D27] text-[#1769AA] dark:text-[#E7A928] rounded-2xl border border-[#CFE6EF] dark:border-[#563943]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#123B6D] dark:text-[#FFF6EE]">
                Multilingual Voice & AI Capability Matrix
              </h2>
              <p className="text-xs text-[#55718D] dark:text-[#D4C2B6]">
                Offline STT (whisper.cpp), Multi-Agent AI, and Local TTS (Coqui & Device Synthesizer)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#55718D] hover:text-[#123B6D] dark:text-[#D4C2B6] dark:hover:text-[#FFF6EE] rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Matrix Table */}
        <div className="flex-1 overflow-auto p-5 space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-[#D7E7F0] dark:border-[#563943]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7FBFE] dark:bg-[#2A1C24] text-[#123B6D] dark:text-[#FFF6EE] font-bold border-b border-[#D7E7F0] dark:border-[#563943]">
                <tr>
                  <th className="p-3">Language</th>
                  <th className="p-3">
                    <span className="flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-[#1769AA]" /> STT Engine
                    </span>
                  </th>
                  <th className="p-3">Multi-Agent AI</th>
                  <th className="p-3">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-[#168DCC]" /> TTS Engine
                    </span>
                  </th>
                  <th className="p-3">Voice Pipeline</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7E7F0] dark:divide-[#563943] bg-white dark:bg-[#1E1216]">
                {languages.map((item) => {
                  const isCurrent = item.code === activeLanguage;
                  return (
                    <tr
                      key={item.code}
                      className={`hover:bg-[#F4FAFD] dark:hover:bg-[#24181E] transition ${
                        isCurrent ? 'bg-[#E8F8FB]/50 dark:bg-[#2E1D27]/50 font-medium' : ''
                      }`}
                    >
                      <td className="p-3">
                        <div className="font-bold text-[#123B6D] dark:text-[#FFF6EE]">
                          {item.nativeName} ({item.displayName})
                        </div>
                        <span className="text-[10px] text-[#7890A5] font-mono">{item.localeTag}</span>
                      </td>

                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1]">
                          <CheckCircle2 className="w-3 h-3" />
                          {item.sttEngine}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1]">
                          <CheckCircle2 className="w-3 h-3" />
                          {item.aiResponseStatus}
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            item.ttsEngine === 'Coqui TTS'
                              ? 'bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1]'
                              : 'bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]'
                          }`}
                        >
                          {item.ttsEngine}
                        </span>
                        <div className="text-[10px] text-[#7890A5] mt-0.5">{item.ttsStatus}</div>
                      </td>

                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                          {item.voiceStatus}
                        </span>
                      </td>

                      <td className="p-3">
                        {isCurrent ? (
                          <span className="text-xs font-bold text-[#1769AA] dark:text-[#E7A928]">Active</span>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectLanguage(item.code);
                              onClose();
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#F4FAFD] hover:bg-[#E8F8FB] dark:bg-[#24181E] dark:hover:bg-[#2E1D27] text-[#123B6D] dark:text-[#FFF6EE] border border-[#CFE6EF] dark:border-[#563943] transition"
                          >
                            Select
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[#F4FAFD] dark:bg-[#24181E] rounded-2xl border border-[#D7E7F0] dark:border-[#563943] text-xs text-[#55718D] dark:text-[#D4C2B6] space-y-2">
            <h4 className="font-bold text-[#123B6D] dark:text-[#FFF6EE] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-[#1769AA] dark:text-[#E7A928]" />
              Transparent Local TTS & STT Architecture:
            </h4>
            <p>
              • <strong>STT Pipeline</strong>: Automatically checks for a running local <code>whisper.cpp</code> server on port 8080. If offline, it smoothly switches to the native on-device WebSpeech engine without interrupting the user.
            </p>
            <p>
              • <strong>TTS Pipeline</strong>: Coqui TTS natively supports English and Hindi models. For regional Indian languages (Tamil, Telugu, Malayalam, Kannada, Bengali), our system detects missing weights and utilizes high-fidelity on-device voice synthesis calibrated for nautical clarity.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#D7E7F0] dark:border-[#563943] flex justify-end bg-[#F4FAFD] dark:bg-[#24181E]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1769AA] hover:bg-[#123B6D] text-white font-bold text-xs rounded-xl transition shadow-sm"
          >
            Close Capability Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
