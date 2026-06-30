"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon path issues in Next.js
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

type LocationMapProps = {
  address: string;
};

export default function LocationMap({ address }: LocationMapProps) {
  // Default coordinate (Jakarta)
  const position: [number, number] = [-6.200000, 106.816666];

  // We are using a client-side component, but MapContainer still needs to mount cleanly
  useEffect(() => {
    // Any DOM manipulation if strictly needed
  }, []);

  return (
    <div className="h-full w-full relative group">
      {/* 
        To achieve the elegant, modern, clean minimalist look, we apply CSS filters.
        This desaturates the map and gives it a subtle dark blue/navy hue 
        matching the corporate theme, without needing a custom Mapbox style.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container {
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          z-index: 1;
        }
        .custom-map-tiles {
          filter: grayscale(80%) sepia(20%) hue-rotate(180deg) opacity(90%) contrast(1.1);
          transition: filter 0.5s ease;
        }
        .group:hover .custom-map-tiles {
          filter: grayscale(40%) sepia(10%) hue-rotate(180deg) opacity(100%) contrast(1.05);
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .leaflet-popup-content {
          margin: 16px 20px;
          font-size: 14px;
          color: #0A2463;
          font-weight: 500;
        }
      `}} />

      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="custom-map-tiles"
        />
        <Marker position={position} icon={customIcon}>
          <Popup>
            <div className="font-semibold text-center uppercase tracking-wide text-[11px] text-[#007C91] mb-1">Kantor Pusat</div>
            <div>{address || "Galangan Kapal HQ"}</div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
