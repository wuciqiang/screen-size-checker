#!/usr/bin/env python3
"""Development server with clean URL support and explicit request logging."""

from __future__ import annotations

import http.server
import logging
import socketserver
import sys
from datetime import datetime
from pathlib import Path
from urllib.parse import unquote, urlsplit

PORT = 1868
DIRECTORY = "multilang-build"


def configure_logging() -> logging.Logger:
    """Configure a concise logger that always writes to stdout."""
    logger = logging.getLogger("dev-server")
    logger.setLevel(logging.INFO)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.INFO)
    handler.setFormatter(
        logging.Formatter("[%(asctime)s] %(levelname)s %(message)s", "%H:%M:%S")
    )

    logger.handlers.clear()
    logger.addHandler(handler)
    logger.propagate = False
    return logger


LOGGER = configure_logging()


class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler that supports clean URLs by automatically appending .html."""

    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "application/javascript",
        ".mjs": "application/javascript",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, fmt: str, *args) -> None:  # noqa: A003
        # Surface default request logs in a clearer format.
        LOGGER.info("%s - %s", self.client_address[0], fmt % args)

    def _resolve_clean_url(self, request_path: str) -> str:
        """Return rewritten path for clean URL resolution, or the original path."""
        decoded_path = unquote(urlsplit(request_path).path)

        # Root path should be handled by default behavior.
        if decoded_path == "/":
            return decoded_path

        # Try /path/ -> /path/index.html
        if decoded_path.endswith("/"):
            index_path = Path(DIRECTORY) / decoded_path.lstrip("/") / "index.html"
            if index_path.is_file():
                return f"{decoded_path}index.html"

        # Try /path -> /path.html when no extension and file not found.
        path_obj = Path(decoded_path)
        if path_obj.suffix:
            return decoded_path

        target = Path(DIRECTORY) / decoded_path.lstrip("/")
        if target.exists():
            return decoded_path

        html_target = target.with_suffix(".html")
        if html_target.is_file():
            return f"{decoded_path}.html"

        return decoded_path

    def do_GET(self) -> None:  # noqa: N802
        original = self.path
        rewritten = self._resolve_clean_url(self.path)
        self.path = rewritten

        if rewritten != unquote(urlsplit(original).path):
            LOGGER.info('rewrite GET "%s" -> "%s"', original, rewritten)

        return super().do_GET()


class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    """Threaded TCP server for better local development experience."""

    allow_reuse_address = True
    daemon_threads = True


def main() -> None:
    build_dir = Path(DIRECTORY)
    if not build_dir.exists():
        LOGGER.error("Build directory not found: %s", build_dir.resolve())
        LOGGER.error("Please run: npm run build")
        sys.exit(1)

    with ThreadingTCPServer(("", PORT), CleanURLHandler) as httpd:
        LOGGER.info("=" * 60)
        LOGGER.info("Dev server started")
        LOGGER.info("Serving directory: %s", build_dir.resolve())
        LOGGER.info("URL: http://localhost:%s/", PORT)
        LOGGER.info("Clean URL mode: enabled")
        LOGGER.info("Started at: %s", datetime.now().isoformat(timespec="seconds"))
        LOGGER.info("Press Ctrl+C to stop")
        LOGGER.info("=" * 60)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            LOGGER.info("Server stopped")


if __name__ == "__main__":
    main()
