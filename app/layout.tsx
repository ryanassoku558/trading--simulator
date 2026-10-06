import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Sprout Trading | Market Education & Paper Trading",
  description:
    "Learn trading with $10,000 in virtual cash. Educational simulation only.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
