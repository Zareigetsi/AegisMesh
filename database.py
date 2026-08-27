"""
AegisMesh — Database Module (SQLite)
Smart India Hackathon Prototype (PS 26206)

This file manages the local SQLite database for storing disaster incidents,
shelters, hospitals, and emergency resources.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "aegismesh.db")

def get_db_connection():
    """Establishes and returns a connection to the SQLite database with Row factory enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Creates the necessary database tables if they do not already exist."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Incidents Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location_name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        severity TEXT NOT NULL,
        people_affected INTEGER NOT NULL DEFAULT 1,
        people_trapped INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'Unverified',
        reported_by TEXT,
        phone TEXT,
        priority_score INTEGER NOT NULL DEFAULT 50,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # 2. Shelters Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS shelters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        capacity INTEGER NOT NULL,
        occupied INTEGER NOT NULL DEFAULT 0,
        supplies_status TEXT DEFAULT 'Adequate',
        contact TEXT
    )
    """)

    # 3. Hospitals Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS hospitals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        emergency_beds_total INTEGER NOT NULL,
        emergency_beds_available INTEGER NOT NULL,
        trauma_unit INTEGER DEFAULT 1,
        contact TEXT
    )
    """)

    conn.commit()
    conn.close()
    print("✓ SQLite Database and tables initialized successfully.")

if __name__ == "__main__":
    init_db()
