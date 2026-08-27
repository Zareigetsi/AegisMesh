/**
 * AegisMesh — Disaster Flood Simulation Controller
 * 5-Step interactive demonstration designed for the SIH Jury presentation
 */

let currentStep = 0;
let autoPlayInterval = null;

const SIM_STEPS = [
  {
    step: 0,
    title: 'Baseline City State',
    desc: 'Normal weather condition. Baseline monitoring active across all sectors.'
  },
  {
    step: 1,
    title: 'Event 1: Meteorological Red Alert',
    desc: 'Heavy precipitation recorded (>85mm/hr). Catchment river basin level rising rapidly.'
  },
  {
    step: 2,
    title: 'Event 2: Critical Road Blockade (R17)',
    desc: 'Sector 7 Highway (R17) inundated under 4ft water. Primary route to Shelter A rendered inaccessible.'
  },
  {
    step: 3,
    title: 'Event 3: Citizen Incident Surge (Sector 7)',
    desc: 'Citizens report ground floor flooding in Sector 7 Subhash Nagar. 43 residents stranded.'
  },
  {
    step: 4,
    title: 'Event 4: Rooftop Stranded Victims & Shelter A Saturation',
    desc: '20 citizens trapped on rooftops. Nearby Community Shelter A reaches 92% maximum capacity.'
  },
  {
    step: 5,
    title: 'Event 5: AegisMesh Dynamic Priority & Action Recalculation',
    desc: 'Engine elevates Priority Score to 98/100. Dispatches rescue boats & reroutes evacuees to Shelter B (40% capacity) via open corridor R22.'
  }
];

export function initSimulation(onStepChange, showToast) {
  const btnNext = document.getElementById('sim-btn-next');
  const btnReset = document.getElementById('sim-btn-reset');
  const btnAuto = document.getElementById('sim-btn-autoplay');

  async function triggerStep(stepNumber) {
    try {
      const res = await fetch(`/api/simulation/step/${stepNumber}`, { method: 'POST' });
      const data = await res.json();
      currentStep = stepNumber;
      updateSimulationUI(currentStep, data);
      showToast(`⚡ Simulation: Step ${stepNumber} executed`, 'info');
      if (onStepChange) onStepChange(data);
    } catch (err) {
      showToast('Simulation step execution failed.', 'error');
    }
  }

  async function resetSimulation() {
    try {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        if (btnAuto) btnAuto.textContent = '▶ Auto-Play 5 Steps';
      }
      await fetch('/api/simulation/reset', { method: 'POST' });
      currentStep = 0;
      updateSimulationUI(0, null);
      showToast('✓ Simulation reset to baseline state.', 'info');
      if (onStepChange) onStepChange(null);
    } catch (err) {
      showToast('Reset failed.', 'error');
    }
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (currentStep < 5) {
        triggerStep(currentStep + 1);
      } else {
        showToast('Simulation completed. Reset to run again.', 'info');
      }
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', resetSimulation);
  }

  if (btnAuto) {
    btnAuto.addEventListener('click', () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        btnAuto.textContent = '▶ Auto-Play 5 Steps';
        return;
      }

      btnAuto.textContent = '⏸ Pause Auto-Play';
      currentStep = 0;
      triggerStep(1);

      autoPlayInterval = setInterval(() => {
        if (currentStep < 5) {
          triggerStep(currentStep + 1);
        } else {
          clearInterval(autoPlayInterval);
          autoPlayInterval = null;
          btnAuto.textContent = '▶ Auto-Play 5 Steps';
          showToast('✓ 5-Step Demo presentation finished!', 'success');
        }
      }, 4000);
    });
  }

  updateSimulationUI(0, null);
}

function updateSimulationUI(step, data) {
  const titleEl = document.getElementById('sim-current-title');
  const descEl = document.getElementById('sim-current-desc');
  const logContainer = document.getElementById('sim-log-list');

  const stepMeta = SIM_STEPS.find(s => s.step === step) || SIM_STEPS[0];
  if (titleEl) titleEl.textContent = `[Step ${step}/5] ${stepMeta.title}`;
  if (descEl) descEl.textContent = stepMeta.desc;

  // Highlight step boxes
  for (let i = 1; i <= 5; i++) {
    const box = document.getElementById(`sim-step-indicator-${i}`);
    if (box) {
      box.classList.remove('active', 'done');
      if (i === step) box.classList.add('active');
      else if (i < step) box.classList.add('done');
    }
  }

  if (logContainer && data && data.logs) {
    logContainer.innerHTML = data.logs.map(log => `
      <div style="font-size: 11px; padding: 6px 10px; background: #0f172a; border-left: 3px solid #38bdf8; margin-bottom: 4px; border-radius: 2px;">
        ${log}
      </div>
    `).join('');
  }
}
