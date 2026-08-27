/**
 * AegisMesh — Citizen Reporting Module
 * Simple, validated disaster incident reporting form with live priority preview
 */

import { setReportLocationMarker } from './map.js';

export function initReportForm(onSubmitSuccess, showToast) {
  const form = document.getElementById('citizen-report-form');
  const typeSelect = document.getElementById('report-type');
  const severitySelect = document.getElementById('report-severity');
  const affectedInput = document.getElementById('report-affected');
  const trappedInput = document.getElementById('report-trapped');
  const latInput = document.getElementById('report-lat');
  const lngInput = document.getElementById('report-lng');
  const scorePreview = document.getElementById('report-score-preview');

  function updateLiveScorePreview() {
    if (!scorePreview) return;
    const type = typeSelect ? typeSelect.value : 'Flood';
    const severity = severitySelect ? severitySelect.value : 'Medium';
    const affected = affectedInput ? Number(affectedInput.value) || 1 : 1;
    const trapped = trappedInput ? Number(trappedInput.value) || 0 : 0;

    let sevScore = severity === 'Critical' ? 40 : severity === 'High' ? 28 : severity === 'Medium' ? 18 : 8;
    let peopleScore = Math.min(20, Math.round((Math.max(1, affected) / 60) * 20));
    let typeScore = 10;
    if (type === 'People Trapped') typeScore = 20;
    else if (type === 'Medical Emergency') typeScore = 25;
    else if (type === 'Flood') typeScore = 12;
    else if (type === 'Fire') typeScore = 15;
    
    let trappedScore = Math.min(15, Math.round(trapped * 1.5));
    let total = Math.min(100, Math.max(5, sevScore + peopleScore + typeScore + trappedScore));

    scorePreview.textContent = `${total} / 100`;
    scorePreview.style.color = total >= 75 ? '#ef4444' : total >= 50 ? '#f97316' : '#38bdf8';
  }

  if (typeSelect) typeSelect.addEventListener('change', updateLiveScorePreview);
  if (severitySelect) severitySelect.addEventListener('change', updateLiveScorePreview);
  if (affectedInput) affectedInput.addEventListener('input', updateLiveScorePreview);
  if (trappedInput) trappedInput.addEventListener('input', updateLiveScorePreview);

  updateLiveScorePreview();

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const type = typeSelect.value;
      const location_name = document.getElementById('report-location').value.trim();
      const description = document.getElementById('report-desc').value.trim();
      const severity = severitySelect.value;
      const people_affected = Number(affectedInput.value) || 1;
      const people_trapped = Number(trappedInput.value) || 0;
      const reported_by = document.getElementById('report-name').value.trim() || 'Citizen';
      const phone = document.getElementById('report-phone').value.trim() || 'Not provided';
      const lat = parseFloat(latInput.value) || 26.9124;
      const lng = parseFloat(lngInput.value) || 75.7873;

      if (!location_name || !description) {
        showToast('⚠️ Please enter the incident location and details.', 'error');
        return;
      }

      try {
        const res = await fetch('/api/incidents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type,
            title: `${type} at ${location_name}`,
            description,
            location_name,
            latitude: lat,
            longitude: lng,
            severity,
            people_affected,
            people_trapped,
            reported_by,
            phone
          })
        });

        const data = await res.json();
        if (data.success) {
          showToast(`✓ Report #${data.incident.id} submitted! Priority: ${data.incident.priority_score}/100`, 'success');
          form.reset();
          updateLiveScorePreview();
          if (onSubmitSuccess) onSubmitSuccess(data.incident);
        } else {
          showToast(`Error: ${data.error || 'Failed to submit'}`, 'error');
        }
      } catch (err) {
        showToast('Network error while saving report.', 'error');
      }
    });
  }
}

export function fillReportCoordinates(lat, lng) {
  const latInput = document.getElementById('report-lat');
  const lngInput = document.getElementById('report-lng');
  const statusDisplay = document.getElementById('coords-picked-status');

  if (latInput) latInput.value = lat.toFixed(6);
  if (lngInput) lngInput.value = lng.toFixed(6);
  if (statusDisplay) {
    statusDisplay.textContent = `📍 Selected: (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    statusDisplay.style.color = '#38bdf8';
  }
  setReportLocationMarker(lat, lng);
}
