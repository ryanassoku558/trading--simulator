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
  const [selected, setSelected] = useState<string | null>(null),
    [category, setCategory] = useState("All sections"),
    [page, setPage] = useState(0);
  const matching = tutorials.filter(
      (t) => category === "All sections" || t.category === category,
    ),
    shown = matching.slice(page * 6, page * 6 + 6);
  return (
    <section className="onboarding-library">
      <div className="compact-section-heading">
        <div>
          <h2>Watch real clicks. Follow along.</h2>
          <p className="ds-description">
            {tutorials.length} recorded interface walkthroughs with narration
            and captions. All guides are free; Pro features shown still require
            Pro to use.
          </p>
        </div>
      </div>
      <label className="walkthrough-filter">
        Section
        <select
          aria-label="Walkthrough section"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
        >
          {["All sections", ...new Set(tutorials.map((t) => t.category))].map(
            (c) => (
              <option key={c}>{c}</option>
            ),
          )}
        </select>
      </label>
      <div className="onboarding-video-grid">
        {shown.map((t) => (
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
                {t.category.toUpperCase()} · {t.duration}s · SCREEN RECORDING
              </small>
              <strong>{t.title}</strong>
            </span>
          </button>
        ))}
      </div>
      <nav className="compact-pagination" aria-label="Walkthrough pages">
        <button
          className="secondary"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span>
          Page {page + 1} of {Math.max(1, Math.ceil(matching.length / 6))}
        </span>
        <button
          className="secondary"
          disabled={(page + 1) * 6 >= matching.length}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </nav>
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
