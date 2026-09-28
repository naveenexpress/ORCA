import React, { useEffect, useRef, useState } from 'react';
import { Polyline, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, X, Compass, Timer, Anchor, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import { useMapStore } from '../../store/mapStore';

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dLng/2)**2;
  return R*2*Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export function bearingDeg(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = ((lng2-lng1)*Math.PI)/180;
  const y = Math.sin(dLng)*Math.cos((lat2*Math.PI)/180);
  const x = Math.cos((lat1*Math.PI)/180)*Math.sin((lat2*Math.PI)/180)-Math.sin((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.cos(dLng);
  return ((Math.atan2(y,x)*180)/Math.PI+360)%360;
}

export function bearingLabel(deg: number): string {
  const dirs=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg/22.5)%16];
}

function etaString(distKm: number, speedKnots=9): string {
  const hrs=distKm/(speedKnots*1.852); const h=Math.floor(hrs); const m=Math.round((hrs-h)*60);
  return h===0 ? `${m} min` : `${h}h ${m}m`;
}

const userIcon = L.divIcon({ html: '<div style="width:18px;height:18px;border-radius:50%;background:#19B7C9;border:3px solid white;box-shadow:0 0 0 4px rgba(25,183,201,0.35),0 0 18px rgba(25,183,201,0.6);"></div>', className:'', iconSize:[18,18], iconAnchor:[9,9] });

const NavMapController: React.FC<{userPos:{lat:number;lng:number}}> = ({userPos}) => {
  const map = useMap(); const firstFly = useRef(true);
  useEffect(() => { if(firstFly.current){map.flyTo([userPos.lat,userPos.lng],11,{duration:1.5});firstFly.current=false;} },[userPos,map]);
  return null;
};

export const LiveNavigationMapLayer: React.FC = () => {
  const {navigationTarget,isNavigating,userGpsPosition,setUserGpsPosition}=useMapStore();
  const watchId=useRef<number|null>(null);
  useEffect(() => {
    if(!isNavigating||!navigationTarget){return;}
    if(!navigator.geolocation)return;
    watchId.current=navigator.geolocation.watchPosition(
      (pos)=>setUserGpsPosition({lat:pos.coords.latitude,lng:pos.coords.longitude}),
      ()=>{},{enableHighAccuracy:true,maximumAge:3000,timeout:10000}
    );
    return()=>{if(watchId.current!==null){navigator.geolocation.clearWatch(watchId.current);watchId.current=null;}};
  },[isNavigating,navigationTarget,setUserGpsPosition]);
  if(!isNavigating||!navigationTarget)return null;
  const routePoints:[number,number][]=userGpsPosition?[[userGpsPosition.lat,userGpsPosition.lng],[navigationTarget.lat,navigationTarget.lng]]:[];
  return (<>
    {userGpsPosition&&(<><NavMapController userPos={userGpsPosition}/><Marker position={[userGpsPosition.lat,userGpsPosition.lng]} icon={userIcon}/><Circle center={[userGpsPosition.lat,userGpsPosition.lng]} radius={80} pathOptions={{color:'#19B7C9',fillColor:'#19B7C9',fillOpacity:0.15,weight:1}}/></>)}
    {routePoints.length===2&&(<Polyline positions={routePoints} pathOptions={{color:'#19B7C9',weight:3,opacity:0.9,dashArray:'10,8'}}/>)}
    <Circle center={[navigationTarget.lat,navigationTarget.lng]} radius={800} pathOptions={{color:'#10b981',fillColor:'#10b981',fillOpacity:0.12,weight:2,dashArray:'6,4'}}/>
  </>);
};

