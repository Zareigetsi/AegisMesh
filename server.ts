import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// --- DATA STRUCTURES & SEED DATA ---
export interface Incident {
  id: number;
  type: 'Flood' | 'Fire' | 'Earthquake' | 'Road Block' | 'Medical Emergency' | 'People Trapped' | 'Building Damage' | 'Other';
  title: string;
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  people_affected: number;
  people_trapped: number;
  status: 'Unverified' | 'Verified' | 'Resolved' | 'Rejected';
  reported_by: string;
  phone?: string;
  priority_score: number;
  priority_breakdown: {
    severity_score: number;
    people_score: number;
    type_score: number;
    trapped_score: number;
    verification_score: number;
    total: number;
  };
  created_at: string;
}

export interface Shelter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  occupied: number;
  supplies_status: 'Adequate' | 'Limited' | 'Critical';
  contact: string;
}

export interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  emergency_beds_total: number;
  emergency_beds_available: number;
  trauma_unit: boolean;
  contact: string;
}

export interface DisasterRoad {
  id: string;
  name: string;
  status: 'Available' | 'Blocked' | 'Restricted';
  coordinates: [number, number][];
  reason?: string;
}

// Map center: Fictional Disaster Zone (Metro District)
// Coordinates around 26.9124, 75.7873 (Jaipur Metro Sector Grid)
const INITIAL_SHELTERS: Shelter[] = [
  { id: 'S1', name: 'Community Center Shelter A', latitude: 26.9180, longitude: 75.7920, capacity: 100, occupied: 92, supplies_status: 'Limited', contact: '+91 98290 11221' },
  { id: 'S2', name: 'Vidya Mandir Shelter B', latitude: 26.9050, longitude: 75.7750, capacity: 150, occupied: 60, supplies_status: 'Adequate', contact: '+91 98290 33442' },
  { id: 'S3', name: 'Sports Complex Shelter C', latitude: 26.9250, longitude: 75.7680, capacity: 200, occupied: 45, supplies_status: 'Adequate', contact: '+91 98290 55663' },
  { id: 'S4', name: 'Railway Stadium Safe Camp', latitude: 26.8980, longitude: 75.8050, capacity: 120, occupied: 30, supplies_status: 'Adequate', contact: '+91 98290 77884' }
];

const INITIAL_HOSPITALS: Hospital[] = [
  { id: 'H1', name: 'City Central Trauma Hospital', latitude: 26.9130, longitude: 75.7830, emergency_beds_total: 80, emergency_beds_available: 12, trauma_unit: true, contact: '108 / +91 141 220011' },
  { id: 'H2', name: 'District General Hospital', latitude: 26.9290, longitude: 75.7990, emergency_beds_total: 50, emergency_beds_available: 24, trauma_unit: true, contact: '108 / +91 141 220022' },
  { id: 'H3', name: 'Metro Life Care Clinic', latitude: 26.9020, longitude: 75.7600, emergency_beds_total: 30, emergency_beds_available: 18, trauma_unit: false, contact: '+91 141 220033' }
];

const INITIAL_ROADS: DisasterRoad[] = [
  {
    id: 'R17',
    name: 'Sector 7 Arterial Highway (R17)',
    status: 'Available',
    coordinates: [
      [26.9120, 75.7870],
      [26.9150, 75.7890],
      [26.9180, 75.7920]
    ],
    reason: 'Open for traffic'
  },
  {
    id: 'R22',
    name: 'West Bypass Corridor (R22)',
    status: 'Available',
    coordinates: [
      [26.9120, 75.7870],
      [26.9080, 75.7800],
      [26.9050, 75.7750]
    ],
    reason: 'Clear evacuation route to Shelter B'
  },
  {
    id: 'R09',
    name: 'North Ring Road (R09)',
    status: 'Available',
    coordinates: [
      [26.9200, 75.7800],
      [26.9250, 75.7750],
      [26.9250, 75.7680]
    ],
    reason: 'Open'
  }
];

