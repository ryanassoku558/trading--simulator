import Image from "next/image";
import Logo from "./Logo";
export default function LoadingBrand({
  message = "Preparing your practice space…",
  compact = false,
}: {
  message?: string;
  compact?: boolean;
}) {
  return (
    <section className={`loading-brand ${compact ? "compact" : ""}`} role="status" aria-live="polite">
      <div className="loading-emblem" aria-hidden="true">
        <div className="loading-orbit"><span /><span /><span /></div>
        <div className="loading-ring" />
        <div className="loading-seed"><Image src="/mascot/sprouty.png" width={112} height={112} alt=""/></div>
      </div>
      <Logo />
      <p className="loading-message">{message}</p>
      <div className="loading-progress" aria-hidden="true"><span /></div>
      {!compact && <span className="loading-tagline">Small steps. Stronger understanding.</span>}
    </section>
  );
}
