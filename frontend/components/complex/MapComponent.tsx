"use client";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon path issues in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapComponent({ agents, tasks }: { agents: any[], tasks: any[] }) {
  return (
    <MapContainer center={[18.5204, 73.8567]} zoom={11} style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {/* Render Agents */}
      {agents.map((a, idx) => (
        <Marker key={`agent-${idx}`} position={[a.lat, a.lng]} icon={customIcon}>
          <Popup>
            <b>{a.name}</b><br/>
            {a.is_available ? "Available" : "Busy"}
          </Popup>
        </Marker>
      ))}

      {/* Render Completed Tasks */}
      {tasks.filter(t => t.status === "completed").map((t, idx) => (
        <Marker key={`task-${idx}`} position={[t.completed_lat, t.completed_lng]} icon={customIcon}>
          <Popup>
            <b>Task Completed</b><br/>
            {t.task_desc}<br/>
            <i>{t.completion_notes}</i>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
