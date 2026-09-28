import React, { useState } from 'react';
import {
  Key,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  X,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useMapStore } from '../../store/mapStore';

interface CartoApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartoApiKeyModal: React.FC<CartoApiKeyModalProps> = ({ isOpen, onClose }) => {
  const { cartoApiKey, setCartoApiKey, setTileProvider, activeTileProvider } = useMapStore();
  const [inputKey, setInputKey] = useState(cartoApiKey);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = inputKey.trim();
    setCartoApiKey(cleanKey);
    if (cleanKey) {
      setTileProvider('carto_dark');
      setStatusMessage('CARTO API Key saved and applied! CARTO Dark is now active.');
    } else {
      setStatusMessage('CARTO API Key cleared.');
    }
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleSwitchToEsriDark = () => {
    setTileProvider('esri_dark');
    setStatusMessage('Switched to Clean Dark Basemap (Esri Dark Canvas). Zero watermarks!');
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleCopyEnvExample = () => {
    navigator.clipboard.writeText('VITE_CARTO_API_KEY=your_carto_api_key_here');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl bg-white border border-[#D7E7F0] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#D7E7F0] bg-[#F4FAFD]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E8F8FB] text-[#1769AA] rounded-xl">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#123B6D] flex items-center gap-2">
                <span>CARTO Basemaps API Key & Tile Workflow</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-[#E8F8FB] text-[#1769AA] border border-[#CFE6EF] rounded font-bold">
                  GIS Config
                </span>
              </h2>
              <p className="text-xs text-[#55718D]">
                Configure your key to remove &quot;API KEY REQUIRED&quot; watermarks or use the clean dark map.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#55718D] hover:text-[#123B6D] rounded-lg hover:bg-[#E8F8FB] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Status Alert */}
          {statusMessage && (
            <div className="p-3 bg-[#EAF8F1] border border-[#BFE7D1] text-[#16845F] text-xs rounded-xl flex items-center gap-2 animate-in fade-in font-medium">
              <CheckCircle className="w-4 h-4 text-[#24A978] shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Current Key Status Card */}
          <div className="p-4 rounded-xl border border-[#D7E7F0] bg-[#F4FAFD] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#123B6D] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1769AA]" />
                Current Status
              </span>
              {cartoApiKey ? (
                <span className="px-2 py-0.5 text-[11px] font-mono bg-[#EAF8F1] text-[#16845F] border border-[#BFE7D1] rounded-full flex items-center gap-1 font-bold">
                  <CheckCircle className="w-3 h-3" /> Key Active
                </span>
              ) : (
                <span className="px-2 py-0.5 text-[11px] font-mono bg-[#FFF7E3] text-[#E7A928] border border-[#F0D98C] rounded-full flex items-center gap-1 font-bold">
                  <AlertTriangle className="w-3 h-3" /> Key Not Set (Watermark on CARTO)
                </span>
              )}
            </div>

            <p className="text-xs text-[#55718D]">
              {cartoApiKey ? (
                <>
                  Active CARTO API Key is loaded and appended to all basemap tile requests.
                  Current Active Provider: <strong className="text-[#1769AA]">{activeTileProvider}</strong>
                </>
              ) : (
                <>
                  CARTO now enforces an API key on their raster tile CDN. Without a key, tiles display an
                  &quot;API KEY REQUIRED&quot; diagonal watermark.
                </>
              )}
            </p>
          </div>

          {/* 3-Step Workflow Guide */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-[#123B6D] uppercase tracking-wider font-mono">
              3-Step Setup Workflow
            </h3>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-[#F4FAFD] border border-[#D7E7F0] flex items-start gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E8F8FB] text-[#1769AA] font-bold border border-[#CFE6EF] text-[10px] shrink-0">
                  1
                </span>
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#123B6D]">Get a Free CARTO API Key</span>
                    <a
                      href="https://carto.com/basemaps/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1769AA] hover:bg-[#123B6D] text-white font-extrabold rounded text-[10px] transition shadow-sm"
                    >
                      <span>carto.com/basemaps/apikey</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-[11px] text-[#55718D]">
                    CARTO provides a <strong>100% free tier</strong> of up to 5,000,000 tile requests per month. No credit card required.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F4FAFD] border border-[#D7E7F0] flex items-start gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E8F8FB] text-[#1769AA] font-bold border border-[#CFE6EF] text-[10px] shrink-0">
                  2
                </span>
                <div className="space-y-0.5">
                  <span className="font-semibold text-[#123B6D]">Enter Your Email &amp; Check Inbox</span>
                  <p className="text-[11px] text-[#55718D]">
                    Submit the form on CARTO&apos;s page to instantly receive your API key token.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F4FAFD] border border-[#D7E7F0] flex items-start gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E8F8FB] text-[#1769AA] font-bold border border-[#CFE6EF] text-[10px] shrink-0">
                  3
                </span>
                <div className="space-y-0.5">
                  <span className="font-semibold text-[#123B6D]">Paste Below &amp; Save</span>
                  <p className="text-[11px] text-[#55718D]">
                    Paste your key into the field below. It is stored locally in your browser and synced instantly with Leaflet.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Input Form */}
          <form onSubmit={handleSave} className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-[#123B6D]">
              Enter or Paste CARTO API Key
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Paste your CARTO API key token here..."
                className="flex-1 bg-white border border-[#C9DDE8] focus:border-[#19B7C9] rounded-xl px-3 py-2 text-xs text-[#123B6D] font-mono placeholder:text-[#7890A5] focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1769AA] hover:bg-[#123B6D] text-white font-extrabold text-xs rounded-xl shadow-sm transition shrink-0"
              >
                Save Key
              </button>
            </div>
            {cartoApiKey && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setInputKey('');
                    setCartoApiKey('');
                    setStatusMessage('API Key removed.');
                  }}
                  className="text-xs text-[#E5484D] hover:underline"
                >
                  Remove Stored Key
                </button>
              </div>
            )}
          </form>

          {/* Quick Alternative: Clean Dark Basemap without Key */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#F4FAFD] to-[#E8F8FB] border border-[#CFE6EF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#123B6D] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#19B7C9]" />
                Don&apos;t want to request an API key right now?
              </span>
              <p className="text-[11px] text-[#55718D]">
                Switch to <strong>Clean Dark (Esri Dark Canvas)</strong>. High-resolution dark marine theme with zero watermarks and no key required.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSwitchToEsriDark}
              className="px-3 py-2 bg-white hover:bg-[#E8F8FB] text-[#1769AA] border border-[#BFD6E4] font-bold text-xs rounded-xl transition shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <MapPin className="w-3.5 h-3.5 text-[#1769AA]" />
              <span>Use Clean Dark (Esri)</span>
            </button>
          </div>

          {/* Developer Environment Variable Guide */}
          <div className="pt-2 border-t border-[#D7E7F0] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#55718D] uppercase font-bold">
                Permanent Deployment (.env)
              </span>
              <button
                type="button"
                onClick={handleCopyEnvExample}
                className="text-[10px] font-mono text-[#1769AA] hover:underline flex items-center gap-1 font-bold"
              >
                {copied ? <Check className="w-3 h-3 text-[#24A978]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-2.5 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl font-mono text-[11px] text-[#123B6D] select-all">
              VITE_CARTO_API_KEY=your_carto_api_key_here
            </div>
            <p className="text-[10px] text-[#7890A5]">
              Add this to your project&apos;s <code className="text-[#1769AA] font-bold">.env</code> file to embed the key automatically across all development and production builds.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-[#D7E7F0] bg-[#F4FAFD]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-[#E8F8FB] border border-[#BFD6E4] text-[#123B6D] font-bold text-xs rounded-xl transition shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
