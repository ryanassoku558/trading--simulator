"use client";
import { useState } from "react";
import { Play, Video } from "lucide-react";
import tutorials from "@/lib/education/onboarding-tutorials.json";
import Dialog from "./Dialog";
export function OnboardingVideo({ slug }: { slug: string }) {
  const tutorial = tutorials.find((t) => t.slug === slug);
  if (!tutorial) return null;
  return (
    <section
      className="tutorial-player"
      aria-label={`${tutorial.title} onboarding video`}
    >
      <p className="small">
        {tutorial.duration} seconds · narrated · English captions
      </p>
      <video
        controls
        playsInline
        preload="none"
        poster={`/tutorials/${slug}.webp`}
        aria-label={tutorial.title}
      >
        <source
          src={`/tutorials/${slug}.mp4?v=${tutorial.narrationVersion}`}
          type="video/mp4"
        />
        <track
          kind="captions"
          src={`/tutorials/${slug}.vtt?v=${tutorial.narrationVersion}`}
          srcLang="en"
          label="English"
          default
        />
      </video>
      <details>
        <summary>Read transcript</summary>
        {tutorial.scenes.map((s) => (
          <p key={s.title}>
            <strong>{s.title}.</strong> {s.caption}
          </p>
        ))}
      </details>
    </section>
  );
}
export function VideoHelp({
  slug,
  label = "Watch a quick guide",
}: {
  slug: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const tutorial = tutorials.find((t) => t.slug === slug);
  return (
    <>
      <button className="secondary video-help" onClick={() => setOpen(true)}>
        <Video size={16} />
        {label}
      </button>
      {open && tutorial && (
        <Dialog title={tutorial.title} onClose={() => setOpen(false)}>
          <OnboardingVideo slug={slug} />
        </Dialog>
      )}
    </>
  );
}
export default function OnboardingTutorials() {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <section className="onboarding-library">
      <div className="compact-section-heading">
        <div>
          <h2>A quick tour, at your pace</h2>
          <p className="ds-description">
            Five short guides to using Sprout. Free for everyone.
          </p>
        </div>
      </div>
      <div className="onboarding-video-grid">
        {tutorials.map((t, i) => (
          <button
            className="card onboarding-video-card"
            key={t.slug}
            onClick={() => setSelected(t.slug)}
          >
            <span className="onboarding-play">
              <Play size={18} />
            </span>
            <span>
              <small>
                GUIDE {i + 1} · {t.duration}s
              </small>
              <strong>{t.title}</strong>
            </span>
          </button>
        ))}
      </div>
      {selected && (
        <Dialog
          title={tutorials.find((t) => t.slug === selected)!.title}
          onClose={() => setSelected(null)}
        >
          <OnboardingVideo slug={selected} />
        </Dialog>
      )}
    </section>
  );
}
