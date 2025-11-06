#!/usr/bin/env python
"""
Clean up stuck analyses (pending or running status)
"""
import sqlite3
import sys

def cleanup_stuck_analyses():
    db_path = "ahrefs_data.db"
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Find stuck analyses
        cursor.execute("""
            SELECT target_id, name, status 
            FROM analysis 
            WHERE status IN ('pending', 'running')
        """)
        
        stuck = cursor.fetchall()
        
        if not stuck:
            print("✅ No stuck analyses found")
            return
        
        print(f"Found {len(stuck)} stuck analyses:")
        for target_id, name, status in stuck:
            print(f"  - {target_id[:8]}... | {name} | {status}")
        
        # Update them to failed
        cursor.execute("""
            UPDATE analysis 
            SET status = 'failed' 
            WHERE status IN ('pending', 'running')
        """)
        
        updated = cursor.rowcount
        conn.commit()
        
        print(f"\n✅ Updated {updated} analyses to 'failed' status")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        conn.close()

if __name__ == "__main__":
    cleanup_stuck_analyses()

