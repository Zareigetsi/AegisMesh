# AegisMesh — Disaster Response & Command System
**Tagline:** *"From Disaster Reports to Response Decisions"*

---

## 🎯 Executive Summary & Problem Statement

During major disaster emergencies (floods, earthquakes, fires), emergency command centers receive a deluge of raw citizen reports. Most traditional prototypes stop at plotting red pins on a map, leaving human dispatchers overwhelmed with decision fatigue.

**AegisMesh** bridges the gap between passive reporting and actionable emergency response:
```
CITIZEN REPORTS  ➔  EXPLAINABLE PRIORITY  ➔  RESOURCE BALANCING  ➔  ACTION DECISIONS
```

* **Core Value:** Automatically ingests raw citizen reports, calculates transparent priority scores, evaluates shelter and hospital capacities alongside road blockades, and delivers actionable response recommendations within seconds.

---

## 💡 Jury Defense Q&A Sheet

### Q1: What is innovative here?
> *"We transform the traditional passive reporting dashboard into an active, explainable decision engine that prioritizes incidents and balances shelter load in real time."*

### Q2: Why use an explainable rule-based engine instead of a deep ML black box?
> *"In life-critical emergency management, decision logic MUST be 100% explainable, transparent, and auditable without hallucination or algorithmic bias. Machine learning can be integrated downstream for image verification and deduplication."*

### Q3: Why not just use Google Maps?
> *"Google Maps is designed for individual consumer navigation. AegisMesh is an operational disaster command dashboard answering: Which sector needs rescue boats first? Which shelter has remaining capacity? Which evacuation corridor is cut off?"*

---

## 🚀 Key Innovations & Architecture

### 1. Explainable Priority Scoring Engine
Unlike opaque models, AegisMesh uses a mathematically verifiable additive formula:
$$\text{Priority} = \text{Severity} (0\text{–}40) + \text{People Affected} (0\text{–}20) + \text{Hazard Type} (0\text{–}25) + \text{Trapped Score} (0\text{–}15) + \text{Verification Boost} (0\text{–}10)$$

Users and evaluators can click **"Score Math"** on any incident card to view the exact point-by-point calculation.

### 2. Suggested Response Decision Engine ("What Should Responders Do?")
The engine continuously evaluates incidents, road accessibility, and shelter/hospital capacities to generate concrete operational commands:
* **Search & Rescue:** Auto-dispatch boat teams to severe flood sectors with trapped citizens.
* **Traffic Routing:** Detects road blockades (e.g. Highway R17 under 4ft water) and designates open green corridors (Highway R22).
* **Dynamic Shelter Balancing:** When Community Shelter A reaches 92% occupancy, evacuees are automatically redirected to Shelter B (40% full).

### 3. Interactive Leaflet Disaster Geo-Grid
* Real-time color-coded hazard markers with interactive popups.
* Shelter and hospital occupancy gauges updated in real time.
* Click-to-pinpoint coordinate selection for citizen disaster reporting.

### 4. 5-Step Controlled Flood Simulation
An interactive 5-step demonstration walkthrough:
* **Step 1:** Meteorological Red Warning issued (>85mm/hr precipitation).
* **Step 2:** Highway R17 blocked by 4ft floodwaters. Primary shelter route cut off.
* **Step 3:** Citizen reports 43 people affected in Sector 7.
* **Step 4:** 20 citizens trapped on rooftops; Community Shelter A reaches 92% capacity.
* **Step 5:** AegisMesh escalates priority to 98/100, dispatches rescue boats, and diverts evacuation to Shelter B via Highway R22.

---

## 🔮 Future Scope & Scalability

* 📡 **IoT Water-Level Gauges:** Automatic telemetry from river and drain sensors directly into the database.
* 🛰️ **ISRO / Satellite Inundation Data:** Real-time GIS flood polygon overlay integration.
* 📱 **Offline Mesh Radio (LoRa):** Citizen SMS/Bluetooth packet mesh communication when cell towers fail.
* 🤖 **Vision AI:** Automated image verification to filter false alarms and assess disaster severity from citizen photos.
* 🏛️ **NDRF / SDMA Dispatch:** Automated dispatch ticket routing to district disaster response authorities.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3 (Custom Variables), Vanilla JavaScript (ES Modules) |
| **Mapping** | Leaflet.js, OpenStreetMap Carto Tiles |
| **Backend API** | Python (Flask REST API) + Node.js Express Runtime |
| **Database** | SQLite3 |

---

## 📂 Project Structure

```
aegismesh/
├── app.py                  # Python Flask REST API server
├── database.py             # SQLite database schema & connection helpers
├── data/
│   └── seed.py             # Database seed script for disaster scenarios
├── tests/
│   └── test_priority.py    # Unit tests for the Priority algorithm
├── requirements.txt        # Python dependencies
├── server.ts               # Web runtime backend server
├── index.html              # Clean single-page application entrypoint
├── src/
│   ├── style.css           # Emergency response design system
│   ├── main.js             # Application coordinator
│   ├── map.js              # Leaflet mapping & markers
│   ├── dashboard.js        # KPI cards & incident triage
│   ├── report.js           # Citizen report form & coordinate picker
│   └── simulation.js       # 5-step demo simulation controller
├── README.md               # Complete project documentation & jury guide
└── metadata.json
```

---

## 🏃 How to Run the Python Backend

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Seed initial SQLite database
python data/seed.py

# 3. Run priority algorithm test suite
python -m unittest tests/test_priority.py

# 4. Start Flask server
python app.py
```

---

## 🎤 3-Minute Presentation Walkthrough Script

1. **Minute 1: The Problem & Live Dashboard**  
   Open the **Command Dashboard**. Highlight the top KPI ribbon (Active Incidents, Critical, People Affected, Safe Shelters). Explain that human dispatchers cannot triage hundreds of simultaneous calls manually.
2. **Minute 2: Citizen Report & Explainable Math**  
   Switch to **Report Disaster**. Submit an incident or click an existing card and select **"Score Math"**. Show the additive formula table to demonstrate 100% transparency and auditability.
3. **Minute 3: The 5-Step Simulation & Dynamic Decisions**  
   Switch to **Flood Simulation (Demo)** and click **"Auto-Play 5 Steps"**. Show how Highway R17 gets blocked, Shelter A fills to 92%, and AegisMesh autonomously generates recommendations to divert evacuees to Shelter B via Highway R22!
4. **Closing Statement:**  
   *"AegisMesh doesn't stop at collecting disaster reports. It converts them into prioritized response decisions."*
