import React from 'react';
import { AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SafetyDisclaimerProps {
  compact?: boolean;
}

export const SafetyDisclaimer: React.FC<SafetyDisclaimerProps> = ({ compact = false }) => {
  const { t } = useTranslation();

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FFFDF5] border border-[#F0D98C] rounded-lg text-[#55718D] text-xs font-mono">
        <AlertTriangle className="w-4 h-4 text-[#E7A928] shrink-0" />
        <span className="truncate">
          <strong className="text-[#123B6D]">{t('safety.advisoryOnly', 'Advisory Only:')}</strong> {t('safety.compactText', 'Satellite derived. Not a guarantee of fish availability or sea safety.')}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFDF5] border border-[#F0D98C] rounded-xl p-4 shadow-sm text-[#55718D] text-sm">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-[#FFF7E3] border border-[#F0D98C] rounded-lg text-[#E7A928] shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5 text-[#E7A928]" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-[#123B6D]">{t('safety.title', 'Statutory Marine Advisory & Safe Fishing Guidance')}</h4>
            <span className="px-2 py-0.5 bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] rounded text-[11px] font-mono font-bold">
              {t('safety.satelliteDerived', 'INCOIS SATELLITE DERIVED')}
            </span>
          </div>
          <p className="text-xs text-[#55718D] leading-relaxed">
            {t('safety.description', 'Potential Fishing Zone (PFZ) information is an oceanographic advisory indicating chlorophyll and thermal aggregation fronts. It is not a guarantee of fish catch, nor a replacement for official marine weather warnings, navigation charts, or Coast Guard safety directives.')}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-[#7890A5]">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#24A978]" /> <span className="text-[#24A978] font-medium">{t('safety.compliant', 'Compliant with Indian Ocean Information Service Guidelines')}</span>
            </span>
            <span className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#1769AA]" /> <span className="text-[#55718D]">{t('safety.hotline', 'Marine Emergency Hotline: 1554 (Coast Guard)')}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
