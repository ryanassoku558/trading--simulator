import type { Metadata } from "next";
import "./globals.css";
import "./design-system.css";
import "./motion.css";
import "./academy.css";
import SubscriptionProvider from "@/components/Subscription";
import SproutyHelp from "@/components/SproutyHelp";
export const metadata: Metadata = {
  title: "Sprout | Financial Education, Study & Trading Practice",
  description:
    "A guided financial learning journey for individuals, schools and educators. Explore lessons, study cards, live quizzes, classroom session plans and virtual trading practice.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><script dangerouslySetInnerHTML={{__html: `try{const t=localStorage.getItem('sprout-theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}catch{document.documentElement.dataset.theme='light';}`}} /><SubscriptionProvider>{children}<SproutyHelp/></SubscriptionProvider></body>
    </html>
  );
}
