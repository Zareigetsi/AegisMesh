"""
AegisMesh — Backend Application (Flask + SQLite)
Smart India Hackathon Prototype (PS 26206)

Theme: Student Innovation — Disaster Management
"From Disaster Reports to Response Decisions"
"""

from flask import Flask, request, jsonify, render_template
import sqlite3
import os
from database import get_db_connection, init_db

app = Flask(__name__)
app.secret_key = "aegismesh_sih_2026_prototype"

# Ensure database exists on startup
init_db()

# --- EXPLAINABLE PRIORITY ENGINE ---
def calculate_priority(severity, people_affected, incident_type, people_trapped=0, status='Unverified'):
    """
    Additive explainable formula that judges can inspect:
    Total = Severity (0-40) + Affected (0-20) + Type (0-25) + Trapped (0-15) + Verification (0-10)
    """
    # 1. Severity Base (0 - 40)
    severity_map = {'Critical': 40, 'High': 28, 'Medium': 18, 'Low': 8}
    severity_score = severity_map.get(severity, 18)

    # 2. People Affected (0 - 20)
    people_score = min(20, round((max(1, int(people_affected)) / 60) * 20))

    # 3. Incident Type Risk (0 - 25)
    type_map = {
        'Medical Emergency': 25,
        'People Trapped': 20,
        'Fire': 15,
        'Earthquake': 15,
        'Flood': 12,
        'Road Block': 10,
        'Building Damage': 10,
        'Other': 8
    }
    type_score = type_map.get(incident_type, 10)

    # 4. Trapped Escalation (0 - 15)
    trapped_score = min(15, round(int(people_trapped) * 1.5))

    # 5. Verification Boost (+10)
    verification_score = 10 if status == 'Verified' else 0

    total = severity_score + people_score + type_score + trapped_score + verification_score
    total = min(100, max(5, total))

    return {
        'severity_score': severity_score,
        'people_score': people_score,
        'type_score': type_score,
        'trapped_score': trapped_score,
        'verification_score': verification_score,
        'total': total
    }

# --- RESPONSE RECOMMENDATIONS ENGINE ---
def generate_responder_recommendations(incidents, shelters):
    """
    Rule-based deterministic decision tree recommending actionable rescue steps.
    """
    recs = []
    critical_incidents = [i for i in incidents if i['severity'] == 'Critical' and i['status'] != 'Resolved']

    if critical_incidents:
        top = sorted(critical_incidents, key=lambda x: x['priority_score'], reverse=True)[0]
        
        # Action 1: Search & Rescue
        recs.append({
            'id': 'REC-1',
            'title': f"Dispatch Urgent Rescue Team to {top['location_name']}",
            'urgency': 'Immediate (0-15 mins)',
            'type': 'Search and Rescue',
            'reason': f"{top['people_affected']} people affected, {top.get('people_trapped', 0)} trapped in {top['type']} incident.",
            'steps': [
                f"Deploy 2 SDRF water rescue boats & rope rescue team to {top['location_name']}.",
                "Establish local triage point at dry perimeter.",
                "Equip rescue personnel with life jackets and first-aid kits."
            ]
        })

        # Action 2: Shelter Balancing
        shelter_a = next((s for s in shelters if s['id'] == 'S1'), None)
        shelter_b = next((s for s in shelters if s['id'] == 'S2'), None)

        if shelter_a and shelter_b:
            occ_pct_a = (shelter_a['occupied'] / shelter_a['capacity']) * 100
            if occ_pct_a >= 85:
                recs.append({
                    'id': 'REC-2',
                    'title': f"Evacuation Divert: Route Victims to {shelter_b['name']}",
                    'urgency': 'High',
                    'type': 'Shelter Allocation',
                    'reason': f"{shelter_a['name']} is at {round(occ_pct_a)}% capacity. {shelter_b['name']} has available beds.",
                    'steps': [
                        f"Direct civilian transport buses to {shelter_b['name']}.",
                        f"Notify {shelter_b['name']} coordinator of incoming evacuees."
                    ]
                })

    return recs

# --- API ROUTES ---

@app.route('/api/incidents', methods=['GET'])
def get_incidents():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents ORDER BY priority_score DESC")
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/api/incidents', methods=['POST'])
def create_incident():
    data = request.json or request.form
    inc_type = data.get('type', 'Flood')
    title = data.get('title') or f"{inc_type} at {data.get('location_name', 'Reported Location')}"
    desc = data.get('description', '')
    location = data.get('location_name', 'Sector Zone')
    lat = float(data.get('latitude', 26.9124))
    lon = float(data.get('longitude', 75.7873))
    severity = data.get('severity', 'Medium')
    affected = int(data.get('people_affected', 1))
    trapped = int(data.get('people_trapped', 0))
    reported_by = data.get('reported_by', 'Citizen Report')
    phone = data.get('phone', '')

    breakdown = calculate_priority(severity, affected, inc_type, trapped, 'Unverified')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO incidents (type, title, description, location_name, latitude, longitude, severity, people_affected, people_trapped, status, reported_by, phone, priority_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Unverified', ?, ?, ?)
    """, (inc_type, title, desc, location, lat, lon, severity, affected, trapped, reported_by, phone, breakdown['total']))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()

    return jsonify({'success': True, 'id': new_id, 'priority_score': breakdown['total']}), 201

@app.route('/api/incidents/<int:inc_id>/verify', methods=['POST'])
def verify_incident(inc_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM incidents WHERE id = ?", (inc_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({'error': 'Incident not found'}), 404

    inc = dict(row)
    breakdown = calculate_priority(inc['severity'], inc['people_affected'], inc['type'], inc['people_trapped'], 'Verified')

    cursor.execute("UPDATE incidents SET status = 'Verified', priority_score = ? WHERE id = ?", (breakdown['total'], inc_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'priority_score': breakdown['total']})

@app.route('/api/incidents/<int:inc_id>/resolve', methods=['POST'])
def resolve_incident(inc_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE incidents SET status = 'Resolved' WHERE id = ?", (inc_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/shelters', methods=['GET'])
def get_shelters():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM shelters")
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/api/hospitals', methods=['GET'])
def get_hospitals():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM hospitals")
    rows = cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

if __name__ == '__main__':
    print("Starting AegisMesh Flask Backend on http://127.0.0.1:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
