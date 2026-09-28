import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useThemeStore, ThemeMode } from '../../store/themeStore';

export const ThemeToggle: React.FC = () => {
  const { t } = useTranslation();
  const { theme, resolvedTheme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: { mode: ThemeMode; label: string; sublabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
    {
      mode: 'light',
      label: t('theme.light', 'Light Mode'),
      sublabel: t('theme.lightDesc', 'Crisp Nautical Daylight'),
      icon: Sun,
    },
    {
      mode: 'dark',
      label: t('theme.dark', 'Dark Mode'),
      sublabel: t('theme.darkDesc', 'Warm Sunset Espresso'),
      icon: Moon,
    },
    {
      mode: 'system',
      label: t('theme.system', 'System Sync'),
      sublabel: t('theme.systemDesc', 'Matches OS preference'),
      icon: Laptop,
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition shadow-sm text-xs font-medium bg-[#F4FAFD] hover:bg-[#E8F8FB] border-[#D7E7F0] text-[#123B6D] dark:bg-[#1E1216] dark:hover:bg-[#281B22] dark:border-[#563943] dark:text-[#FFF6EE]"
        title={t('theme.toggleTitle', 'Toggle Light or Dark Theme')}
        aria-label="Toggle Theme"
        aria-expanded={isOpen}
      >
        <span className="relative flex items-center justify-center w-4 h-4">
          {resolvedTheme === 'dark' ? (
            <Moon className="w-3.5 h-3.5 text-[#F59E0B] transition-transform duration-300 hover:rotate-12" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-[#1769AA] transition-transform duration-300 hover:rotate-45" />
          )}
        </span>
        <span className="hidden md:inline font-semibold text-[11px]">
          {theme === 'system' ? (
            t('theme.auto', 'Auto')
          ) : resolvedTheme === 'dark' ? (
            t('theme.darkShort', 'Dark')
          ) : (
            t('theme.lightShort', 'Light')
          )}
        </span>
        <ChevronDown className="w-3 h-3 text-[#55718D] dark:text-[#D4C2B6] opacity-75" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl p-1.5 z-50 shadow-2xl border animate-in fade-in slide-in-from-top-2 bg-white border-[#D7E7F0] dark:bg-[#24181E] dark:border-[#452D36]">
          <div className="px-3 py-1.5 border-b border-[#D7E7F0] dark:border-[#452D36] text-[10px] font-mono uppercase tracking-wider font-bold text-[#7890A5] dark:text-[#947F75]">
            {t('theme.appearance', 'Appearance')}
          </div>
          <div className="py-1 space-y-0.5">
            {options.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.mode;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  onClick={() => {
                    setTheme(opt.mode);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition text-xs ${
                    isSelected
                      ? 'bg-[#E8F8FB] text-[#123B6D] font-bold dark:bg-[#2E1B20] dark:text-[#FFF6EE]'
                      : 'text-[#55718D] hover:bg-[#F4FAFD] hover:text-[#123B6D] dark:text-[#D4C2B6] dark:hover:bg-[#1E1216] dark:hover:text-[#FFF6EE]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected
                          ? 'bg-[#19B7C9]/20 text-[#1769AA] dark:bg-[#C05615]/30 dark:text-[#F59E0B]'
                          : 'bg-black/5 text-[#55718D] dark:bg-white/5 dark:text-[#D4C2B6]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold leading-tight">{opt.label}</div>
                      <div className="text-[10px] text-[#7890A5] dark:text-[#947F75]">{opt.sublabel}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#19B7C9] dark:text-[#F59E0B] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
