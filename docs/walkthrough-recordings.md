# Interface walkthrough recordings

The tutorial library uses actual browser recordings of Sprout's interface, with visible pointer movement, neural narration, sentence-aligned English captions, and a readable transcript. The platform guides cover navigation, lessons, modules, glossary games, simulator buys and sells, chart tools, all four calculators, practice labs, portfolio, history, journal, community, profile, settings, pricing, and the tutorial library.

Record only a local production preview. `scripts/record-walkthroughs.mjs` rejects non-local hosts, intercepts external requests, and supplies disposable demo data. It never creates a real account, posts to community, or places real orders. Pro interfaces are labeled as demonstrations. The simulator recording checks that both virtual fills occurred and the purchased holding was sold.

1. Run the production build and start a fresh local server. Do not rebuild while recording.
2. Generate narration with `scripts/narrate-tutorials.py` for both JSON catalogues, using the documented Joe voice in `scripts/voices/README.md`.
3. Export current lesson IDs/titles to `/tmp/sprout-lesson-data.json` for the recorder's lesson search actions.
4. Set `WALKTHROUGH_BASE_URL` to the local server and `TUTORIAL_NARRATION_DIR` to the generated audio directory. Run `node scripts/record-walkthroughs.mjs`, optionally followed by specific tutorial slugs.
5. Inspect the recording proof JSON files and representative frames. Rebuild after the recorder updates durations, then run the media playback/caption browser checks.

Generated MP4, WebP, and WebVTT files live in `public/tutorials`. Publishing metadata without its matching recordings or captions will break guides; keep these assets together. A recording failure must be corrected and rerun before publication.
