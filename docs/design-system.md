# Sprout design system

Sprout leads with learning. The six core destinations are Home, Learn, Modules, Glossary, Simulator, and Progress. Tools, videos, practice labs, community, billing, and account controls live in secondary menus. Keep the same destinations in the fixed mobile navigation.

## Foundation

Use `app/design-system.css` tokens: spacing 4/8/12/16/20/24/32px; type 12px metadata, 14px supporting copy, 16px body, 20px section title, 24px lesson title, responsive 26–36px page heading. Use charcoal for primary copy, muted color for secondary copy, and green for actions and earned progress. All colors inherit the existing light/dark theme variables. Use 8px controls, 12px sub-panels, 16px cards, subtle card shadows, and a consistent visible focus ring. Icons are Lucide, normally 16–20px, decorative unless they convey information.

## Reusable patterns

`LearningUI` exports Panel, ProgressMeter, and StudyBlock. `LearningPathSteps` shares the four-step onboarding path. `LearningSignals` shares streak, XP, and completion indicators; `PracticeGoals` shares educational simulator goals. Use one primary action per page or workflow. Keep secondary explanations collapsed. Paginate libraries rather than appending unbounded lists. Reuse existing Dialog for detail, authentication, and focused learning.

## Lesson hierarchy

Every lesson has its title and short relevance statement, then Concepts → Examples → Practice & summary. Underlined glossary terms open definitions and worked examples without losing lesson context. Optional videos and sources remain collapsed. Module presentations use the same content panels within each lesson. Quizzes remain five questions with an 80% pass threshold; the footer keeps the next action accessible. Completion writes through the existing account adapter, preserving Supabase progress and celebration rewards.

## Retention

Show subtle factual streak/XP indicators on Home. Progress groups achievements separately from habits and practice goals. Only earned accessible badges count; never invent learning progress. Practice goals emphasize understanding and reflection instead of profitable trading or excessive trading frequency. Calendar reminders are opt-in downloads: the user must import the file, and can edit or remove the recurring event in their calendar. No automated email or push infrastructure is implied.

## Layout checks

At 1440×900 and 390×844, hero, quick access, and next lesson should be available near the top. Navigation stays visible while scrolling. Avoid horizontal overflow; use two-column collapsible paths on mobile and reserve space for its bottom navigation. Larger resources, charts, and lesson details may scroll inside their own contextual workflow rather than stacking on the homepage.
