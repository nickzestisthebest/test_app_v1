#!/bin/bash
# runs every browser test in parallel and writes a summary to runall.out
cd "$(dirname "$0")"; mkdir -p tout; rm -f tout/*.txt
ls t*.py | grep -v "bak\|tabs_patch\|tree_patch\|tflash\|tlogin\|tstreak" | xargs -P 6 -I{} sh -c 'timeout 900 python3 {} > tout/{}.txt 2>&1; echo "rc=$?" >> tout/{}.txt'
for f in tout/*.txt; do n=$(grep -c "^FAIL" $f); e=$(grep -c "Traceback\|rc=124" $f); s=$(grep -E "^[0-9]+ / [0-9]+" $f | tail -1); echo "$(basename $f .py.txt) fails=$n err=$e $s"; done > runall.out
grep -v "fails=0 err=0" runall.out
