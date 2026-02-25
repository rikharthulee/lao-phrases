"use client";

import Link from "next/link";
import { VOWELS } from "@/data/alphabet/vowels";

function formatPattern(pattern) {
  if (!pattern) return pattern;
  return pattern.replace("-", "◌");
}

function applyToPlaceholder(pattern) {
  if (!pattern) return pattern;
  return pattern.replace("-", "ກ");
}

function playSequence(firstSrc, secondSrc) {
  if (!firstSrc && !secondSrc) return;

  if (!firstSrc && secondSrc) {
    const only = new Audio(secondSrc);
    only.play().catch(() => {});
    return;
  }

  const first = new Audio(firstSrc);
  first.onended = () => {
    if (!secondSrc) return;
    const second = new Audio(secondSrc);
    second.play().catch(() => {});
  };
  first.play().catch(() => {});
}

function Section({ title, letters }) {
  return (
    <section style={{ marginBottom: "28px" }} aria-label={`${title} vowels`}>
      <h2 className="classHeading">{title}</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {letters.map((vowel) => (
          <div
            key={`${vowel.pattern}-${vowel.example}`}
            style={{
              border: "1px solid #d8dde5",
              borderRadius: "10px",
              padding: "14px",
              textAlign: "center",
              background: "#fff",
            }}
          >
            <div style={{ fontSize: "34px", lineHeight: 1.1 }}>{formatPattern(vowel.pattern)}</div>
            <div style={{ marginTop: "8px", fontSize: "22px", lineHeight: 1.1, color: "#444" }}>
              {applyToPlaceholder(vowel.pattern)}
            </div>

            <div style={{ marginTop: "10px", fontWeight: 700 }}>Sound: {vowel.sound}</div>
            <div style={{ color: "#60656f", marginTop: "2px" }}>Length: {vowel.length}</div>
            <div style={{ color: "#60656f", marginTop: "2px" }}>Position: {vowel.position}</div>

            <div style={{ marginTop: "10px", fontSize: "14px" }}>
              <div>Example word: {vowel.example}</div>
              <div>Pronunciation: {vowel.exampleSay}</div>
            </div>

            <button
              type="button"
              onClick={() => playSequence(vowel.audio, vowel.exampleAudio)}
              style={{
                marginTop: "10px",
                border: "1px solid #d8dde5",
                borderRadius: "8px",
                padding: "8px 12px",
                background: "#eaf2ff",
                cursor: "pointer",
              }}
            >
              Play
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function VowelsPage() {
  const vowels = VOWELS.map((item) => ({
    pattern: item.pattern || item.symbol,
    sound: item.sound,
    length: item.length,
    position: item.position,
    example: item.example,
    exampleSay: item.exampleSay,
    audio: item.audio,
    exampleAudio: item.exampleAudio,
  }));

  return (
    <main className="container">
      <header className="topBar">
        <h1>Lao Vowels</h1>
        <p>Simple vowel patterns and examples.</p>
      </header>

      <nav className="sectionNav" aria-label="Sections">
        <Link href="/learn">Back to Learn</Link>
        <Link href="/learn/consonants">Consonants</Link>
      </nav>

      <Section title="VOWELS" letters={vowels} />
    </main>
  );
}