let incidents: Incident[] = [
  {
    id: 1001,
    type: 'Flood',
    title: 'Waterlogging & Riverbank Breach',
    description: 'River water entered low-lying residential lanes. Ground floors submerged.',
    location_name: 'Sector 7 - Subhash Nagar',
    latitude: 26.9120,
    longitude: 75.7870,
    severity: 'Critical',
    people_affected: 43,
    people_trapped: 12,
    status: 'Verified',
    reported_by: 'Rajesh Sharma (Local Resident)',
    phone: '+91 94140 12345',
    priority_score: 94,
    priority_breakdown: {
      severity_score: 40,
      people_score: 20,
      type_score: 10,
      trapped_score: 14,
      verification_score: 10,
      total: 94
    },
    created_at: new Date(Date.now() - 45 * 60000).toISOString()
  },
  {
    id: 1002,
    type: 'People Trapped',
    title: 'Building Basement Water Inrush',
    description: 'Basement parking flooding rapidly with 8 individuals stranded inside.',
    location_name: 'Commercial Plaza, Block B',
    latitude: 26.9165,
    longitude: 75.7820,
    severity: 'Critical',
    people_affected: 25,
    people_trapped: 8,
    status: 'Verified',
    reported_by: 'Security Guard Mohan',
    phone: '+91 94140 67890',
    priority_score: 88,
    priority_breakdown: {
      severity_score: 40,
      people_score: 12,
      type_score: 20,
      trapped_score: 6,
      verification_score: 10,
      total: 88
    },
    created_at: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    id: 1003,
    type: 'Medical Emergency',
    title: 'Dialysis Patients Stranded Without Power',
    description: 'Clinic generator failed due to water level; 4 patients require urgent hospital transfer.',
    location_name: 'Care Clinic, Ward 4',
    latitude: 26.9090,
    longitude: 75.7940,
    severity: 'High',
    people_affected: 15,
    people_trapped: 4,
    status: 'Verified',
    reported_by: 'Dr. Anita Verma',
    phone: '+91 94140 99881',
    priority_score: 76,
    priority_breakdown: {
      severity_score: 28,
      people_score: 8,
      type_score: 25,
      trapped_score: 5,
      verification_score: 10,
      total: 76
    },
    created_at: new Date(Date.now() - 60 * 60000).toISOString()
  },
  {
    id: 1004,
    type: 'Road Block',
    title: 'Tree Fallen Across Main Highway R17',
    description: 'Large banyan tree fallen across both lanes, blocking ambulance passage.',
    location_name: 'Highway R17 Junction',
    latitude: 26.9150,
    longitude: 75.7890,
    severity: 'High',
    people_affected: 60,
    people_trapped: 0,
    status: 'Verified',
    reported_by: 'Traffic Warden',
    phone: '+91 94140 33221',
    priority_score: 68,
    priority_breakdown: {
      severity_score: 28,
      people_score: 20,
      type_score: 10,
      trapped_score: 0,
      verification_score: 10,
      total: 68
    },
    created_at: new Date(Date.now() - 75 * 60000).toISOString()
  },
  {
    id: 1005,
    type: 'Building Damage',
    title: 'Boundary Wall Collapse Near School',
    description: 'School perimeter wall collapsed; school premises currently evacuated.',
    location_name: 'Govt Girls Senior Secondary School',
    latitude: 26.9210,
    longitude: 75.7760,
    severity: 'Medium',
    people_affected: 30,
    people_trapped: 0,
    status: 'Unverified',
    reported_by: 'Principal Meena',
    phone: '+91 94140 44556',
    priority_score: 42,
    priority_breakdown: {
      severity_score: 18,
      people_score: 14,
      type_score: 10,
      trapped_score: 0,
      verification_score: 0,
      total: 42
    },
    created_at: new Date(Date.now() - 90 * 60000).toISOString()
  },
  {
    id: 1006,
    type: 'Flood',
    title: 'Drainage Overflow on Gandhi Path',
    description: 'Ankle-deep water on secondary service road. Vehicles moving slowly.',
    location_name: 'Gandhi Path West',
    latitude: 26.9030,
    longitude: 75.7680,
    severity: 'Low',
    people_affected: 18,
    people_trapped: 0,
    status: 'Unverified',
    reported_by: 'Sunil Mathur',
    phone: '+91 94140 77112',
    priority_score: 22,
    priority_breakdown: {
      severity_score: 8,
      people_score: 9,
      type_score: 5,
      trapped_score: 0,
      verification_score: 0,
      total: 22
    },
    created_at: new Date(Date.now() - 110 * 60000).toISOString()
  },
  {
    id: 1007,
    type: 'Fire',
    title: 'Transformer Sparking and Short Circuit',
    description: 'Electric transformer flooded at base; sparks reported by residents.',
    location_name: 'Sector 5 Electricity Substation',
    latitude: 26.9240,
    longitude: 75.7910,
    severity: 'High',
    people_affected: 50,
    people_trapped: 0,
    status: 'Verified',
    reported_by: 'Discom Line Staff',
    phone: '+91 94140 88990',
    priority_score: 65,
    priority_breakdown: {
      severity_score: 28,
      people_score: 17,
      type_score: 10,
      trapped_score: 0,
      verification_score: 10,
      total: 65
    },
    created_at: new Date(Date.now() - 120 * 60000).toISOString()
  },
  {
    id: 1008,
    type: 'Earthquake',
    title: 'Structural Cracks on Flyover Pillar',
    description: 'Minor earth tremor caused visible vertical hairline fissure on Pillar #14.',
    location_name: 'C-Scheme Overbridge',
    latitude: 26.9170,
    longitude: 75.7710,
    severity: 'Medium',
    people_affected: 70,
    people_trapped: 0,
    status: 'Unverified',
    reported_by: 'City Surveyor K.L. Gupta',
    phone: '+91 94140 55443',
    priority_score: 50,
    priority_breakdown: {
      severity_score: 18,
      people_score: 20,
      type_score: 12,
      trapped_score: 0,
      verification_score: 0,
      total: 50
    },
    created_at: new Date(Date.now() - 140 * 60000).toISOString()
  }
];

