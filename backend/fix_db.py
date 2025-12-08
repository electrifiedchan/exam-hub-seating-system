import sqlite3

try:
    conn = sqlite3.connect('instance/exam_seating.db')
    cursor = conn.cursor()
    
    # Check if column exists
    cursor.execute("PRAGMA table_info(room)")
    columns = [info[1] for info in cursor.fetchall()]
    
    if 'blocked_seats' not in columns:
        print("Adding blocked_seats column...")
        cursor.execute("ALTER TABLE room ADD COLUMN blocked_seats TEXT DEFAULT ''")
        conn.commit()
        print("Database patched successfully.")
    else:
        print("Column blocked_seats already exists.")
        
    conn.close()
except Exception as e:
    print(f"Error: {e}")
