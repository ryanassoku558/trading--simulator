import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Sprout Trading | Market Education & Paper Trading",
  description:
    "Learn trading with $10,000 in virtual cash. Educational simulation only.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body><script dangerouslySetInnerHTML={{__html: `try{const t=localStorage.getItem('sprout-theme');document.documentElement.dataset.theme=t==='dark'||t==='light'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}catch{document.documentElement.dataset.theme='light';}`}} />{children}</body>
    </html>
  );
}