let shelters: Shelter[] = JSON.parse(JSON.stringify(INITIAL_SHELTERS));
let hospitals: Hospital[] = JSON.parse(JSON.stringify(INITIAL_HOSPITALS));
let roads: DisasterRoad[] = JSON.parse(JSON.stringify(INITIAL_ROADS));
let simulationStep = 0;
let simulationLogs: string[] = [];

// --- EXPLAINABLE PRIORITY CALCULATION ENGINE ---
// Mathematical, transparent, non-black-box rule system
export function calculatePriorityScore(
  severity: string,
  people_affected: number,
  type: string,
  people_trapped: number = 0,
  status: string = 'Unverified'
) {
  // 1. Severity Base (0 - 40)
  let severity_score = 0;
  if (severity === 'Critical') severity_score = 40;
  else if (severity === 'High') severity_score = 28;
  else if (severity === 'Medium') severity_score = 18;
  else severity_score = 8;

  // 2. People Affected Scale (0 - 20)
  // Max cap at 60 people for full 20 points
  let people_score = Math.min(20, Math.round((Math.max(1, people_affected) / 60) * 20));

  // 3. Incident Type Risk (0 - 25)
  let type_score = 10;
  if (type === 'People Trapped') type_score = 20;
  else if (type === 'Medical Emergency') type_score = 25;
  else if (type === 'Flood') type_score = 12;
  else if (type === 'Fire') type_score = 15;
  else if (type === 'Earthquake') type_score = 15;
  else if (type === 'Road Block') type_score = 10;
  else if (type === 'Building Damage') type_score = 10;

  // 4. Trapped People Escalation (0 - 15)
  let trapped_score = Math.min(15, Math.round(people_trapped * 1.5));

  // 5. Verification Boost (+10 for verified official/trusted report)
  let verification_score = (status === 'Verified') ? 10 : 0;

  let total = severity_score + people_score + type_score + trapped_score + verification_score;
  total = Math.min(100, Math.max(5, total));

  return {
    severity_score,
    people_score,
    type_score,
    trapped_score,
    verification_score,
    total
  };
}

