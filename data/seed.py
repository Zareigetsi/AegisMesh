"""
AegisMesh — Database Seed Script
Smart India Hackathon Prototype (PS 26206)

Populates SQLite database with realistic initial disaster data:
- 8 varied incidents across severity levels
- 4 safe emergency relief shelters
- 3 trauma & district hospitals
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db_connection, init_db

def seed_database():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    # Clear existing data for fresh seed
    cursor.execute("DELETE FROM incidents")
    cursor.execute("DELETE FROM shelters")
    cursor.execute("DELETE FROM hospitals")

    # 1. Seed Shelters
    shelters = [
        ('S1', 'Community Center Shelter A', 26.9180, 75.7920, 100, 92, 'Limited', '+91 98290 11221'),
        ('S2', 'Vidya Mandir Shelter B', 26.9050, 75.7750, 150, 60, 'Adequate', '+91 98290 33442'),
        ('S3', 'Sports Complex Shelter C', 26.9250, 75.7680, 200, 45, 'Adequate', '+91 98290 55663'),
        ('S4', 'Railway Stadium Safe Camp', 26.8980, 75.8050, 120, 30, 'Adequate', '+91 98290 77884')
    ]
    cursor.executemany("""
    INSERT INTO shelters (id, name, latitude, longitude, capacity, occupied, supplies_status, contact)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, shelters)

    # 2. Seed Hospitals
    hospitals = [
        ('H1', 'City Central Trauma Hospital', 26.9130, 75.7830, 80, 12, 1, '108 / +91 141 220011'),
        ('H2', 'District General Hospital', 26.9290, 75.7990, 50, 24, 1, '108 / +91 141 220022'),
        ('H3', 'Metro Life Care Clinic', 26.9020, 75.7600, 30, 18, 0, '+91 141 220033')
    ]
    cursor.executemany("""
    INSERT INTO hospitals (id, name, latitude, longitude, emergency_beds_total, emergency_beds_available, trauma_unit, contact)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, hospitals)

    # 3. Seed Incidents
    incidents = [
        (1001, 'Flood', 'Waterlogging & Riverbank Breach', 'River water entered low-lying residential lanes. Ground floors submerged.', 'Sector 7 - Subhash Nagar', 26.9120, 75.7870, 'Critical', 43, 12, 'Verified', 'Rajesh Sharma', '+91 94140 12345', 94),
        (1002, 'People Trapped', 'Building Basement Water Inrush', 'Basement parking flooding rapidly with 8 individuals stranded inside.', 'Commercial Plaza, Block B', 26.9165, 75.7820, 'Critical', 25, 8, 'Verified', 'Security Guard Mohan', '+91 94140 67890', 88),
        (1003, 'Medical Emergency', 'Dialysis Patients Stranded Without Power', 'Clinic generator failed; 4 patients require urgent hospital transfer.', 'Care Clinic, Ward 4', 26.9090, 75.7940, 'High', 15, 4, 'Verified', 'Dr. Anita Verma', '+91 94140 99881', 76),
        (1004, 'Road Block', 'Tree Fallen Across Main Highway R17', 'Large banyan tree fallen across both lanes, blocking ambulance passage.', 'Highway R17 Junction', 26.9150, 75.7890, 'High', 60, 0, 'Verified', 'Traffic Warden', '+91 94140 33221', 68),
        (1005, 'Building Damage', 'Boundary Wall Collapse Near School', 'School perimeter wall collapsed; school premises currently evacuated.', 'Govt Girls Senior Secondary School', 26.9210, 75.7760, 'Medium', 30, 0, 'Unverified', 'Principal Meena', '+91 94140 44556', 42),
        (1006, 'Flood', 'Drainage Overflow on Gandhi Path', 'Ankle-deep water on secondary service road. Vehicles moving slowly.', 'Gandhi Path West', 26.9030, 75.7680, 'Low', 18, 0, 'Unverified', 'Sunil Mathur', '+91 94140 77112', 22),
        (1007, 'Fire', 'Transformer Sparking and Short Circuit', 'Electric transformer flooded at base; sparks reported by residents.', 'Sector 5 Electricity Substation', 26.9240, 75.7910, 'High', 50, 0, 'Verified', 'Discom Line Staff', '+91 94140 88990', 65),
        (1008, 'Earthquake', 'Structural Cracks on Flyover Pillar', 'Minor earth tremor caused visible vertical hairline fissure on Pillar #14.', 'C-Scheme Overbridge', 26.9170, 75.7710, 'Medium', 70, 0, 'Unverified', 'City Surveyor K.L. Gupta', '+91 94140 55443', 50)
    ]

    cursor.executemany("""
    INSERT INTO incidents (id, type, title, description, location_name, latitude, longitude, severity, people_affected, people_trapped, status, reported_by, phone, priority_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, incidents)

    conn.commit()
    conn.close()
    print("✓ Successfully seeded database with initial disaster management records.")

if __name__ == "__main__":
    seed_database()
