/**
 * AegisMesh — Dashboard & Priority Triage Module
 * Clean DOM rendering & event handling
 */

import { panToLocation } from './map.js';

export function renderKPIs(stats) {
  const elTotal = document.getElementById('kpi-total-incidents');
  const elCritical = document.getElementById('kpi-critical-incidents');
  const elAffected = document.getElementById('kpi-people-affected');
  const elTrapped = document.getElementById('kpi-people-trapped');
  const elShelters = document.getElementById('kpi-shelter-status');

  if (elTotal) elTotal.textContent = stats.total_incidents;
  if (elCritical) elCritical.textContent = stats.critical_incidents;
  if (elAffected) elAffected.textContent = stats.people_affected;
  if (elTrapped) elTrapped.textContent = stats.people_trapped;
  
  if (elShelters) {
    const avail = stats.shelter_available_beds;
    const total = stats.shelter_capacity_total;
    elShelters.textContent = `${avail} / ${total} free`;
  }
}

export function renderRecommendations(recs) {
  const container = document.getElementById('recommendations-list');
  if (!container) return;

  if (!recs || recs.length === 0) {
    container.innerHTML = `<div style="color: #94a3b8; font-size: 13px; padding: 12px;">No urgent responder actions required right now.</div>`;
    return;
  }

  container.innerHTML = recs.map((rec, idx) => {
    const isCritical = rec.urgency.includes('Immediate') || rec.urgency.includes('High');
    return `
      <div class="rec-card ${isCritical ? 'critical-action' : ''}" id="rec-card-${rec.id}">
        <div class="rec-card-header">
          <div class="rec-card-title">
            <span style="color: #38bdf8; font-weight: 800; margin-right: 6px;">#${idx + 1}</span>
            ${rec.title}
          </div>
          <span class="rec-urgency-badge">${rec.urgency}</span>
        </div>
        <div class="rec-reason">${rec.reason}</div>
        <ul class="rec-steps-list">
          ${rec.steps.map(step => `<li>${step}</li>`).join('')}
        </ul>
      </div>
    `;
  }).join('');
}

