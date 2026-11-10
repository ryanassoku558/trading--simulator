import type { ReactNode } from "react";
export function Panel({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`card ds-panel ${className}`}>
      {title && <h2>{title}</h2>}
      {description && <p className="ds-description">{description}</p>}
      {children}
    </section>
  );
}
export function ProgressMeter({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  return (
    <div className="ds-progress">
      <div>
        <span>{label}</span>
        <strong>
          {value}/{max}
        </strong>
      </div>
      <progress value={value} max={max || 1} aria-label={label} />
    </div>
  );
}
export function StudyBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="ds-study-block">
      <h4>{title}</h4>
      {children}
    </section>
  );
}
