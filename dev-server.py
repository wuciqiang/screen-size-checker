#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Development server with clean URL support
Automatically appends .html to URLs that don't have an extension
"""

import http.server
import socketserver
import os
import sys
import io
from urllib.parse import unquote

# Fix Windows console encoding issue
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

PORT = 1868
DIRECTORY = "multilang-build"

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler that supports clean URLs by automatically appending .html"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def do_GET(self):
        # Decode URL
        path = unquote(self.path)
        
        # Remove query string
        if '?' in path:
            path = path.split('?')[0]
        
        # If path ends with /, try index.html
        if path.endswith('/'):
            index_path = os.path.join(DIRECTORY, path.lstrip('/'), 'index.html')
            if os.path.isfile(index_path):
                self.path = path + 'index.html'
                return super().do_GET()
        
        # If path has no extension and doesn't exist, try .html
        if not os.path.splitext(path)[1]:  # No extension
            file_path = os.path.join(DIRECTORY, path.lstrip('/'))
            if not os.path.exists(file_path):
                # Try adding .html
                html_path = file_path + '.html'
                if os.path.isfile(html_path):
                    self.path = path + '.html'
                    return super().do_GET()
        
        return super().do_GET()

def main():
    # Check if build directory exists
    if not os.path.exists(DIRECTORY):
        print(f"❌ Error: '{DIRECTORY}' directory not found!")
        print(f"Please run 'npm run build' first.")
        sys.exit(1)
    
    with socketserver.TCPServer(("", PORT), CleanURLHandler) as httpd:
        print(f"\n{'='*60}")
        print(f"🚀 Development Server with Clean URL Support")
        print(f"{'='*60}")
        print(f"\n📂 Serving: {os.path.abspath(DIRECTORY)}")
        print(f"🌐 Server:  http://localhost:{PORT}/")
        print(f"\n✨ Features:")
        print(f"  - Clean URLs: /devices/iphone-viewport-sizes (auto adds .html)")
        print(f"  - Directory index: /devices/ → /devices/index.html")
        print(f"  - Static files: Direct access to CSS, JS, images")
        print(f"\n📋 Test URLs:")
        print(f"  - http://localhost:{PORT}/")
        print(f"  - http://localhost:{PORT}/zh/")
        print(f"  - http://localhost:{PORT}/devices/iphone-viewport-sizes")
        print(f"  - http://localhost:{PORT}/devices/compare")
        print(f"\n⏹️  Press Ctrl+C to stop the server\n")
        print(f"{'='*60}\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n✅ Server stopped.")
            sys.exit(0)

if __name__ == "__main__":
    main()
