#!/bin/sh
# Full website build, in order
set -e
cp bonsai_site.pre_anim.html bonsai_site.html
python3 anim_patch.py
python3 scan_site.py
cp bonsai_site.html bonsai_site.pre_upd.html
python3 upd_patch.py
python3 phone_patch.py
python3 tier_patch.py
python3 logo_patch.py
python3 site_fix.py
python3 site_fix2.py
python3 site_fix3.py
python3 site_cal_patch.py
