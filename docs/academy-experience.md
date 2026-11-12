# Sprout Academy experience

The interface now treats Sprout as a learning platform for individual learners, schools and facilitated groups. The original 41 modules, 159 lessons, lesson quizzes, saved learning state, accounts, subscription checks, practice tools and live-room service remain in use.

## Learner journey

Home presents the recommended next lesson and module progress, then connects the learner to guided study, revision, live games and simulated application. The primary navigation includes Classrooms, Play & study and Glossary. Learn has been removed from desktop and mobile navigation, while lesson URLs, the module catalog, and assignment lesson links remain available. Curriculum search in the learning workspace opens a filtered lesson catalog; market search remains available in the simulator. Catalog links can filter by a displayed module's actual title.

The learning overview includes a foundation journey through the five Starter chapters, with completed/current/upcoming states from actual lesson completion. Learners can continue into the complete 41-module catalog. Module covers use decorative illustrations while access, completion and quizzes retain their original logic. Opening Lessons browses the catalog; opening an individual lesson still starts its presentation and five-question check.

Study modes support direct URLs (`/play?mode=Study%20cards`, `/play?mode=Live%20quiz`, and `/play?mode=Practice%20quest`). Existing room links and host drafts remain compatible.

## Educator resource

`/classrooms?view=resources` provides a module-based session planner inside Classrooms. The old `/educators` URL redirects here. Classrooms switches between Classes & assignments and Educator resources; the separate educator navigation entry has been removed. Educators choose any curriculum module and a 10–180 minute session. The five stages—introduce, explore/review, check understanding, apply and reflect—divide the chosen time exactly. The plan includes the module's lessons, learning intention, real lesson rationale and exit-ticket prompts. The optional facilitator answer reference uses original lesson quiz keys.

Educators can print the plan and copy a module link, and open the lesson catalog, live-game builder or guided simulator. The connected Classrooms workspace now supports invite-code enrollment, assignments, learner reports and teacher feedback; see [classroom-journey.md](classroom-journey.md). Institutional billing and LMS integrations are outside this feature. Learner subscription access remains enforced by the existing lesson flow.

## Simulator

The workspace takes account/portfolio/chart/order organization cues from educational trading platforms such as StockTrak. The existing Lightweight Charts implementation now supports financial chart horizons (1D, 1W, 1M, 3M, 1Y) with matching candle intervals and bar counts. The most recent close stays aligned with the simulated execution quote. User zoom is not reset by each price tick. A separate generated-activity pane is available, alongside the existing Pro indicators, drawing tools, risk planning, replay and chart tour.

The practice-account overview shows actual virtual cash, holdings value, return and open-order counts from saved state. Account controls, the simulated top-mover ticker and practice modes are in a disclosure below the main workspace so the chart can stay central. Market search, data-view selection and horizontally scrolling asset shortcuts share a compact discovery area. Research, portfolio, trade history, order review, virtual fills and guided trade tutorials remain available. Prices and activity remain generated practice data, with explicit labels; there is no StockTrak affiliation, data feed, brokerage connection or real-money execution.

## Presentation and accessibility

`app/academy.css` provides the shared visual layer: learning covers, study-mode cards, session illustrations, chapter progression, responsive layout and a consistent type/spacing system. Mobile navigation shows the five main destinations; the side menu keeps all resources. Dark theme, reduced-motion preferences, keyboard focus and the original compact quiz dialogs are retained. The session plan has a dedicated print layout, with page-entry animation disabled and print colors independent of the website theme.

Verification covers original curriculum counts, lesson completion and next-module behavior, live rooms and drafts, account/trading flows, chart horizons, Starter/Pro chart tools, curriculum search, classroom planner timing, clipboard links, optional answers, print invocation and phone layouts. Unit tests additionally check chronological chart data and execution-quote alignment for every horizon.

Validation: 117 unit/API/database checks passed. The browser suite covered 20 redesigned/existing flows, with an additional fractional crypto/commodity trade check. Desktop and phone screenshots were reviewed in light and dark modes. A real A4 session-plan PDF was generated and inspected, in addition to testing the print action and print-media DOM.
