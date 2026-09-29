"""Serve Al-Tayer Admin Dashboard and open the browser."""
from __future__ import annotations

import pathlib
import socket
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = pathlib.Path(__file__).resolve().parent
PREFERRED_PORTS = (8080, 5173, 5500, 3000, 8888)


def pick_port() -> int:
    for port in PREFERRED_PORTS:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    raise RuntimeError("No free port found in preferred list")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        print(f"[al-tayer] {self.address_string()} - {fmt % args}")


def main() -> None:
    port = pick_port()
    url = f"http://127.0.0.1:{port}/"
    (ROOT / "_run-status.txt").write_text(f"serving={url}\n", encoding="utf-8")

    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print("=" * 48)
    print("  Al-Tayer Admin Dashboard")
    print(f"  {url}")
    print("  Press Ctrl+C to stop")
    print("=" * 48)

    threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
