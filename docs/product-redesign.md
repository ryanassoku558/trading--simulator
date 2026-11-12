# Sprout Trading product redesign

The original navy/slate colors have been restored, and headline emphasis no longer uses colored highlights or gradient text. The scrolling simulated-stock ticker is visible under the header on the public homepage and throughout the workspace.

Classrooms provides audience entry points for teachers/students/families and schools/districts. The school overview shows real enrollment and assignment totals across the signed-in account’s own classes; it does not imply cross-account administrator access.

The existing Next/React application, Supabase authentication and private classroom service, account persistence, Pro checks and trading engine remain in place. The redesign adds a shared presentation layer in `app/product.css`; it does not replace curriculum content or store a new version of account data.

## Visual system

The original cool neutral surfaces and navy/slate palette are restored. Headline emphasis uses solid inherited text color rather than accent highlights or gradient text. A self-hosted Manrope variable font provides consistent typography without a runtime font-service connection; its OFL license ships beside the font. Controls use consistent borders, focus rings, pressed/selected states and touch target sizing. Supporting blue and amber tones distinguish study modes without becoming the primary brand. Dark mode uses forest surfaces, readable text and the same emerald hierarchy.

The public homepage explains the product and prioritizes free account creation and sign-in. It reuses the full About page, including its mission, educational pillars and clearly labeled example figures. Guest practice remains available through an explicit action. Signed-in visitors see their dashboard at the home URL. Account dialogs open in the chosen sign-in or signup mode while retaining the existing Supabase calls and confirmation flow. Signing in from an existing workspace keeps that page open.

The dashboard pairs an actual virtual-portfolio summary with the next learning session. Value, cash, holdings, return, lesson completion, XP and streak all use the existing saved state and calculation helpers. The equity line uses saved portfolio snapshots plus the current value, with a flat baseline and explanatory caption for a new account. It contains no invented market history or gains. A mobile lesson shortcut keeps the next action visible above the account summary. Existing module steps, study modes and milestones continue below.

The shared system covers the portfolio, simulator account strip and order ticket, lesson library, quiz dialogs, study modes, achievements, classroom forms, reports and session planner. Density and typography are adjusted to foreground the working chart and course content. Generated prices and virtual-account labels remain visible.

## Navigation

Portfolio is available directly in the desktop navigation. Learn and Today are absent from desktop/mobile navigation; lessons remain accessible from modules, dashboard actions and assignments. The mobile bar provides Home, Classrooms, Play & study, Simulator and Progress. Educator resources are a section inside Classrooms rather than a separate navigation destination. Old `/educators` URLs redirect to `/classrooms?view=resources`; `/today` redirects to Classrooms.

## Chart tour

`ChartTourSpotlight` renders a dimmed overlay with a transparent cutout over the actual control or chart. The highlighted element remains usable; clicks outside it are blocked. The coach moves beside the highlight when room permits and above/below it on small screens. Scroll/resize observers maintain alignment, and fullscreen moves the portal into the fullscreen chart workspace.

The ring pulses briefly, with animation disabled for reduced motion. Keyboard users can move between the highlighted controls and tour actions, go backward, exit with Escape outside browser fullscreen, and return focus to the start button. The existing 16 steps, free eight-step limit and Pro tools remain enforced. Upgrading closes the tour before opening its dialog.

## Verification scope

Validation includes a production build, the existing unit/API/database suite and browser flows for course completion, bounded quizzes, live games, independent classroom accounts, chart controls, virtual trades, dark mode and mobile navigation. Additional browser checks exercise the actual highlighted controls, responsive tour placement, previous-step navigation, reduced motion and focus restoration. Screenshots are captured from the actual application; any prepared review account is local test data, never a claimed customer portfolio.

Release validation: the production build passed, along with 126 unit/API/database tests and all 26 selected browser scenarios. Manual browser review covered 28 combinations of desktop/tablet/phone workspace views and 16 additional public-homepage/dashboard combinations with no document overflow. The tour was also exercised in actual browser fullscreen, with no page errors reported during that review. Account-creation UI tests intercepted Supabase Auth and did not send email or create production accounts.
