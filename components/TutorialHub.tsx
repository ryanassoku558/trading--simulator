"use client";
import { useState } from "react";
import OnboardingTutorials from "./OnboardingTutorials";
import TutorialLibrary from "./TutorialLibrary";
export default function TutorialHub() {
  const [section, setSection] = useState("Getting started");
  return (
    <div className="tutorial-hub">
      <div
        className="learning-sections"
        role="group"
        aria-label="Tutorial categories"
      >
        {["Getting started", "Trading & finance"].map((s) => (
          <button
            key={s}
            aria-pressed={section === s}
            onClick={() => setSection(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="motion-surface" key={section}>
        {section === "Getting started" ? (
          <OnboardingTutorials />
        ) : (
          <TutorialLibrary />
        )}
      </div>
    </div>
  );
}
