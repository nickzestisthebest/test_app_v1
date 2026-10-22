# Sprout source

Everything needed to change Sprout, rebuild it and test it. The folder above this one (`sprout-app`) is what Vercel deploys.

## Layout
- `sprout/`: the app. `sprout_v2_base.html` plus modules (`*.js`, `*.css`) applied in order by the patch chain
  `mk3.py` → `mk4.py` → `mk5.py` (which runs `tabs_patch.py`) → `mktest.py`. New work goes in a module and one step in `tabs_patch.py`.
- `site/`: the marketing website (`bonsai_site.html`) and its pictures.
- `sample/tx.csv`: made-up transactions for the tests. Copy it to `csvin/tx.csv` (next to `sprout/`).

## Rebuild
    cd source/sprout && python3 mk3.py && python3 mk4.py && python3 mk5.py && python3 mktest.py
    cp sprout_v2.html ../../  # not needed: tools/build_pwa.py reads it from ../sprout when run from a full checkout
The full build used by the owner is `sprout-app/tools/rebuild.sh` with `sprout/` and `sprout_live/` side by side.

## Test
    pip install playwright pillow && python3 -m playwright install chromium
    mkdir -p ../csvin && cp ../sample/tx.csv ../csvin/tx.csv
    python3 t65.py   # the newest end-to-end checks
Some tests (t65, t59 and a few older ones) use the owner's own seed files, which are not shared; they are skipped unless you write a seed_real.js of your own in the same shape (see probe_real.py for what it sets).

## Rules the project follows
- No em dashes in anything a person reads.
- Never financial advice: show the math from the person's own data, worded as facts.
- Every number ties out 1 to 1 across screens (`MX.check()` must return an empty list).
- No secrets in the app or in Git. Keys live only in Vercel's environment variables.
- Never commit real bank exports, screenshots or recordings.
