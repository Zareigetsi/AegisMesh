/**
 * AegisMesh — Interactive Disaster Map (Leaflet.js)
 * Clean, understandable mapping module
 */

let mapInstance = null;
let incidentLayerGroup = null;
let shelterLayerGroup = null;
let hospitalLayerGroup = null;
let roadLayerGroup = null;
let selectedReportMarker = null;

// Metro coordinates: 26.9124, 75.7873
const MAP_CENTER = [26.9124, 75.7873];
const DEFAULT_ZOOM = 14;

export function initMap(onLocationPicked) {
  const mapElement = document.getElementById('disaster-map');
  if (!mapElement) return;

  if (mapInstance) {
    mapInstance.invalidateSize();
    return;
  }

  // 1. Initialize Leaflet Map
  // @ts-ignore
  mapInstance = L.map('disaster-map', {
    center: MAP_CENTER,
    zoom: DEFAULT_ZOOM,
    zoomControl: true
  });

  // 2. Add OpenStreetMap / Carto Dark Tiles
  // @ts-ignore
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(mapInstance);

  // 3. Initialize Layer Groups
  // @ts-ignore
  incidentLayerGroup = L.layerGroup().addTo(mapInstance);
  // @ts-ignore
  shelterLayerGroup = L.layerGroup().addTo(mapInstance);
  // @ts-ignore
  hospitalLayerGroup = L.layerGroup().addTo(mapInstance);
  // @ts-ignore
  roadLayerGroup = L.layerGroup().addTo(mapInstance);

  // 4. Click Listener to pick coordinates for citizen reports
  mapInstance.on('click', (e) => {
    const { lat, lng } = e.latlng;
    if (onLocationPicked) {
      onLocationPicked(lat, lng);
    }
  });
}

