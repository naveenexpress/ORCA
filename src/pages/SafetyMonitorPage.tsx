import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Radio, Navigation, Clock, PhoneCall, Anchor } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const SafetyMonitorPage: React.FC = () => {
  const [voyages, setVoyages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVoyages = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/voyages');
      if (!res.ok) throw new Error('Failed to fetch voyages');
      const data = await res.json();
      setVoyages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoyages();
    const interval = setInterval(fetchVoyages, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            Fisherman Safety & Sea Communication
          </h1>
          <p className="text-gray-500 mt-1">
            Monitor active voyages, last known locations, and communication status.
          </p>
        </div>
        <button
          onClick={fetchVoyages}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
        >
          <Radio className="w-4 h-4" />
          Refresh Status
        </button>
      </div>

      {loading && <div className="text-gray-500">Loading voyages...</div>}
      {error && <div className="text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {voyages.length === 0 && !loading ? (
            <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500 shadow-sm">
              No active voyages found.
            </div>
          ) : (
            voyages.map((voyage) => {
              const lastComm = voyage.lastCommunicationTime ? new Date(voyage.lastCommunicationTime) : null;
              const timeSinceComm = lastComm ? Math.floor((Date.now() - lastComm.getTime()) / 60000) : null; // in minutes
              const isOverdue = timeSinceComm !== null && timeSinceComm > 120; // 2 hours

              return (
                <div key={voyage.id} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Anchor className="w-5 h-5 text-gray-500" />
                        {voyage.vessel?.name || 'Unknown Vessel'} 
                        <span className="text-sm font-normal text-gray-500">({voyage.vessel?.registrationNumber})</span>
                      </h3>
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${voyage.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {voyage.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Navigation className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Last Location</p>
                          <p className="text-sm font-medium text-gray-900">
                            {voyage.lastLocationLat && voyage.lastLocationLng 
                              ? `${voyage.lastLocationLat.toFixed(4)}°N, ${voyage.lastLocationLng.toFixed(4)}°E` 
                              : 'Unknown'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-purple-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Expected Return</p>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(voyage.expectedReturnTime).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Radio className={`w-5 h-5 mt-0.5 ${isOverdue ? 'text-red-500 animate-pulse' : 'text-green-500'}`} />
                        <div>
                          <p className="text-sm text-gray-500">Last Communication</p>
                          <p className={`text-sm font-medium ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-900'}`}>
                            {lastComm ? lastComm.toLocaleString() : 'No comms yet'}
                            {isOverdue && ' (OVERDUE)'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <PhoneCall className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Owner / Contact</p>
                          <p className="text-sm font-medium text-gray-900">
                            {voyage.vessel?.ownerName} • {voyage.vessel?.contactPhone}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Safety Alerts
            </h3>
            <div className="space-y-4">
              {voyages.flatMap(v => v.safetyAlerts || []).length === 0 ? (
                <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg text-center border border-gray-100">No active safety alerts.</p>
              ) : (
                voyages.flatMap(v => v.safetyAlerts || []).map((alert: any) => (
                  <div key={alert.id} className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">{alert.type}</p>
                      <p className="text-xs text-red-600 mt-1">Severity: {alert.severity}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
