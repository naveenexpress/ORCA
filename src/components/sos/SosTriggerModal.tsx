import React, { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle, MapPin, Navigation, PhoneCall, Radio, ShieldAlert, Users, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { useNotifStore } from '../../store/notifStore';
import { useSosStore } from '../../store/sosStore';
import { SosEmergencyType } from '../../types';
import { LocationService } from '../../services/locationService';

const EMERGENCY_TYPES: SosEmergencyType[] = [
  'Vessel Engine Breakdown / Drifting',
  'Medical Emergency at Sea',
  'Missing Fishermen / Capsize',
  'Extreme Weather / Cyclone Trap',
  'Vessel Collision',
  'Stranded on Reef / Shoal',
  'Other Maritime Threat',
];

export const SosTriggerModal: React.FC = () => {
  const { t } = useTranslation();
  const { isTriggerModalOpen, closeTriggerModal, triggerNewSos } = useSosStore();
  const { currentUser } = useAuthStore();
  const { addNotification } = useNotifStore();

  const resolvedInitial = LocationService.resolveLocation();

  const [step, setStep] = useState<'confirm' | 'details' | 'success'>('confirm');
  const [emergencyType, setEmergencyType] = useState<SosEmergencyType>('Vessel Engine Breakdown / Drifting');
  const [peopleCount, setPeopleCount] = useState<number>(4);
  const [callerName, setCallerName] = useState(currentUser?.name || 'Murugan Selvam');
  const [callerPhone, setCallerPhone] = useState(currentUser?.phone || '+91 98401 23456');
  const [vesselNumber, setVesselNumber] = useState('IND-TN-02-MM-4412');
  const [locationDesc, setLocationDesc] = useState(
    currentUser?.landingCentre
      ? `15 NM Offshore ${currentUser.landingCentre}`
      : `${resolvedInitial.name} Offshore`
  );
  const [lat, setLat] = useState<number>(resolvedInitial.lat);
  const [lng, setLng] = useState<number>(resolvedInitial.lng);
  const [_isGpsLocked, setIsGpsLocked] = useState(true);
  const [dispatchedIncidentId, setDispatchedIncidentId] = useState<string>('');

  useEffect(() => {
    if (isTriggerModalOpen) {
      const loc = LocationService.resolveLocation();
      setLat(loc.lat);
      setLng(loc.lng);
      setLocationDesc(
        currentUser?.landingCentre
          ? `15 NM Offshore ${currentUser.landingCentre}`
          : `${loc.name} Offshore Zone`
      );
    }
  }, [isTriggerModalOpen, currentUser]);

  if (!isTriggerModalOpen) return null;

  const handleAcquireGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setLocationDesc(`Offshore GPS [${pos.coords.latitude.toFixed(3)}°N, ${pos.coords.longitude.toFixed(3)}°E]`);
          setIsGpsLocked(true);
        },
        () => {
          const loc = LocationService.resolveLocation();
          setLat(loc.lat);
          setLng(loc.lng);
          setLocationDesc(`${loc.name} Offshore`);
          setIsGpsLocked(true);
        }
      );
    }
  };

  const handleBroadcastSos = async () => {
    const incident = await triggerNewSos({
      callerName,
      callerPhone,
      vesselRegNumber: vesselNumber,
      emergencyType,
      peopleAffectedCount: peopleCount,
      coordinates: { lat, lng },
      locationDescription: locationDesc,
    });

    addNotification({
      type: 'sos_alert',
      title: `🚨 EMERGENCY SOS BROADCAST: ${emergencyType}`,
      message: `${callerName} reported emergency at [${lat.toFixed(3)}N, ${lng.toFixed(3)}E]. 2 field agents & Coast Guard notified.`,
      severity: 'critical',
      recipientRole: 'all',
      relatedRecordType: 'sos',
      relatedRecordId: incident.id,
    });

    setDispatchedIncidentId(incident.id);
    setStep('success');
  };

  const handleClose = () => {
    setStep('confirm');
    closeTriggerModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-white border-2 border-[#E5484D] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with pulsing alert */}
        <div className="bg-gradient-to-r from-[#FFF0F1] to-white px-6 py-4 border-b border-[#FFD5D8] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#E5484D] rounded-xl animate-pulse shadow-md text-white">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#123B6D] tracking-wide">{t('sos.alertTitle', 'MARITIME EMERGENCY SOS')}</h3>
              <p className="text-xs text-[#E5484D] font-mono font-bold">Agentic Search & Rescue Coordination</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-[#55718D] hover:text-[#123B6D] rounded-lg bg-[#F4FAFD] hover:bg-[#E8F8FB] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Confirmation Warning */}
        {step === 'confirm' && (
          <div className="p-6 space-y-5">
            <div className="p-4 bg-[#FFF0F1] border border-[#FFD5D8] rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#E5484D] font-bold text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>{t('sos.alertTitle', 'CONFIRM EMERGENCY TRANSMISSION')}</span>
              </div>
              <p className="text-xs text-[#55718D] leading-relaxed">
                {t('sos.confirmPrompt', 'Triggering an SOS immediately dispatches priority telemetry to the State Disaster Management Authority (SDMA), Indian Coast Guard MRCC, and local marine field officers.')}
              </p>
            </div>

            {/* Coast Guard Direct Line Box */}
            <div className="flex items-center justify-between p-3.5 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl">
              <div className="flex items-center gap-3">
                <PhoneCall className="w-5 h-5 text-[#E7A928]" />
                <div>
                  <p className="text-xs text-[#55718D]">{t('safety.hotline', 'Direct Coast Guard SAR Hotline')}</p>
                  <p className="text-base font-bold font-mono text-[#E7A928]">1554 (Toll-Free 24x7)</p>
                </div>
              </div>
              <a
                href="tel:1554"
                className="px-3 py-1.5 bg-[#E7A928] hover:bg-[#D69418] text-white font-bold text-xs rounded-lg transition shadow-sm"
              >
                CALL 1554
              </a>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 bg-white hover:bg-[#E8F8FB] border border-[#BFD6E4] text-[#123B6D] font-semibold text-sm rounded-xl transition"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={() => setStep('details')}
                className="flex-1 py-3 bg-[#E5484D] hover:bg-[#C5353A] text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <AlertOctagon className="w-4 h-4" />
                {t('sos.triggerButton', 'Proceed with SOS')}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Emergency Details */}
        {step === 'details' && (
          <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Emergency Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#123B6D] mb-1.5">
                Nature of Maritime Distress *
              </label>
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value as SosEmergencyType)}
                className="w-full px-3 py-2.5 bg-white border border-[#C9DDE8] rounded-xl text-[#123B6D] text-sm focus:border-[#E5484D] focus:outline-none"
              >
                {EMERGENCY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* GPS Telemetry */}
            <div className="p-3.5 bg-[#E8F8FB] border border-[#CFE6EF] rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#1769AA] font-mono font-bold flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#1769AA]" />
                  GPS FIX: {lat.toFixed(4)}°N, {lng.toFixed(4)}°E
                </span>
                <button
                  type="button"
                  onClick={handleAcquireGps}
                  className="text-xs text-[#1769AA] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Navigation className="w-3 h-3" /> Refresh GPS
                </button>
              </div>
              <input
                type="text"
                value={locationDesc}
                onChange={(e) => setLocationDesc(e.target.value)}
                placeholder="Visual landmark or nautical distance from shore..."
                className="w-full px-3 py-2 bg-white border border-[#C9DDE8] rounded-lg text-xs text-[#123B6D] focus:outline-none focus:border-[#19B7C9]"
              />
            </div>

            {/* Crew Count & Vessel */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#123B6D] mb-1">
                  Souls Affected (Count) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={peopleCount}
                    onChange={(e) => setPeopleCount(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white border border-[#C9DDE8] rounded-xl text-[#123B6D] text-sm pl-8 focus:border-[#E5484D] focus:outline-none"
                  />
                  <Users className="w-4 h-4 text-[#7890A5] absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123B6D] mb-1">
                  Vessel Registration
                </label>
                <input
                  type="text"
                  value={vesselNumber}
                  onChange={(e) => setVesselNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#C9DDE8] rounded-xl text-[#123B6D] text-sm focus:border-[#E5484D] focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Contact Person */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#123B6D] mb-1">
                  Skipper / Caller Name *
                </label>
                <input
                  type="text"
                  value={callerName}
                  onChange={(e) => setCallerName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#C9DDE8] rounded-xl text-[#123B6D] text-sm focus:border-[#E5484D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123B6D] mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  value={callerPhone}
                  onChange={(e) => setCallerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#C9DDE8] rounded-xl text-[#123B6D] text-sm focus:border-[#E5484D] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('confirm')}
                className="w-1/3 py-2.5 bg-white hover:bg-[#E8F8FB] border border-[#BFD6E4] text-[#123B6D] font-semibold text-sm rounded-xl transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleBroadcastSos}
                className="w-2/3 py-2.5 bg-[#E5484D] hover:bg-[#C5353A] text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                TRANSMIT DISTRESS BEACON
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Success / Active Incident Feedback */}
        {step === 'success' && (
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-[#FFF0F1] border-2 border-[#E5484D] rounded-full flex items-center justify-center mx-auto text-[#E5484D] animate-pulse shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-[#123B6D]">EMERGENCY BEACON ACTIVE</h4>
              <p className="text-xs text-[#E5484D] font-mono font-bold">Incident Code: {dispatchedIncidentId}</p>
            </div>

            <div className="p-4 bg-[#F4FAFD] border border-[#D7E7F0] rounded-xl text-left space-y-2 text-xs">
              <div className="flex justify-between text-[#55718D]">
                <span>Distress Type:</span>
                <span className="text-[#123B6D] font-semibold">{emergencyType}</span>
              </div>
              <div className="flex justify-between text-[#55718D]">
                <span>Assigned Agents:</span>
                <span className="text-[#168DCC] font-semibold">Kavita S. & Ramesh K.</span>
              </div>
              <div className="flex justify-between text-[#55718D]">
                <span>Coast Guard Case:</span>
                <span className="text-[#E7A928] font-mono font-bold">ICG-MRCC-CHN-ACTIVE</span>
              </div>
              <div className="flex justify-between text-[#55718D]">
                <span>VHF Monitor:</span>
                <span className="text-[#123B6D] font-mono font-bold">Channel 16 (156.800 MHz)</span>
              </div>
            </div>

            <p className="text-xs text-[#55718D] italic">
              Keep your VHF radio tuned to Ch 16 and remain with the vessel if stable. Responders have locked onto your coordinates.
            </p>

            <button
              type="button"
              onClick={handleClose}
              className="w-full py-3 bg-[#1769AA] hover:bg-[#123B6D] text-white font-semibold text-sm rounded-xl transition shadow-sm"
            >
              Close & Monitor Incident Command
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