// --- RECOMMENDATION ENGINE ("WHAT SHOULD RESPONDERS DO?") ---
export function generateRecommendations() {
  const verifiedCriticals = incidents.filter(i => (i.severity === 'Critical' || i.priority_score >= 75) && i.status !== 'Resolved' && i.status !== 'Rejected');
  const recommendations: any[] = [];

  // Evaluate Shelter Capacities
  const shelterA = shelters.find(s => s.id === 'S1') || shelters[0];
  const shelterB = shelters.find(s => s.id === 'S2') || shelters[1];
  const r17 = roads.find(r => r.id === 'R17');

  const shelterAOccupancyPct = Math.round((shelterA.occupied / shelterA.capacity) * 100);
  const shelterBOccupancyPct = Math.round((shelterB.occupied / shelterB.capacity) * 100);

  // Top Critical Incident Priority
  if (verifiedCriticals.length > 0) {
    const top = verifiedCriticals.sort((a, b) => b.priority_score - a.priority_score)[0];

    // Priority Action 1: Search & Rescue Dispatch
    if (top.people_trapped > 0 || top.severity === 'Critical') {
      recommendations.push({
        id: 'REC-1',
        title: `Dispatch Urgent Rescue Team to ${top.location_name}`,
        incident_id: top.id,
        urgency: 'Immediate (0-15 mins)',
        type: 'Search and Rescue',
        reason: `${top.people_affected} people affected, ${top.people_trapped} confirmed trapped in ${top.type} incident (Priority Score: ${top.priority_score}/100).`,
        steps: [
          `Deploy 2 SDRF/NDRF water rescue boats & rope team to ${top.location_name}.`,
          `Establish local triage point at dry perimeter.`,
          `Equip rescue personnel with life jackets, thermal blankets, and high-frequency walkie-talkies.`
        ]
      });
    }

    // Priority Action 2: Traffic & Road Routing Decision
    if (r17 && r17.status === 'Blocked') {
      recommendations.push({
        id: 'REC-2',
        title: `Traffic Diverted: Route via West Bypass Corridor (R22)`,
        urgency: 'Immediate',
        type: 'Traffic Logistics',
        reason: `Sector 7 Highway (R17) is BLOCKED. All emergency logistics redirected via clear corridor R22.`,
        steps: [
          `Place police barricades at R17 Entry Junction.`,
          `Activate green corridor on West Bypass (R22) for ambulances.`,
          `Broadcast alert on emergency citizen channels.`
        ]
      });
    } else {
      recommendations.push({
        id: 'REC-2',
        title: `Maintain Emergency Transit Lane on Sector 7 Highway (R17)`,
        urgency: 'High',
        type: 'Traffic Logistics',
        reason: `Primary highway R17 is currently open. Clear non-essential civilian vehicles.`,
        steps: [
          `Deploy traffic wardens to clear bottleneck intersections.`,
          `Prioritize heavy rescue equipment transport.`
        ]
      });
    }

    // Priority Action 3: Dynamic Shelter Routing Balancing
    if (shelterAOccupancyPct >= 85) {
      recommendations.push({
        id: 'REC-3',
        title: `Evacuation Divert: Route Victims to ${shelterB.name}`,
        urgency: 'High',
        type: 'Shelter Evacuation',
        reason: `${shelterA.name} is near capacity (${shelterAOccupancyPct}% full, ${shelterA.capacity - shelterA.occupied} spots left). ${shelterB.name} has ${shelterB.capacity - shelterB.occupied} available beds (${shelterBOccupancyPct}% occupied).`,
        steps: [
          `Direct civilian transport buses towards ${shelterB.name}.`,
          `Notify ${shelterB.name} administration of incoming ${top.people_affected} evacuees.`,
          `Dispatch emergency food rations & potable water tankers to ${shelterB.name}.`
        ]
      });
    } else {
      recommendations.push({
        id: 'REC-3',
        title: `Evacuate Displaced Citizens to ${shelterA.name}`,
        urgency: 'Moderate',
        type: 'Shelter Evacuation',
        reason: `${shelterA.name} has available capacity (${shelterAOccupancyPct}% occupied). Closest safe point.`,
        steps: [
          `Initiate orderly evacuation of ground-floor residents.`,
          `Log names and family contacts at Shelter A check-in desk.`
        ]
      });
    }

    // Priority Action 4: Medical Bed Readiness
    const availableBeds = hospitals.reduce((sum, h) => sum + h.emergency_beds_available, 0);
    recommendations.push({
      id: 'REC-4',
      title: `Alert City Central Hospital Trauma Unit`,
      urgency: 'High',
      type: 'Medical Response',
      reason: `Total city emergency beds: ${availableBeds} remaining. Prepare for hypothermia and trauma transfers.`,
      steps: [
        `Reserve 6 critical trauma beds at City Central Trauma Hospital.`,
        `Pre-position oxygen cylinders and IV saline at forward triage tents.`
      ]
    });
  } else {
    recommendations.push({
      id: 'REC-0',
      title: `Maintain Vigilance & Area Patrols`,
      urgency: 'Normal',
      type: 'Monitoring',
      reason: `No uncontained critical incidents at this moment.`,
      steps: [
        `Continue routine field verification of incoming citizen reports.`,
        `Monitor river gauge telemetry and water levels.`
      ]
    });
  }

  return recommendations;
}

