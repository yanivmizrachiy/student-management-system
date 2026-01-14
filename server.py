# -*- coding: utf-8 -*-
import http.server
import socketserver
import os
import json
import time
import threading
from pathlib import Path

PORT = 8000
TIMESTAMP_FILE = ".last-update.json"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def do_GET(self):
        if self.path == '/check-update':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            
            try:
                if os.path.exists(TIMESTAMP_FILE):
                    with open(TIMESTAMP_FILE, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    response = json.dumps(data, ensure_ascii=False)
                else:
                    response = json.dumps({'timestamp': 0}, ensure_ascii=False)
            except:
                response = json.dumps({'timestamp': 0}, ensure_ascii=False)
            
            self.wfile.write(response.encode('utf-8'))
            return
        
        return super().do_GET()
    
    def log_message(self, format, *args):
        pass

def watch_files():
    last_mtimes = {}
    
    while True:
        time.sleep(1)
        
        try:
            important_extensions = ['.html', '.js', '.css']
            
            for ext in important_extensions:
                for file_path in Path('.').rglob(f'*{ext}'):
                    if file_path.name.startswith('.') or 'node_modules' in str(file_path):
                        continue
                    
                    try:
                        current_mtime = file_path.stat().st_mtime
                        file_str = str(file_path)
                        
                        if file_str in last_mtimes:
                            if current_mtime > last_mtimes[file_str]:
                                timestamp = time.time()
                                with open(TIMESTAMP_FILE, 'w', encoding='utf-8') as f:
                                    json.dump({'timestamp': timestamp, 'file': file_path.name}, f, ensure_ascii=False)
                                print(f"File updated: {file_path.name}")
                                last_mtimes[file_str] = current_mtime
                        else:
                            last_mtimes[file_str] = current_mtime
                    except:
                        pass
        except:
            pass

def main():
    if not os.path.exists(TIMESTAMP_FILE):
        with open(TIMESTAMP_FILE, 'w', encoding='utf-8') as f:
            json.dump({'timestamp': time.time()}, f, ensure_ascii=False)
    
    watcher_thread = threading.Thread(target=watch_files, daemon=True)
    watcher_thread.start()
    
    print("\n" + "="*60)
    print("🚀 Live Reload Server Started!")
    print("="*60)
    print(f"🌐 URL: http://localhost:{PORT}")
    print(f"📁 Directory: {os.getcwd()}")
    print("🔄 Auto-refresh: Enabled (checks every second)")
    print("="*60 + "\n")
    print("Press Ctrl+C to stop\n")
    
    max_retries = 5
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            # נסה ליצור שרת עם אפשרות לשימוש חוזר בכתובת
            socketserver.TCPServer.allow_reuse_address = True
            with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
                print(f"✅ Server listening on port {PORT}")
                httpd.serve_forever()
                break
        except KeyboardInterrupt:
            print("\n\n🛑 Server stopped by user...")
            break
        except OSError as e:
            if "Address already in use" in str(e) or (hasattr(e, 'errno') and e.errno == 10048):
                retry_count += 1
                if retry_count < max_retries:
                    print(f"\n⚠️  Port {PORT} is already in use!")
                    print(f"   Attempting to free port... (attempt {retry_count}/{max_retries})")
                    # נסה לעצור תהליכים ישנים
                    try:
                        import socket
                        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
                        time.sleep(2)
                    except:
                        pass
                else:
                    print(f"\n❌ Port {PORT} is still in use after {max_retries} attempts!")
                    print("   Please close the previous server manually\n")
                    break
            else:
                print(f"\n❌ Error: {e}\n")
                retry_count += 1
                if retry_count < max_retries:
                    print(f"   Retrying in 3 seconds... (attempt {retry_count}/{max_retries})")
                    time.sleep(3)
                else:
                    break
        except Exception as e:
            print(f"\n❌ Unexpected error: {e}\n")
            retry_count += 1
            if retry_count < max_retries:
                print(f"   Retrying in 3 seconds... (attempt {retry_count}/{max_retries})")
                time.sleep(3)
            else:
                break

if __name__ == "__main__":
    main()

