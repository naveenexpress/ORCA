import React from 'react';
import { Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CompassBearingProps {
  bearingDegrees: number;
  directionText: string;
  distanceKm: number;
  distanceNM: number;
  landingCentreName?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CompassBearing: React.FC<CompassBearingProps> = ({
  bearingDegrees,
  directionText,
  distanceKm,
  distanceNM,
  landingCentreName,
  size = 'md',
}) => {
  const { t } = useTranslation();
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';

  return (
    <div className={`flex items-center gap-4 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl ${isLarge ? 'p-4' : 'p-3'} shadow-sm`}>
      {/* Compass Dial */}
      <div className="relative flex items-center justify-center shrink-0">
        <div
          className={`rounded-full border-2 border-dashed border-[#19B7C9]/40 flex items-center justify-center bg-white shadow-inner ${
            isLarge ? 'w-20 h-20' : isSmall ? 'w-12 h-12' : 'w-16 h-16'
          }`}
        >
          {/* Compass Rose Cardinal Markers */}
          <span className="absolute top-0.5 text-[9px] font-mono text-[#1769AA] font-bold">N</span>
          <span className="absolute bottom-0.5 text-[9px] font-mono text-[#7890A5]">S</span>
          <span className="absolute left-1 text-[9px] font-mono text-[#7890A5]">W</span>
          <span className="absolute right-1 text-[9px] font-mono text-[#7890A5]">E</span>

          {/* Rotating Direction Needle */}
          <div
            className="w-full h-full absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-out"
            style={{ transform: `rotate(${bearingDegrees}deg)` }}
          >
            <div className="flex flex-col items-center justify-between h-4/5">
              <Navigation className="w-4 h-4 text-[#168DCC] fill-[#168DCC]" />
              <div className="w-1 h-1 rounded-full bg-[#123B6D]" />
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Bearing Data */}
      <div className="space-y-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#123B6D] bg-[#E8F8FB] border border-[#CFE6EF] px-1.5 py-0.5 rounded">
            {bearingDegrees}° {directionText}
          </span>
          {landingCentreName && (
            <span className="text-[11px] text-[#55718D] truncate max-w-[140px]">
              {t('common.from', 'from')} {landingCentreName}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-base font-bold text-[#123B6D] font-mono">
            {distanceNM} <span className="text-xs font-normal text-[#55718D]">NM</span>
          </span>
          <span className="text-xs text-[#55718D] font-mono">
            ({distanceKm} km)
          </span>
        </div>
      </div>
    </div>
  );
};
