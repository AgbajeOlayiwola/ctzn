'use client';

import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { categoryById } from '@/lib/routing';

function Recenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, zoom || map.getZoom());
  }, [center && center[0], center && center[1], zoom]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

function ClickToPick({ onPick }) {
  useMapEvents({ click: (e) => onPick && onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

// Open reports are orange and grow with confirmations, so dense areas read as "hot".
function styleFor(r) {
  if (r.status === 'fixed') return { color: '#0B6B3A', fillColor: '#0B6B3A', radius: 8 };
  const radius = Math.min(22, 8 + Math.round((r.seen || 0) / 2));
  return { color: '#8A3409', fillColor: '#DD6F2A', radius };
}

export default function MapView({ center, zoom = 14, reports = [], picked, onPick, user, small }) {
  return (
    <div className={small ? 'map small' : 'map'}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter center={center} zoom={zoom} />
        {onPick ? <ClickToPick onPick={onPick} /> : null}
        {reports.map((r) => {
          const s = styleFor(r);
          return (
            <CircleMarker key={r.id} center={[r.lat, r.lng]} radius={s.radius} pathOptions={{ color: s.color, fillColor: s.fillColor, fillOpacity: 0.55, weight: 2 }}>
              <Popup>
                <strong>{categoryById(r.cat).label}</strong><br />
                {r.street}{r.area ? `, ${r.area}` : ''}<br />
                {r.status === 'fixed' ? 'Fixed' : `${r.days} days open`}
              </Popup>
            </CircleMarker>
          );
        })}
        {user ? <CircleMarker center={[user.lat, user.lng]} radius={7} pathOptions={{ color: '#FFFFFF', fillColor: '#1D4ED8', fillOpacity: 1, weight: 3 }}><Popup>You are here</Popup></CircleMarker> : null}
        {picked ? <CircleMarker center={[picked.lat, picked.lng]} radius={10} pathOptions={{ color: '#10201A', fillColor: '#0B6B3A', fillOpacity: 0.9, weight: 3 }}><Popup>Your pin</Popup></CircleMarker> : null}
      </MapContainer>
    </div>
  );
}