export const LiveNavHUDPanel: React.FC = () => {
  const {navigationTarget,isNavigating,stopNavigation,userGpsPosition}=useMapStore();
  const [arrived,setArrived]=useState(false);
  useEffect(()=>{if(!isNavigating){setArrived(false);return;}if(isNavigating&&navigationTarget&&userGpsPosition){const d=haversineKm(userGpsPosition.lat,userGpsPosition.lng,navigationTarget.lat,navigationTarget.lng);if(d<0.5)setArrived(true);}},[userGpsPosition,navigationTarget,isNavigating]);
  if(!isNavigating||!navigationTarget)return null;
  const liveDistKm=userGpsPosition?haversineKm(userGpsPosition.lat,userGpsPosition.lng,navigationTarget.lat,navigationTarget.lng):navigationTarget.distanceKm;
  const liveBearing=userGpsPosition?bearingDeg(userGpsPosition.lat,userGpsPosition.lng,navigationTarget.lat,navigationTarget.lng):navigationTarget.bearingDegrees;
  const liveDirection=bearingLabel(liveBearing); const eta=etaString(liveDistKm); const hasGps=!!userGpsPosition;
  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[1100] w-[340px] max-w-[92vw] select-none pointer-events-auto">
      {arrived&&(<div className="mb-2 px-4 py-3 rounded-2xl bg-emerald-500 text-white text-center font-extrabold text-sm shadow-2xl animate-bounce">🎣 You have arrived at the fishing zone!</div>)}
      <div className="rounded-2xl bg-[#060f1c]/95 border border-[#19B7C9]/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="px-4 py-2.5 bg-gradient-to-r from-[#19B7C9]/20 to-[#1769AA]/20 flex items-center justify-between border-b border-[#19B7C9]/20">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#19B7C9] animate-pulse"/>
            <span className="text-[11px] font-bold text-[#19B7C9] tracking-widest uppercase">Live Navigation</span>
            {hasGps?<Wifi className="w-3 h-3 text-emerald-400"/>:<WifiOff className="w-3 h-3 text-amber-400 animate-pulse"/>}
          </div>
          <button onClick={stopNavigation} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"><X className="w-3.5 h-3.5"/></button>
        </div>
        <div className="px-4 pt-3 pb-1">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest">Destination</p>
          <p className="text-sm font-bold text-white leading-tight">{navigationTarget.name}</p>
          <p className="text-[10px] text-emerald-400 font-mono">{navigationTarget.confidence} Confidence · {navigationTarget.species.slice(0,2).join(', ')}</p>
        </div>
        <div className="px-4 py-3 flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0">
            <div className="absolute inset-0 rounded-full border-2 border-[#19B7C9]/30 bg-[#060f1c]"/>
            {[0,45,90,135,180,225,270,315].map(tick=>(<div key={tick} className="absolute inset-0 flex items-start justify-center" style={{transform:`rotate(${tick}deg)`}}><div className={`mt-1 w-px h-1 ${tick%90===0?'bg-slate-400 h-2':'bg-slate-700'}`}/></div>))}
            {['N','E','S','W'].map((label,i)=>(<div key={label} className="absolute inset-0 flex items-start justify-center" style={{transform:`rotate(${i*90}deg)`}}><span className="mt-3 text-[8px] font-bold text-slate-500" style={{transform:`rotate(-${i*90}deg)`}}>{label}</span></div>))}
            <div className="absolute inset-0 flex items-center justify-center" style={{transform:`rotate(${liveBearing}deg)`}}>
              <div className="relative h-7 w-px">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[11px] border-l-transparent border-r-transparent border-b-[#19B7C9]"/>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[7px] border-l-transparent border-r-transparent border-t-slate-600"/>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-[#19B7C9] shadow-[0_0_8px_#19B7C9]"/></div>
          </div>
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center gap-2"><Compass className="w-3.5 h-3.5 text-[#19B7C9] shrink-0"/><div><p className="text-[9px] text-slate-500 uppercase">Bearing</p><p className="text-lg font-extrabold text-white leading-none">{Math.round(liveBearing)}° <span className="text-[#19B7C9] text-sm">{liveDirection}</span></p></div></div>
            <div className="flex items-center gap-2"><Anchor className="w-3.5 h-3.5 text-emerald-400 shrink-0"/><div><p className="text-[9px] text-slate-500 uppercase">Distance</p><p className="text-base font-extrabold text-white leading-none">{liveDistKm.toFixed(2)} <span className="text-emerald-400 text-xs">km</span><span className="ml-1 text-slate-500 text-[10px]">/ {(liveDistKm/1.852).toFixed(1)} NM</span></p></div></div>
            <div className="flex items-center gap-2"><Timer className="w-3.5 h-3.5 text-amber-400 shrink-0"/><div><p className="text-[9px] text-slate-500 uppercase">ETA @ 9 knots</p><p className="text-base font-bold text-amber-400 leading-none">{eta}</p></div></div>
          </div>
        </div>
        <div className="px-4 pb-3">
          {!hasGps?(<div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[10px]"><AlertTriangle className="w-3.5 h-3.5 shrink-0"/><span>Acquiring GPS… Allow location access in browser</span></div>):(<div className="flex items-center justify-between px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] text-emerald-400 font-mono"><span>📍 {userGpsPosition!.lat.toFixed(5)}°N, {userGpsPosition!.lng.toFixed(5)}°E</span><span className="text-emerald-600">GPS ✓</span></div>)}
        </div>
        <div className="px-4 pb-3 text-[10px] text-slate-600 font-mono">🏁 PFZ: {navigationTarget.lat.toFixed(4)}°N, {navigationTarget.lng.toFixed(4)}°E</div>
      </div>
    </div>
  );
};
