# Sprout preview gallery

28 screenshots and 4 silent walkthrough videos, recorded from the working app. All account balances and trades are simulated.

## Moving previews

The animations below play directly on this page. Each recording also has a full MP4 version.

### From welcome to your first lesson and trade

![Animated walkthrough: From welcome to your first lesson and trade](01-first-steps.gif)

[Full video (MP4)](01-first-steps.mp4)

### Buying, tracking a portfolio, and selling

![Animated walkthrough: Buying, tracking a portfolio, and selling](02-portfolio-trading.gif)

[Full video (MP4)](02-portfolio-trading.mp4)

### Explore stocks, charts, watchlists, and limit orders

![Animated walkthrough: Explore stocks, charts, watchlists, and limit orders](03-market-limit-orders.gif)

[Full video (MP4)](03-market-limit-orders.mp4)

### A complete tour on a phone-sized screen

![Animated walkthrough: A complete tour on a phone-sized screen](04-mobile-tour.gif)

[Full video (MP4)](04-mobile-tour.mp4)

## Desktop screenshots

### Welcome page

![Welcome page](01-landing.png)

### Choose your experience level

![Choose your experience level](02-onboarding.png)

### Beginner welcome and virtual balance

![Beginner welcome and virtual balance](03-welcome.png)

### Five-level learning journey

![Five-level learning journey](04-learning.png)

### What is a stock? lesson

![What is a stock? lesson](05-lesson.png)

### Instant quiz feedback and XP

![Instant quiz feedback and XP](06-quiz-success.png)

### Guided first Apple trade

![Guided first Apple trade](07-guided-trade.png)

### Review a virtual trade

![Review a virtual trade](08-confirmation.png)

### Understand price moves and position size

![Understand price moves and position size](09-explain-trade.png)

### Dashboard after a first trade

![Dashboard after a first trade](10-dashboard.png)

### Three-stock portfolio, returns, and allocation

![Three-stock portfolio, returns, and allocation](11-portfolio.png)

### First Lesson, First Trade, and Portfolio Builder

![First Lesson, First Trade, and Portfolio Builder](12-achievements.png)

### Sell explanation and realized profit

![Sell explanation and realized profit](13-sell-explanation.png)

### Transaction history with reopened explanations

![Transaction history with reopened explanations](14-trade-history.png)

### Ten simulated stocks and funds

![Ten simulated stocks and funds](15-market.png)

### Search by company or ticker

![Search by company or ticker](16-market-search.png)

### Stock details and interactive timeframes

![Stock details and interactive timeframes](17-stock-detail.png)

### Create a pending limit order

![Create a pending limit order](18-limit-order.png)

### Pending limit and cancellation controls

![Pending limit and cancellation controls](19-pending-order.png)

### Limit order filled by simulated market movement

![Limit order filled by simulated market movement](20-filled-order.png)

## Mobile screenshots

Expand a screen below to see the full phone layout.

<details>
<summary>Mobile dashboard</summary>

![Mobile dashboard](21-mobile-dashboard.png)

</details>

<details>
<summary>Mobile navigation drawer</summary>

![Mobile navigation drawer](22-mobile-navigation.png)

</details>

<details>
<summary>Mobile learning journey</summary>

![Mobile learning journey](23-mobile-learning.png)

</details>

<details>
<summary>Responsive market cards</summary>

![Responsive market cards](24-mobile-market.png)

</details>

<details>
<summary>Mobile stock details and trade panel</summary>

![Mobile stock details and trade panel](25-mobile-stock.png)

</details>

<details>
<summary>Mobile portfolio and holdings</summary>

![Mobile portfolio and holdings](26-mobile-portfolio.png)

</details>

<details>
<summary>Beginner Mode and account settings</summary>

![Beginner Mode and account settings](27-mobile-settings.png)

</details>

<details>
<summary>Reset requires confirmation</summary>

![Reset requires confirmation](28-mobile-reset.png)

</details>

## Recreate the previews

These are real browser recordings, not mockups. No application source is changed by the capture script.

Run the app, install FFmpeg for video conversion, then run:

```bash
npm run preview:media
node scripts/build-preview-gallery.mjs
```

The recorder uses a separate demo browser account. It captures actual onboarding, quizzes, order confirmations, filled market and limit orders, holdings, and responsive navigation. The default target is the running app on port 3001; set TEST_BASE_URL for another port. Linux capture uses the installed system FFmpeg binary. On other operating systems, install Playwright Chromium and FFmpeg first.