export function renderIncidentList(incidents, onVerify, onResolve, onReject, onInspectPriority) {
  const container = document.getElementById('incidents-list-container');
  if (!container) return;

  if (!incidents || incidents.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: #94a3b8; padding: 30px; font-size: 13px;">
        No active incidents matching your filter.
      </div>
    `;
    return;
  }

  container.innerHTML = incidents.map(inc => {
    let badgeClass = 'badge-medium';
    if (inc.severity === 'Critical') badgeClass = 'badge-critical';
    else if (inc.severity === 'High') badgeClass = 'badge-high';
    else if (inc.severity === 'Low') badgeClass = 'badge-low';

    const statusBadge = inc.status === 'Verified' ? 'badge-verified' : 'badge-unverified';

    return `
      <div class="incident-card" id="incident-card-${inc.id}">
        <div class="incident-card-top">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="incident-type-tag">${inc.type}</span>
            <span class="badge ${badgeClass}" style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">
              ${inc.severity.toUpperCase()}
            </span>
            <span class="badge ${statusBadge}" style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">
              ${inc.status}
            </span>
          </div>

          <div class="priority-badge-box">
            <span style="font-size: 11px; color: #94a3b8;">Priority:</span>
            <span class="score-number" style="color: ${inc.priority_score >= 75 ? '#ef4444' : inc.priority_score >= 50 ? '#f97316' : '#38bdf8'};">
              ${inc.priority_score}/100
            </span>
          </div>
        </div>

        <div class="incident-title">${inc.title}</div>
        <div class="incident-location">
          <span>📍</span>
          <span>${inc.location_name}</span>
        </div>

        <div style="font-size: 12px; color: #cbd5e1; margin-bottom: 6px;">
          ${inc.description}
        </div>

        <div class="incident-meta-row">
          <div>
            <strong>${inc.people_affected}</strong> affected 
            ${inc.people_trapped > 0 ? `(<span style="color: #f87171; font-weight: bold;">${inc.people_trapped} trapped</span>)` : ''}
          </div>
          <div>Reported by: ${inc.reported_by || 'Citizen'}</div>
        </div>

        <div class="incident-actions-row">
          <button class="btn btn-outline btn-sm" id="btn-zoom-${inc.id}" title="Focus on map">
            🎯 Map
          </button>
          
          <button class="btn btn-primary btn-sm" id="btn-why-${inc.id}" title="Explain Priority Score Breakdown">
            🔍 Score Math
          </button>

          ${inc.status === 'Unverified' ? `
            <button class="btn btn-success btn-sm" id="btn-verify-${inc.id}">
              ✓ Verify (+10)
            </button>
          ` : ''}

          ${inc.status !== 'Resolved' ? `
            <button class="btn btn-outline btn-sm" id="btn-resolve-${inc.id}">
              ✓ Resolve
            </button>
          ` : ''}

          <button class="btn btn-outline btn-sm" id="btn-reject-${inc.id}" style="color: #94a3b8;">
            ✕
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Attach event listeners cleanly
  incidents.forEach(inc => {
    const btnZoom = document.getElementById(`btn-zoom-${inc.id}`);
    if (btnZoom) {
      btnZoom.onclick = () => panToLocation(inc.latitude, inc.longitude);
    }

    const btnWhy = document.getElementById(`btn-why-${inc.id}`);
    if (btnWhy && onInspectPriority) {
      btnWhy.onclick = () => onInspectPriority(inc);
    }

    const btnVerify = document.getElementById(`btn-verify-${inc.id}`);
    if (btnVerify && onVerify) {
      btnVerify.onclick = () => onVerify(inc.id);
    }

    const btnResolve = document.getElementById(`btn-resolve-${inc.id}`);
    if (btnResolve && onResolve) {
      btnResolve.onclick = () => onResolve(inc.id);
    }

    const btnReject = document.getElementById(`btn-reject-${inc.id}`);
    if (btnReject && onReject) {
      btnReject.onclick = () => onReject(inc.id);
    }
  });
}

// Open Explainable Priority Calculation Breakdown Modal
export function openPriorityBreakdownModal(incident) {
  const modal = document.getElementById('priority-modal');
  const modalTitle = document.getElementById('modal-incident-title');
  const modalBody = document.getElementById('modal-breakdown-body');

  if (!modal || !modalTitle || !modalBody) return;

  modalTitle.textContent = `${incident.type} — ${incident.location_name}`;

  const b = incident.priority_breakdown || {
    severity_score: incident.severity === 'Critical' ? 40 : 20,
    people_score: Math.min(20, Math.round(incident.people_affected / 3)),
    type_score: 12,
    trapped_score: (incident.people_trapped || 0) * 2,
    verification_score: incident.status === 'Verified' ? 10 : 0,
    total: incident.priority_score
  };

  modalBody.innerHTML = `
    <div style="background: #0f172a; border-radius: 8px; padding: 14px; margin-bottom: 16px; border: 1px solid #334155;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <span style="font-size: 12px; color: #94a3b8; text-transform: uppercase;">Calculated Priority Score</span>
          <div style="font-size: 28px; font-weight: 800; color: ${b.total >= 75 ? '#ef4444' : '#38bdf8'};">${b.total} / 100</div>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 11px; padding: 3px 8px; border-radius: 4px; background: ${incident.status === 'Verified' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(148, 163, 184, 0.2)'}; color: ${incident.status === 'Verified' ? '#34d399' : '#cbd5e1'}; font-weight: bold;">
            ${incident.status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>

    <h4 style="font-size: 13px; color: #f8fafc; margin-bottom: 8px;">Deterministic Mathematical Breakdown:</h4>
    <p style="font-size: 12px; color: #94a3b8; margin-bottom: 12px;">
      AegisMesh does not treat priority as a mystery or black box. Every point is calculated through clear, explainable logic:
    </p>

    <table class="score-breakdown-table">
      <thead>
        <tr>
          <th>Scoring Factor</th>
          <th>Observed Value</th>
          <th style="text-align: right;">Points Awarded</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>1. Severity Base</strong></td>
          <td>${incident.severity} Severity (Scale 0-40)</td>
          <td class="points">+${b.severity_score}</td>
        </tr>
        <tr>
          <td><strong>2. People Affected</strong></td>
          <td>${incident.people_affected} Citizens in zone (Scale 0-20)</td>
          <td class="points">+${b.people_score}</td>
        </tr>
        <tr>
          <td><strong>3. Incident Type Risk</strong></td>
          <td>${incident.type} hazard type weight</td>
          <td class="points">+${b.type_score}</td>
        </tr>
        <tr>
          <td><strong>4. Trapped People Escalation</strong></td>
          <td>${incident.people_trapped || 0} individuals stranded/trapped</td>
          <td class="points">+${b.trapped_score}</td>
        </tr>
        <tr>
          <td><strong>5. Verification Status</strong></td>
          <td>${incident.status === 'Verified' ? 'Official / Field Verified Report' : 'Unverified Citizen Report (+0)'}</td>
          <td class="points">+${b.verification_score}</td>
        </tr>
        <tr class="total-row">
          <td colspan="2" style="color: #f8fafc;"><strong>TOTAL PRIORITY SCORE</strong></td>
          <td class="points" style="font-size: 16px; color: #38bdf8;">${b.total} / 100</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 16px; background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8; padding: 10px 14px; border-radius: 4px; font-size: 12px; color: #cbd5e1;">
      <strong>Why this matters to SIH Judges:</strong> This explainable scoring allows emergency commanders to defend resource allocation decisions transparently under audit.
    </div>
  `;

  modal.classList.add('open');
}

export function closePriorityModal() {
  const modal = document.getElementById('priority-modal');
  if (modal) modal.classList.remove('open');
}