// Render incident pins with color codes & explainable popups
export function renderMapIncidents(incidents, onInspectPriority, onVerifyIncident) {
  if (!incidentLayerGroup) return;
  incidentLayerGroup.clearLayers();

  incidents.forEach((inc) => {
    if (inc.status === 'Resolved' || inc.status === 'Rejected') return;

    let bgColor = '#eab308'; // Medium
    let emoji = '⚠️';

    if (inc.severity === 'Critical' || inc.priority_score >= 75) {
      bgColor = '#ef4444';
      emoji = inc.type === 'Flood' ? '🌊' : inc.type === 'People Trapped' ? '🆘' : '🚨';
    } else if (inc.severity === 'High') {
      bgColor = '#f97316';
      emoji = inc.type === 'Medical Emergency' ? '🚑' : inc.type === 'Fire' ? '🔥' : '⚠️';
    } else if (inc.severity === 'Low') {
      bgColor = '#3b82f6';
      emoji = 'ℹ️';
    }

    // @ts-ignore
    const customIcon = L.divIcon({
      className: 'custom-disaster-marker',
      html: `
        <div style="background-color: ${bgColor}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); font-size: 14px; cursor: pointer;">
          ${emoji}
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // @ts-ignore
    const marker = L.marker([inc.latitude, inc.longitude], { icon: customIcon });

    const popupHtml = `
      <div style="font-family: inherit; font-size: 12px; min-width: 220px; line-height: 1.4;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="color: #f8fafc; font-size: 13px;">${inc.type}</strong>
          <span style="background: ${inc.severity === 'Critical' ? '#ef4444' : '#f97316'}; color: white; padding: 1px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">
            ${inc.severity}
          </span>
        </div>
        <div style="color: #cbd5e1; font-weight: 600; margin-bottom: 4px;">${inc.location_name}</div>
        <div style="color: #94a3b8; font-size: 11px; margin-bottom: 8px;">${inc.description}</div>
        
        <div style="background: #0f172a; padding: 6px 8px; border-radius: 6px; margin-bottom: 8px; border: 1px solid #334155;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
            <span style="color: #94a3b8;">Priority Score:</span>
            <strong style="color: #38bdf8; font-size: 13px;">${inc.priority_score} / 100</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span style="color: #94a3b8;">People Affected:</span>
            <span style="color: #f8fafc;">${inc.people_affected} (${inc.people_trapped || 0} trapped)</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 11px;">
            <span style="color: #94a3b8;">Status:</span>
            <span style="color: ${inc.status === 'Verified' ? '#34d399' : '#fbbf24'};">${inc.status}</span>
          </div>
        </div>

        <div style="display: flex; gap: 6px;">
          <button id="btn-inspect-${inc.id}" style="flex: 1; background: #0284c7; color: white; border: none; padding: 5px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer;">
            Why High Priority?
          </button>
          ${inc.status === 'Unverified' ? `
            <button id="btn-quick-verify-${inc.id}" style="background: #059669; color: white; border: none; padding: 5px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer;">
              ✓ Verify
            </button>
          ` : ''}
        </div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    marker.on('popupopen', () => {
      const inspectBtn = document.getElementById(`btn-inspect-${inc.id}`);
      if (inspectBtn && onInspectPriority) {
        inspectBtn.onclick = () => onInspectPriority(inc);
      }
      const verifyBtn = document.getElementById(`btn-quick-verify-${inc.id}`);
      if (verifyBtn && onVerifyIncident) {
        verifyBtn.onclick = () => onVerifyIncident(inc.id);
      }
    });

    incidentLayerGroup.addLayer(marker);
  });
}

// Render Shelters with Capacity status
export function renderMapShelters(shelters) {
  if (!shelterLayerGroup) return;
  shelterLayerGroup.clearLayers();

  shelters.forEach((s) => {
    const occPct = Math.round((s.occupied / s.capacity) * 100);
    const badgeColor = occPct >= 85 ? '#ef4444' : occPct >= 50 ? '#eab308' : '#10b981';

    // @ts-ignore
    const customIcon = L.divIcon({
      className: 'custom-shelter-marker',
      html: `
        <div style="background-color: #0284c7; color: white; width: 30px; height: 30px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.5); font-size: 14px; font-weight: bold;">
          🏕️
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // @ts-ignore
    const marker = L.marker([s.latitude, s.longitude], { icon: customIcon });

    const popupHtml = `
      <div style="font-family: inherit; font-size: 12px; min-width: 200px;">
        <strong style="color: #38bdf8; font-size: 13px;">${s.name}</strong>
        <div style="margin: 6px 0; color: #cbd5e1;">
          Capacity: <strong>${s.occupied} / ${s.capacity}</strong> (${occPct}% occupied)
        </div>
        <div style="width: 100%; height: 6px; background: #334155; border-radius: 3px; overflow: hidden; margin-bottom: 6px;">
          <div style="width: ${occPct}%; height: 100%; background: ${badgeColor};"></div>
        </div>
        <div style="font-size: 11px; color: #94a3b8;">Supplies: <strong style="color: #f8fafc;">${s.supplies_status}</strong></div>
        <div style="font-size: 11px; color: #94a3b8;">Helpline: ${s.contact}</div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    shelterLayerGroup.addLayer(marker);
  });
}

// Render Hospitals
export function renderMapHospitals(hospitals) {
  if (!hospitalLayerGroup) return;
  hospitalLayerGroup.clearLayers();

  hospitals.forEach((h) => {
    // @ts-ignore
    const customIcon = L.divIcon({
      className: 'custom-hospital-marker',
      html: `
        <div style="background-color: #dc2626; color: white; width: 30px; height: 30px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.5); font-size: 14px; font-weight: bold;">
          🏥
        </div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // @ts-ignore
    const marker = L.marker([h.latitude, h.longitude], { icon: customIcon });

    const popupHtml = `
      <div style="font-family: inherit; font-size: 12px; min-width: 200px;">
        <strong style="color: #f87171; font-size: 13px;">${h.name}</strong>
        <div style="margin: 6px 0; color: #cbd5e1;">
          Emergency Trauma Beds: <strong>${h.emergency_beds_available} / ${h.emergency_beds_total} available</strong>
        </div>
        <div style="font-size: 11px; color: #94a3b8;">Trauma ICU: <strong style="color: #34d399;">Active</strong></div>
        <div style="font-size: 11px; color: #94a3b8;">Emergency: ${h.contact}</div>
      </div>
    `;

    marker.bindPopup(popupHtml);
    hospitalLayerGroup.addLayer(marker);
  });
}

// Render Road Corridors & Blocks
export function renderMapRoads(roads) {
  if (!roadLayerGroup) return;
  roadLayerGroup.clearLayers();

  roads.forEach((road) => {
    const isBlocked = road.status === 'Blocked';
    const color = isBlocked ? '#ef4444' : '#10b981';
    const dashArray = isBlocked ? '8, 8' : undefined;

    // @ts-ignore
    const polyline = L.polyline(road.coordinates, {
      color: color,
      weight: 6,
      opacity: 0.8,
      dashArray: dashArray
    });

    polyline.bindPopup(`
      <div style="font-family: inherit; font-size: 12px;">
        <strong>${road.name}</strong><br/>
        Status: <span style="color: ${color}; font-weight: bold;">${road.status.toUpperCase()}</span><br/>
        ${road.reason ? `<small style="color: #94a3b8;">${road.reason}</small>` : ''}
      </div>
    `);

    roadLayerGroup.addLayer(polyline);
  });
}

// Set temporary marker when citizen clicks map to report
export function setReportLocationMarker(lat, lng) {
  if (!mapInstance) return;

  if (selectedReportMarker) {
    mapInstance.removeLayer(selectedReportMarker);
  }

  // @ts-ignore
  selectedReportMarker = L.circleMarker([lat, lng], {
    radius: 9,
    fillColor: '#38bdf8',
    color: '#ffffff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.9
  }).addTo(mapInstance);

  selectedReportMarker.bindPopup("Selected Incident Coordinates").openPopup();
}

// Pan to an incident
export function panToLocation(lat, lng) {
  if (mapInstance) {
    mapInstance.flyTo([lat, lng], 16, { duration: 1 });
  }
}
