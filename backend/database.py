"""
LiveCost SQLite Database Layer - database.py

Handles all the database stuff - caching API responses and storing
prediction queries for analytics.

Went with SQLite because:
- No server setup needed (it's just a file)
- Built into Python so no extra dependencies
- Perfect for a proof of concept like this
- Can always migrate to PostgreSQL later if needed

Author: Jeremiah Williams
Course: Project & Portfolio IV - Full Sail University
Date: December 2025
"""

import sqlite3
import json
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

# Database file lives in the same folder as this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(SCRIPT_DIR, 'livecost.db')

# Cache entries expire after 24 hours
CACHE_EXPIRATION_HOURS = 24


def get_connection():
    """
    Get a database connection.

    Using row_factory=sqlite3.Row so we can access columns by name
    instead of index. Way easier to work with.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_database():
    """
    Create the database tables if they don't exist.

    Safe to call multiple times - IF NOT EXISTS prevents errors.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Table for storing every prediction request
    # Good for analytics and could be used for a history feature
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_queries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            city TEXT NOT NULL,
            apartment_size TEXT NOT NULL,
            dining_frequency INTEGER NOT NULL,
            car_type TEXT NOT NULL,
            commute_miles REAL NOT NULL,
            predicted_cost REAL NOT NULL,
            breakdown TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Cache table for API responses
    # In production this would cache real Zillow/Numbeo API calls
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS api_cache (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cache_key TEXT UNIQUE NOT NULL,
            response_data TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME NOT NULL
        )
    ''')

    # Detailed prediction results (could use for deeper analysis)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS prediction_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            query_hash TEXT NOT NULL,
            city TEXT NOT NULL,
            total_cost REAL NOT NULL,
            rent REAL NOT NULL,
            food REAL NOT NULL,
            transportation REAL NOT NULL,
            utilities REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()

    print(f"Database initialized at: {DB_PATH}")


def save_user_query(
    city: str,
    apartment_size: str,
    dining_frequency: int,
    car_type: str,
    commute_miles: float,
    predicted_cost: float,
    breakdown: Dict[str, float]
) -> int:
    """
    Save a prediction query to the database.

    Returns the query ID so we can include it in the API response.
    Using parameterized queries (?) to prevent SQL injection -
    never use f-strings for SQL!
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO user_queries
        (city, apartment_size, dining_frequency, car_type, commute_miles,
         predicted_cost, breakdown)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        city,
        apartment_size,
        dining_frequency,
        car_type,
        commute_miles,
        predicted_cost,
        json.dumps(breakdown)
    ))

    query_id = cursor.lastrowid

    conn.commit()
    conn.close()

    return query_id


def get_cached_api_response(cache_key: str) -> Optional[Dict[str, Any]]:
    """
    Check if we have a cached response for this key.

    Returns None if not found or expired.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT response_data, expires_at FROM api_cache
        WHERE cache_key = ? AND expires_at > datetime('now')
    ''', (cache_key,))

    row = cursor.fetchone()
    conn.close()

    if row:
        return json.loads(row['response_data'])

    return None


def cache_api_response(cache_key: str, response_data: Dict[str, Any]):
    """
    Store an API response in the cache.

    Using INSERT OR REPLACE so it handles both new entries and updates.
    """
    conn = get_connection()
    cursor = conn.cursor()

    expires_at = datetime.now() + timedelta(hours=CACHE_EXPIRATION_HOURS)

    cursor.execute('''
        INSERT OR REPLACE INTO api_cache (cache_key, response_data, created_at, expires_at)
        VALUES (?, ?, datetime('now'), ?)
    ''', (cache_key, json.dumps(response_data), expires_at.isoformat()))

    conn.commit()
    conn.close()


def get_recent_queries(limit: int = 10) -> list:
    """Get the most recent prediction queries."""
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        SELECT * FROM user_queries
        ORDER BY timestamp DESC
        LIMIT ?
    ''', (limit,))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def get_query_statistics() -> Dict[str, Any]:
    """
    Get aggregate stats from stored queries.

    Useful for an analytics dashboard or understanding usage patterns.
    """
    conn = get_connection()
    cursor = conn.cursor()

    # Total queries
    cursor.execute('SELECT COUNT(*) as count FROM user_queries')
    total_queries = cursor.fetchone()['count']

    # Queries by city
    cursor.execute('''
        SELECT city, COUNT(*) as count
        FROM user_queries
        GROUP BY city
        ORDER BY count DESC
    ''')
    queries_by_city = {row['city']: row['count'] for row in cursor.fetchall()}

    # Average cost
    cursor.execute('SELECT AVG(predicted_cost) as avg_cost FROM user_queries')
    avg_cost = cursor.fetchone()['avg_cost'] or 0

    conn.close()

    return {
        'total_queries': total_queries,
        'queries_by_city': queries_by_city,
        'average_predicted_cost': round(avg_cost, 2)
    }


def cleanup_expired_cache():
    """
    Delete old cache entries.

    Could run this on a schedule or when the cache gets too big.
    """
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute('''
        DELETE FROM api_cache
        WHERE expires_at < datetime('now')
    ''')

    deleted_count = cursor.rowcount

    conn.commit()
    conn.close()

    return deleted_count


if __name__ == '__main__':
    # Run this directly to set up the database
    init_database()
    print("Database setup complete!")
