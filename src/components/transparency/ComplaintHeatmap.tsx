"use client";

import { useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons in Next.js
import L from "leaflet";
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Complaint {
    id: string;
    title: string;
    category: string;
    slaStatus: string;
    privacyLevel: string;
}

interface HeatmapProps {
    complaints: Complaint[];
}

// Bhopal approx center
const CENTER: [number, number] = [23.2599, 77.4126];

// Pre-seed deterministic offsets so they don't change on every render
function seededRandom(seed: number): number {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
}

export default function ComplaintHeatmap({ complaints }: HeatmapProps) {
    const plottedComplaints = useMemo(() => {
        return complaints
            .filter(c => c.privacyLevel === "public")
            .map((c, i) => {
                // Deterministic offset using index as seed so it doesn't change on re-render
                const latOffset = (seededRandom(i * 7) - 0.5) * 0.1;
                const lngOffset = (seededRandom(i * 13) - 0.5) * 0.1;
                return {
                    ...c,
                    position: [CENTER[0] + latOffset, CENTER[1] + lngOffset] as [number, number],
                };
            });
    }, [complaints]);

    return (
        <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden glass relative z-0 border border-white/5">
            <MapContainer
                center={CENTER}
                zoom={12}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
            >
                {/* Dark mode map tiles */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {plottedComplaints.map(c => {
                    const color = c.slaStatus === "breached" ? "#ef4444" : c.slaStatus === "at_risk" ? "#f59e0b" : "#49de80";
                    return (
                        <CircleMarker
                            key={c.id}
                            center={c.position}
                            radius={8}
                            pathOptions={{ fillColor: color, fillOpacity: 0.6, color: "transparent" }}
                        >
                            <Popup className="bg-background text-foreground border-white/10">
                                <div className="p-1">
                                    <p className="font-bold text-sm mb-1 line-clamp-1">{c.title}</p>
                                    <p className="text-xs text-muted-foreground">{c.category}</p>
                                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-sm text-[10px] font-bold text-white`} style={{ backgroundColor: color }}>
                                        {c.slaStatus.replace("_", " ").toUpperCase()}
                                    </span>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
