#!/usr/bin/env python
import asyncio
import sys
import os
from pathlib import Path

# Add the parent directory to the sys path
current_dir = Path(__file__).parent
backend_dir = current_dir.parent.parent
if str(backend_dir) not in sys.path:
    sys.path.append(str(backend_dir))

# Set the working directory to backend dir for proper path resolution
os.chdir(backend_dir)

from app.scripts.smart_scraper import run_smart_scraper

if __name__ == "__main__":
    print("Running smart scraper to fetch and update events...")
    asyncio.run(run_smart_scraper()) 