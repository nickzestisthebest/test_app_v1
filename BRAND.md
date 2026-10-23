# Renaming the app

The app's name and look live in one file: `sprout_live/brand.json`. Storage keys inside the app stay the same, so renaming never loses anyone's data.

## Rename in 5 steps
1. Open `sprout_live/brand.json` and change the values:
   - `name`: the app name, shown everywhere (screens, Plaid's sign-in, notifications, website, Terms, Privacy).
   - `tagline`: the line under the name on the app-switcher cover.
   - `description`: one sentence for the home screen and search results.
   - `domain`: your web address, for example `getfernly.com`.
   - `legalEntity`: your LLC's exact name, as it appears in the Terms.
   - `supportEmail`: the support address shown on the website and legal pages.
   - `themeColor`, `backgroundColor`, `accent` and `accentDark`: brand colors. The accents are the main buttons and highlights in light and dark mode.
   - `iconFile`: the square 1024 × 1024 PNG used for the app icon. Replace `tools/icon_1024.png` or point this at a new file.
2. Rebuild everything with `bash sprout_live/tools/rebuild.sh`.
3. Rebuild the website with `cd site && sh build_site.sh && cd ../sprout_live && node tools/build_pages.mjs artifact`. The website's screenshots still show the old name until they're retaken.
4. Update the name outside the code:
   - In Vercel, set `APP_NAME` (if you set it) and push the rebuilt project.
   - In the Plaid dashboard, change the app name and logo.
   - In App Store Connect, change the listing name.
   - Change the support email.
5. Check your work with `cd sprout && python3 rename_drill.py`. This rename drill builds the app under a made-up name, checks nothing still says "Sprout", then puts your name back.

## The logo
- The app icon comes from `iconFile`.
- The small leaf mark on screens is drawn in code. Send the new logo as an SVG and it can be swapped in one place.

## Name checklist (before you pay for anything)
- [ ] **Trademarks.** Search tmsearch.uspto.gov for the same name and similar-sounding ones in class 9 (app software), class 36 (financial services) and class 42 (online software).
- [ ] **App stores.** Search the App Store and Google Play. App Store names must be unique and 30 characters or less.
- [ ] **Business registry.** Search the Georgia Secretary of State business registry.
- [ ] **Domains.** Check that the .com or .app domain is available.
- [ ] **Social handles.** Check Instagram, TikTok and X.
- [ ] **Distinctiveness.** Avoid names that just describe the product. A made-up or unexpected word is easiest to protect.
- [ ] **Lawyer.** Have a trademark lawyer run a clearance search on your top pick.
- [ ] **Order.** Buy the domain, then form the LLC under the name, then file the trademark if you want one.
