from __future__ import annotations

import sys
import time
import traceback

from launcher.launcher import Launcher
from launcher.logger import failure, info, success


VERSION = "0.1.0"


def main() -> int:

    start = time.perf_counter()

    info(f"Royal64 Launcher v{VERSION}")

    launcher = Launcher()

    try:

        launcher.start()

        return 0

    except KeyboardInterrupt:

        info("Interrupted by user.")

        launcher.stop()

        return 0

    except Exception as exc:

        failure(f"Unhandled exception: {exc}")

        traceback.print_exc()

        try:
            launcher.stop()
        except Exception:
            pass

        return 1

    finally:

        elapsed = time.perf_counter() - start

        success(f"Launcher finished in {elapsed:.2f}s")


if __name__ == "__main__":
    sys.exit(main())