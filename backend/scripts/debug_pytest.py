import os
import sys

import debugpy
import pytest

host = os.getenv("DEBUGPY_HOST", "0.0.0.0")
port = int(os.getenv("DEBUGPY_PORT", "5679"))

debugpy.listen((host, port))
print("DEBUGPY_LISTENING", flush=True)
debugpy.wait_for_client()

args = sys.argv[1:] or ["-vv", "-x"]
raise SystemExit(pytest.main(args))
