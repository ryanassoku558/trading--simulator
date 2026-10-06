"use client";
export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <main className="loading">
      <h1>Let’s try that again.</h1>
      <p>
        Something interrupted your practice space. Your saved progress stays in
        this browser.
      </p>
      <button className="primary" onClick={retry}>
        Try again
      </button>
    </main>
  );
}