// --- SERVER INITIALIZATION ---
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- REST API ENDPOINTS ---

  // 1. Get all incidents (with filtering)
  app.get('/api/incidents', (req, res) => {
    const { status, severity, search } = req.query;
    let result = [...incidents];

    if (status && status !== 'All') {
      result = result.filter(i => i.status === status);
    }
    if (severity && severity !== 'All') {
      result = result.filter(i => i.severity === severity);
    }
    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.location_name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q)
      );
    }

    // Return sorted by priority score descending
    result.sort((a, b) => b.priority_score - a.priority_score);
    res.json(result);
  });

  // 2. Submit new citizen incident report
  app.post('/api/incidents', (req, res) => {
    try {
      const {
        type,
        title,
        description,
        location_name,
        latitude,
        longitude,
        severity,
        people_affected,
        people_trapped,
        reported_by,
        phone
      } = req.body;

      if (!type || !location_name || !description) {
        return res.status(400).json({ error: 'Please provide incident type, location, and description.' });
      }

      const numAffected = Number(people_affected) || 1;
      const numTrapped = Number(people_trapped) || 0;
      const sev = severity || 'Medium';

      const breakdown = calculatePriorityScore(sev, numAffected, type, numTrapped, 'Unverified');
      const newId = 1000 + incidents.length + 1;

      const newIncident: Incident = {
        id: newId,
        type: type || 'Flood',
        title: title || `${type} at ${location_name}`,
        description,
        location_name,
        latitude: Number(latitude) || (26.9124 + (Math.random() - 0.5) * 0.03),
        longitude: Number(longitude) || (75.7873 + (Math.random() - 0.5) * 0.03),
        severity: sev,
        people_affected: numAffected,
        people_trapped: numTrapped,
        status: 'Unverified',
        reported_by: reported_by || 'Citizen Report',
        phone: phone || 'Not provided',
        priority_score: breakdown.total,
        priority_breakdown: breakdown,
        created_at: new Date().toISOString()
      };

      incidents.unshift(newIncident);

      res.status(201).json({
        success: true,
        message: 'Report submitted successfully. Incident queued for responder triage.',
        incident: newIncident
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Unable to save report: ' + err.message });
    }
  });

  // 3. Verify an incident (+10 score boost)
  app.post('/api/incidents/:id/verify', (req, res) => {
    const id = Number(req.params.id);
    const item = incidents.find(i => i.id === id);
    if (!item) return res.status(404).json({ error: 'Incident not found' });

    item.status = 'Verified';
    const breakdown = calculatePriorityScore(item.severity, item.people_affected, item.type, item.people_trapped, 'Verified');
    item.priority_score = breakdown.total;
    item.priority_breakdown = breakdown;

    res.json({ success: true, incident: item });
  });

  // 4. Resolve an incident
  app.post('/api/incidents/:id/resolve', (req, res) => {
    const id = Number(req.params.id);
    const item = incidents.find(i => i.id === id);
    if (!item) return res.status(404).json({ error: 'Incident not found' });

    item.status = 'Resolved';
    res.json({ success: true, incident: item });
  });

  // 5. Reject an incident
  app.post('/api/incidents/:id/reject', (req, res) => {
    const id = Number(req.params.id);
    const item = incidents.find(i => i.id === id);
    if (!item) return res.status(404).json({ error: 'Incident not found' });

    item.status = 'Rejected';
    res.json({ success: true, incident: item });
  });

  // 6. Get aggregate stats for top cards
  app.get('/api/stats', (req, res) => {
    const active = incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Rejected');
    const total = active.length;
    const critical = active.filter(i => i.severity === 'Critical' || i.priority_score >= 75).length;
    const peopleAffected = active.reduce((sum, i) => sum + i.people_affected, 0);
    const peopleTrapped = active.reduce((sum, i) => sum + (i.people_trapped || 0), 0);
    const verified = active.filter(i => i.status === 'Verified').length;
    const shelterTotalCapacity = shelters.reduce((s, sh) => s + sh.capacity, 0);
    const shelterOccupied = shelters.reduce((s, sh) => s + sh.occupied, 0);

    res.json({
      total_incidents: total,
      critical_incidents: critical,
      people_affected: peopleAffected,
      people_trapped: peopleTrapped,
      verified_incidents: verified,
      shelter_capacity_total: shelterTotalCapacity,
      shelter_capacity_occupied: shelterOccupied,
      shelter_available_beds: shelterTotalCapacity - shelterOccupied,
      simulation_step: simulationStep
    });
  });

  // 7. Get Shelters, Hospitals & Disaster Infrastructure
  app.get('/api/shelters', (req, res) => res.json(shelters));
  app.get('/api/hospitals', (req, res) => res.json(hospitals));
  app.get('/api/roads', (req, res) => res.json(roads));

  // 8. Get Response Recommendations
  app.get('/api/recommendations', (req, res) => {
    const recs = generateRecommendations();
    res.json(recs);
  });

  // 9. Interactive Flood Simulation Controls (SIH Jury Demo Mode)
  app.post('/api/simulation/step/:step', (req, res) => {
    const step = Number(req.params.step);
    simulationStep = step;

    let logMessage = '';

    if (step === 1) {
      // Event 1: Heavy Rainfall Alert
      logMessage = 'Event 1: Meteorological Department issues Red Flood Warning. River flow surges by 180%.';
    } else if (step === 2) {
      // Event 2: Road R17 Blocked
      const r17 = roads.find(r => r.id === 'R17');
      if (r17) {
        r17.status = 'Blocked';
        r17.reason = 'Submerged under 4ft water & fallen electric tree. Inaccessible.';
      }
      logMessage = 'Event 2: Primary Sector 7 Highway (R17) declared BLOCKED. Route to Shelter A severed.';
    } else if (step === 3) {
      // Event 3: Citizen report 43 people affected
      const sec7 = incidents.find(i => i.id === 1001);
      if (sec7) {
        sec7.people_affected = 43;
        sec7.severity = 'Critical';
        const breakdown = calculatePriorityScore(sec7.severity, sec7.people_affected, sec7.type, sec7.people_trapped, sec7.status);
        sec7.priority_score = breakdown.total;
        sec7.priority_breakdown = breakdown;
      }
      logMessage = 'Event 3: Citizen reports surge in Sector 7. 43 people affected.';
    } else if (step === 4) {
      // Event 4: 20 additional people trapped
      const sec7 = incidents.find(i => i.id === 1001);
      if (sec7) {
        sec7.people_affected = 63;
        sec7.people_trapped = 20;
        sec7.severity = 'Critical';
        sec7.status = 'Verified';
        const breakdown = calculatePriorityScore(sec7.severity, sec7.people_affected, sec7.type, sec7.people_trapped, 'Verified');
        sec7.priority_score = breakdown.total;
        sec7.priority_breakdown = breakdown;
      }
      // Fill Shelter A to 92% to trigger dynamic shelter rerouting to Shelter B
      const s1 = shelters.find(s => s.id === 'S1');
      if (s1) s1.occupied = 92;

      logMessage = 'Event 4: Emergency escalation: 20 additional citizens trapped in Sector 7 rooftops. Shelter A reaches 92% capacity.';
    } else if (step === 5) {
      // Event 5: System recalculates priority and updates action plan
      logMessage = 'Event 5: AegisMesh Engine dynamically updates response: Priority escalated to 98/100. Rescue boats dispatched; Evacuation redirected to Shelter B (40% capacity) via West Bypass (R22).';
    }

    simulationLogs.unshift(`[Step ${step}] ${logMessage}`);
    res.json({
      step: simulationStep,
      message: logMessage,
      logs: simulationLogs,
      incidents,
      roads,
      shelters,
      recommendations: generateRecommendations()
    });
  });

  // Reset Simulation to Initial State
  app.post('/api/simulation/reset', (req, res) => {
    simulationStep = 0;
    simulationLogs = [];
    shelters = JSON.parse(JSON.stringify(INITIAL_SHELTERS));
    roads = JSON.parse(JSON.stringify(INITIAL_ROADS));

    // Reset Sector 7 incident
    const sec7 = incidents.find(i => i.id === 1001);
    if (sec7) {
      sec7.people_affected = 43;
      sec7.people_trapped = 12;
      sec7.severity = 'Critical';
      sec7.status = 'Verified';
      const breakdown = calculatePriorityScore(sec7.severity, sec7.people_affected, sec7.type, sec7.people_trapped, 'Verified');
      sec7.priority_score = breakdown.total;
      sec7.priority_breakdown = breakdown;
    }

    res.json({ success: true, message: 'Simulation reset to baseline state.' });
  });

  // --- FRONTEND SERVING (Vite in Dev, Static in Prod) ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AegisMesh Disaster Management System running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
