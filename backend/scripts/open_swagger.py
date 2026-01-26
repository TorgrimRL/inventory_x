import os
import shutil
import subprocess
import sys
import time
from urllib.error import URLError
from urllib.parse import urlparse
from urllib.request import urlopen

URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000/api/docs/"

parsed = urlparse(URL)
if parsed.scheme not in {"http", "https"}:
    raise SystemExit(f"Unsupported URL scheme: {parsed.scheme}")


allowed_hosts = {"localhost", "127.0.0.1"}
if parsed.hostname not in allowed_hosts:
    raise SystemExit(f"Refusing to open non-local URL: {URL}")


def _popen_detached(argv: list[str]) -> None:
    subprocess.Popen(  # noqa: S603
        argv,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )


def open_url(url: str) -> None:
    if sys.platform.startswith("linux"):
        exe = shutil.which("xdg-open")
        if exe:
            _popen_detached([exe, url])
            return
    elif sys.platform == "darwin":
        exe = shutil.which("open")
        if exe:
            _popen_detached([exe, url])
            return
    elif os.name == "nt":
        exe = shutil.which("cmd")
        if exe:
            _popen_detached([exe, "/c", "start", "", url])
            return

    _popen_detached([sys.executable, "-m", "webbrowser", url])


timeout_seconds = 15
sleep_seconds = 0.25
deadline = time.time() + timeout_seconds

opened = False
while time.time() < deadline:
    try:
        urlopen(URL, timeout=0.5).read(1)  # noqa: S310
        open_url(URL)
        print(f"Opened: {URL}")
        opened = True
        break
    except (URLError, OSError):
        time.sleep(sleep_seconds)

if not opened:
    print(f"Swagger not reachable after {timeout_seconds}s: {URL}")

raise SystemExit(0)
