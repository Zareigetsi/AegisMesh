/**
 * AegisMesh — Main Application Controller (Vanilla JS)
 * Simple, modular, clean coordinator
 */

import { initMap, renderMapIncidents, renderMapShelters, renderMapHospitals, renderMapRoads } from './map.js';
import { renderKPIs, renderRecommendations, renderIncidentList, openPriorityBreakdownModal, closePriorityModal } from './dashboard.js';
import { initReportForm, fillReportCoordinates } from './report.js';
import { initSimulation } from './simulation.js';

let state = {
  incidents: [],
  shelters: [],
  hospitals: [],
  roads: [],
  recommendations: [],
  stats: {},
  statusFilter: 'All',
  severityFilter: 'All',
  searchQuery: '',
  activeTab: 'tab-dashboard'
};

export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  if (type === 'error') {
    toast.style.borderColor = '#ef4444';
  } else if (type === 'success') {
    toast.style.borderColor = '#10b981';
  }
  toast.innerHTML = `<span>${type === 'error' ? '❌' : type === 'success' ? '✓' : 'ℹ️'}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Fetch all disaster state from API
export async function refreshAllData() {
  try {
    const [incRes, statsRes, sheltersRes, hospRes, roadsRes, recsRes] = await Promise.all([
      fetch(`/api/incidents?status=${state.statusFilter}&severity=${state.severityFilter}&search=${encodeURIComponent(state.searchQuery)}`),
      fetch('/api/stats'),
      fetch('/api/shelters'),
      fetch('/api/hospitals'),
      fetch('/api/roads'),
      fetch('/api/recommendations')
    ]);

    state.incidents = await incRes.json();
    state.stats = await statsRes.json();
    state.shelters = await sheltersRes.json();
    state.hospitals = await hospRes.json();
    state.roads = await roadsRes.json();
    state.recommendations = await recsRes.json();

    // Render UI components
    renderKPIs(state.stats);
    renderRecommendations(state.recommendations);
    renderIncidentList(state.incidents, handleVerify, handleResolve, handleReject, openPriorityBreakdownModal);
    renderMapIncidents(state.incidents, openPriorityBreakdownModal, handleVerify);
    renderMapShelters(state.shelters);
    renderMapHospitals(state.hospitals);
    renderMapRoads(state.roads);
    renderSheltersTab();
  } catch (err) {
    console.error('Data refresh error:', err);
  }
}

// Incident actions
async function handleVerify(id) {
  try {
    const res = await fetch(`/api/incidents/${id}/verify`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(`✓ Incident #${id} Verified. Priority boosted to ${data.incident.priority_score}/100`, 'success');
      refreshAllData();
    }
  } catch (err) {
    showToast('Failed to verify incident.', 'error');
  }
}

async function handleResolve(id) {
  try {
    const res = await fetch(`/api/incidents/${id}/resolve`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(`✓ Incident #${id} marked as Resolved.`, 'success');
      refreshAllData();
    }
  } catch (err) {
    showToast('Failed to resolve incident.', 'error');
  }
}

async function handleReject(id) {
  try {
    const res = await fetch(`/api/incidents/${id}/reject`, { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showToast(`Incident #${id} removed from active triage.`, 'info');
      refreshAllData();
    }
  } catch (err) {
    showToast('Failed to reject incident.', 'error');
  }
}

// Render dedicated Shelters & Infrastructure tab
function renderSheltersTab() {
  const container = document.getElementById('shelters-grid-container');
  if (!container) return;

  container.innerHTML = state.shelters.map(s => {
    const occPct = Math.round((s.occupied / s.capacity) * 100);
    const color = occPct >= 85 ? '#ef4444' : occPct >= 50 ? '#eab308' : '#10b981';

    return `
      <div style="background: #0f172a; border: 1px solid #334155; border-radius: 10px; padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <span style="font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase;">ID: ${s.id}</span>
            <h4 style="font-size: 15px; color: #f8fafc;">${s.name}</h4>
          </div>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: ${occPct >= 85 ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}; color: ${color}; font-weight: bold;">
            ${occPct}% OCCUPIED
          </span>
        </div>

        <div style="margin: 12px 0;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: #cbd5e1;">
            <span>Occupancy</span>
            <strong>${s.occupied} / ${s.capacity} beds</strong>
          </div>
          <div style="width: 100%; height: 8px; background: #334155; border-radius: 4px; overflow: hidden;">
            <div style="width: ${occPct}%; height: 100%; background: ${color};"></div>
          </div>
        </div>

        <div style="font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>Supplies: <strong style="color: #f8fafc;">${s.supplies_status}</strong></span>
          <span>Helpline: ${s.contact}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Initialize Navigation Tabs
function setupNavigation() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-tab');
      if (!targetId) return;

      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add('active');

      state.activeTab = targetId;

      // Invalidate map size when switching back to dashboard
      if (targetId === 'tab-dashboard') {
        setTimeout(() => refreshAllData(), 100);
      }
    });
  });
}

// Initialize Search & Filter Controls
function setupFilters() {
  const statusSelect = document.getElementById('filter-status');
  const severitySelect = document.getElementById('filter-severity');
  const searchInput = document.getElementById('filter-search');

  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      // @ts-ignore
      state.statusFilter = e.target.value;
      refreshAllData();
    });
  }

  if (severitySelect) {
    severitySelect.addEventListener('change', (e) => {
      // @ts-ignore
      state.severityFilter = e.target.value;
      refreshAllData();
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      // @ts-ignore
      state.searchQuery = e.target.value;
      refreshAllData();
    });
  }
}

// Main App Bootstrap
export function startApp() {
  setupNavigation();
  setupFilters();

  // Modal close listeners
  const btnCloseModal = document.getElementById('modal-close-btn');
  const btnDismissModal = document.getElementById('modal-dismiss-btn');
  if (btnCloseModal) btnCloseModal.onclick = closePriorityModal;
  if (btnDismissModal) btnDismissModal.onclick = closePriorityModal;

  // Initialize Map
  initMap((lat, lng) => {
    fillReportCoordinates(lat, lng);
    showToast(`📍 Selected coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`, 'info');
  });

  // Initialize Citizen Reporting Form
  initReportForm((newIncident) => {
    refreshAllData();
    // Switch to Dashboard
    const dashboardTabBtn = document.querySelector('[data-tab="tab-dashboard"]');
    if (dashboardTabBtn) dashboardTabBtn.click();
  }, showToast);

  // Initialize Flood Simulation
  initSimulation((simData) => {
    refreshAllData();
  }, showToast);

  // Initial load
  refreshAllData();

  // Auto-refresh every 12 seconds
  setInterval(refreshAllData, 12000);
}

// Auto-run if DOM loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
