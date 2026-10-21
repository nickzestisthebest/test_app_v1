#!/bin/bash
# rebuild the app from the patch chain, then the installable copy and the server's prompt list
set -e
cd "$(dirname "$0")/../../sprout"
python3 mk3.py && python3 mk4.py && python3 mk5.py && python3 mktest.py
cd ../sprout_live
python3 tools/build_pwa.py && node tools/gen_prompts.mjs && node tools/build_pages.mjs && node tools/build_pages.mjs artifact
