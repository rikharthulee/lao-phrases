"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ConsonantCard from "@/components/ConsonantCard";
import { CONSONANTS } from "@/data/alphabet/consonants";

function playAudio(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }

    const audio = new Audio(src);
    audio.onended = () => resolve();
    audio.onerror = () => resolve();

    audio.play().catch(() => resolve());
  });
}

async function playConsonant(letter, includeExamples) {
  await playAudio(letter.audio || "");

  if (includeExamples) {
    await playAudio(letter.exampleAudio || "");
  }
}

function Section({ title, letters, includeExamples }) {
  return (
    <section style={{ marginBottom: "28px" }} aria-label={`${title} consonants`}>
      <h2 className="classHeading">{title}</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {letters.map((letter) => (
          <ConsonantCard key={letter.char} letter={letter} includeExamples={includeExamples} />
        ))}
      </div>
    </section>
  );
}

export default function ConsonantsPage() {
  const [includeExamples, setIncludeExamples] = useState(false);
  const [isPlayingAll, setIsPlayingAll] = useState(false);

  const mid = useMemo(() => CONSONANTS.filter((c) => c.toneClass === "mid"), []);
  const high = useMemo(() => CONSONANTS.filter((c) => c.toneClass === "high"), []);
  const low = useMemo(() => CONSONANTS.filter((c) => c.toneClass === "low"), []);

  const orderedLetters = useMemo(() => [...mid, ...high, ...low], [mid, high, low]);

  async function handlePlayAll() {
    if (isPlayingAll) return;

    setIsPlayingAll(true);

    try {
      for (const letter of orderedLetters) {
        await playConsonant(letter, includeExamples);
      }
    } finally {
      setIsPlayingAll(false);
    }
  }

  return (
    <main className="container">
      <header className="topBar">
        <h1>Lao Consonants</h1>
        <p>Grouped by tone class.</p>
      </header>

      <nav className="sectionNav" aria-label="Sections">
        <Link href="/learn">Back to Learn</Link>
        <Link href="/learn/vowels">Vowels</Link>
      </nav>

      <section style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#60656f" }}>
          <input
            type="checkbox"
            checked={includeExamples}
            onChange={(event) => setIncludeExamples(event.target.checked)}
          />
          Include example audio
        </label>

        <button
          type="button"
          onClick={handlePlayAll}
          disabled={isPlayingAll}
          style={{
            border: "1px solid #d8dde5",
            borderRadius: "8px",
            padding: "8px 12px",
            background: "#eaf2ff",
            cursor: isPlayingAll ? "not-allowed" : "pointer",
            opacity: isPlayingAll ? 0.7 : 1,
          }}
        >
          {isPlayingAll ? "Playing..." : "Play all"}
        </button>
      </section>

      <Section title="MID CLASS" letters={mid} includeExamples={includeExamples} />
      <Section title="HIGH CLASS" letters={high} includeExamples={includeExamples} />
      <Section title="LOW CLASS" letters={low} includeExamples={includeExamples} />
    </main>
  );
}
