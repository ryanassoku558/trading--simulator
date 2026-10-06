import type { Metadata } from "next";
import "./globals.css";
import SproutyHelp from "@/components/SproutyHelp";
export const metadata: Metadata = {
  title: "Sprout Trading | Trading & Personal Finance Education",
  description:
    "Learn trading and personal finance with clear lessons, visual practice, and $10,000 in virtual cash. Start learning now; no real deposit required.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><script dangerouslySetInnerHTML={{__html: `try{const t=localStorage.getItem('sprout-theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}catch{document.documentElement.dataset.theme='light';}`}} />{children}<SproutyHelp/></body>
    </html>
  );
}
