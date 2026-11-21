# ctzn

Know who is in charge of your area, report problems with a photo and a pin, and track fixes.

## Run it on your computer

You need Node.js 18.18 or newer (https://nodejs.org).

```bash
cd ctzn-app
npm install
npm run dev
```

Open http://localhost:3000. To try it on your phone, connect the phone to the same Wi-Fi and open `http://<your computer's IP>:3000`. Note: phone browsers only share GPS location on https or localhost, so "Use my location" will work on the computer now and on the phone once the app is deployed.

Without any setup the app runs on sample data and saves your reports in the browser.

## Connect Supabase (real database and photo storage)

1. In Supabase, open your project, go to SQL Editor, paste the contents of `supabase/schema.sql`, and run it.
2. Copy `.env.local.example` to `.env.local`.
3. Fill in the two values from Supabase (Project Settings, then API): the Project URL and the anon public key.
4. Stop and restart `npm run dev`.

Reports and photos now save to Supabase and show up for everyone.

## What is in this round

Elected-official profiles now include sourced background, dated record items, explicit source types and gaps in coverage. Newspaper interviews and republished speeches remain labelled as the politician's own account. First reading is distinguished from enactment, and ctzn does not score politicians or advise votes. Local sourced suggestions/corrections stay unreviewed and separate from the published record. Editorial rules and the Lateef Ashimi chairman correction are documented in `docs/editorial-policy.md`.

Run profile-data and source-validation checks with `node --test tests/official-records.mjs`.

The Learn screen and relevant elected-official profiles also explain how policy choices can affect everyday spending and services: petrol subsidies, exchange rates, student loans, road contracts, waste collection and hospital bills. Each explainer separates the decision, household effects, possible benefits, trade-offs, illustrative examples and what a source actually establishes. Numerical examples are hypothetical, not current fares or currency quotes. This content stays in the local app and does not score politicians or infer personal policy attribution from their office.

- **Leaders:** allocation, local offices, chain of command from President to councillor, ministers, the Senate.
- **Report:** optional photo, category, description, confirmed state/LGA, pin, responsibility chain and complaint draft. Failed database writes are labelled device-only.
- **Consumer rights:** step-by-step plan for bad products and services, with regulators and free legal help.
- **Map:** Google Maps issue overview with category/status/search filters, issue profiles and Google Maps/Street View location links. Samples are hidden unless enabled. The in-app Google map requires the configured key.
- **Learn:** short lessons and one-time quizzes about waste oversight, road contracts and evaluating evidence.
- **Project evidence:** source intake for award references, alleged contractors, procuring authorities, dated progress claims, news/video/social links and timestamps. All contributor submissions are unreviewed. No contractor or abandonment is inferred from a report alone.
- **Fact check:** news with verdicts and reasons, guessing game, claim submission.
- **Play:** quiz, mapping tasks, office scoreboard, badges, leaderboard.
- **Languages:** English complete. Pidgin, Yoruba, Hausa and Igbo cover the main labels only (the last three are drafts awaiting native-speaker review).

## What is still sample data or not built yet

- Officials, offices and allocation are real but cover **Shomolu, Lagos only**. Other areas need their own data.
- Reports marked `sample: true` in `lib/data.js`, the office scoreboard and the area leaderboard are **sample numbers**.
- Contributor accounts use email and password when Supabase is connected. Points live in the browser. The manual review queue covers claim tips, official-record suggestions and project evidence. Issue reports use the existing Map workflow.
- There is no automatic complaint email delivery service configured. The email action opens a real draft in the user's email client, and does not claim sending or delivery. Verified complaint inbox coverage currently includes LAWMA in Lagos; unknown recipients are never guessed.

Automatic email delivery is intentionally deferred until a sender domain/account can be verified. The next implementation should provision a free-tier email service, use server-side credentials, accept only verified agency inboxes, validate report ownership, and record provider acceptance separately from delivery or agency acknowledgement. No automatic emails are sent by the current app.
- Mapping tasks and legacy claim drafts are stored on the device.
- No automatic face or number plate blurring yet.

## Where things live

### Google Maps and Street View for reporting

Reporters can open the selected report pin in Google Maps or Street View without an API key. To enable the interactive Google map inside the reporting screen:

1. Create a Google Cloud project with billing and enable **Maps JavaScript API**.
2. Create a browser API key restricted to Maps JavaScript API and your website HTTP referrers (include `http://localhost:3000/*` for local development and your deployed domain).
3. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local` (see `.env.local.example`). Restart development or rebuild/redeploy production after changing this value.

With a key, reporters can click the Google map to place their report pin, switch map layers, and inspect Street View within 50 metres where imagery exists. The panorama does not change the report pin. OpenStreetMap remains selectable and is used if Google cannot load. An absent key uses OpenStreetMap with Google Maps/Street View links. Street View is historical imagery, not current report evidence; the photo upload remains part of reporting.

The Map tab uses Google Maps only. If its key is missing or loading fails, it keeps the searchable issue list and external location links available rather than displaying a different map provider. Google Cloud billing must be enabled for the JavaScript API; usage may incur charges, so configure a budget and API restrictions before launch.

ctzn currently runs locally with its database connection disabled in `.env.local`, at the user's request. Reports, existing drafts and learning progress are saved in this browser's storage. Contributor sign-up and submissions need a connected Supabase project. Map, news and optional location services still make external requests when used.

Isolated tables (`public.ctzn_reports`, `public.ctzn_report_evidence`) and the `ctzn-report-photos` bucket were previously prepared in the existing **minidraft** Supabase project. They are not connected to the local app, and existing minidraft tables were not changed. The definitions remain in `supabase/schema.sql` for optional future use; old unprefixed round-one tables are not used or migrated automatically.

The report photo bucket accepts JPEG, PNG and WebP images up to 10 MB. The app shows report publication failures as device-only and supports manually refreshing the shared report list.

### Turn on contributor accounts and manual review

1. In the chosen Supabase project, apply `supabase/schema.sql` if the base ctzn tables are missing, then apply `supabase/contributor-review.sql`. The review migration also retires the old public evidence intake and limits visibility of existing evidence to verified entries.
2. Enable public email/password sign-up in Supabase Auth. Configure email confirmation, add the app origin and any development origins to the redirect allowlist, and use a configured SMTP sender for public sign-ups. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` and rebuild the app.
3. Review submissions in the Supabase dashboard's Table Editor. Open `public.ctzn_contributions`, filter `review_status` to `pending`, and review each row's `kind`, `subject` and `details`. Set `review_status` to `approved` or `rejected`. Contributors can see the result in **Account**. To publish approved material, add the reviewed content to the relevant editorial record separately.

New submissions start private and pending. Contributors can read their own submissions and only project editors can change the review status. Email confirmation checks access to the email address. Contributor verification is deferred.

Recent street coverage is fetched on request through `/api/project-coverage`, from Google News RSS, filtered to the last 30 days and cached for one hour. Search results remain leads until the project location/contract is matched. GST and unindexed video/social links can be attached manually. The app does not scrape social accounts or treat popularity as verification.

Run all current checks with `node --test tests/accountability.mjs tests/google-maps.mjs tests/representatives.mjs tests/report-storage.mjs`.

Google setup: https://developers.google.com/maps/documentation/javascript/get-api-key

Run map link and loader checks with `node --test tests/google-maps.mjs`.

The Leaders tab asks for a state, LGA and optional mapped ward. GPS is optional and uses BigDataCloud's client-side reverse geocoder; users confirm their electoral area manually. Only the confirmed area is saved in browser storage, not GPS coordinates. Matching currently covers national officials, the Lagos governor, Shomolu LGA and its mapped Ward F. Other areas show an explicit coverage message.

Expanded profiles show existing office/contact records and recent Google News headlines through `/api/official-news?id=…`. News loads on opening a profile, is cached for an hour, and is filtered to the past 30 days. The feed can be unavailable; the profile provides retry and external news search options. This feature needs a Next.js server, not static-only hosting.

Run the area-matching and news-filter checks with `node --test tests/representatives.mjs`.

- `lib/data.js`: all content (officials, categories, news, legal steps). Edit text here.
- `lib/i18n.js`: interface translations.
- `lib/routing.js`: who is responsible for which problem, and the road lookup.
- `lib/store.js`: points, reports and saved state.
- `lib/supabase.js`: database calls.
- `components/`: one file per screen.
#   c t z n  
 