"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { VOWELS } from "@/data/alphabet/vowels";

const VOWEL_FAMILIES = [
  { id: "a", title: "/a/ (short) and /aa/ (long)", patterns: ["-ະ", "-ັ", "-າ"] },
  { id: "u", title: "/u/ (short) and /uu/ (long)", patterns: ["-ຸ", "-ູ"] },
  { id: "i", title: "/i/ (short) and /ii/ (long)", patterns: ["-ິ", "-ີ"] },
  { id: "ue", title: "/eu/ (short) and /euu/ (long)", patterns: ["-ຶ", "-ື"] },
  { id: "e", title: "/ea/ (short) and /eaa/ (long)", patterns: ["ເ-ະ", "ເ-"] },
  { id: "ae", title: "/ae/ (short) and /aae/ (long)", patterns: ["ແ-ະ", "ແ-"] },
  { id: "o", title: "/o/ (short) and /oo/ (long)", patterns: ["-ົ", "ໂ-"] },
  { id: "ai", title: "/ai/ vowels", patterns: ["ໃ-", "ໄ-"] },
  { id: "ao", title: "/ao/ vowels", patterns: ["ເ-າ"] },
  { id: "ua", title: "/ua/ vowels", patterns: ["ົວ"] },
  { id: "uea", title: "/eua/ vowels", patterns: ["ເ-ືອ"] },
  { id: "oei", title: "/oei/ vowels", patterns: ["ເ-ີຍ"] },
];

function formatPattern(pattern) {
  if (!pattern) return pattern;
  return pattern.replace("-", "◌");
}

function applyToPlaceholder(pattern) {
  if (!pattern) return pattern;
  return pattern.replace("-", "ກ");
}

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

async function playVowel(vowel, includeExamples) {
  await playAudio(vowel.audio || "");

  if (includeExamples) {
    await playAudio(vowel.exampleAudio || "");
  }
}

function familySizeLabel(length) {
  if (length === 2) return "Pair";
  if (length === 3) return "Triple";
  return "Single";
}

function VowelCard({ vowel, includeExamples }) {
  return (
    <div
      style={{
        border: "1px solid #d8dde5",
        borderRadius: "10px",
        padding: "14px",
        textAlign: "center",
        background: "#fff",
      }}
    >
      <div style={{ fontSize: "34px", lineHeight: 1.1 }}>{formatPattern(vowel.pattern)}</div>
      <div style={{ marginTop: "6px", fontSize: "20px", lineHeight: 1.1, color: "#444" }}>
        {vowel.standalone}
      </div>
      <div style={{ marginTop: "8px", fontSize: "22px", lineHeight: 1.1, color: "#444" }}>
        {applyToPlaceholder(vowel.pattern)}
      </div>

      <div style={{ marginTop: "10px", fontWeight: 700 }}>Sound: {vowel.sound}</div>
      <div style={{ color: "#60656f", marginTop: "2px" }}>IPA: /{vowel.ipa}/</div>
      <div style={{ color: "#60656f", marginTop: "2px" }}>Length: {vowel.vowelLength}</div>
      <div style={{ color: "#60656f", marginTop: "2px" }}>Position: {vowel.position}</div>

      <div style={{ marginTop: "10px", fontSize: "14px" }}>
        <div>Example word: {vowel.example}</div>
        <div>Pronunciation: {vowel.exampleSay}</div>
      </div>

      <button
        type="button"
        onClick={() => {
          void playVowel(vowel, includeExamples);
        }}
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
  );
}

function Section({ title, letters, includeExamples }) {
  return (
    <section style={{ marginBottom: "28px" }} aria-label={`${title} vowels`}>
      <h2 className="classHeading">
        {title} <span style={{ color: "#60656f", fontWeight: 500 }}>({familySizeLabel(letters.length)})</span>
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        {letters.map((vowel) => (
          <VowelCard key={`${vowel.pattern}-${vowel.standalone}`} vowel={vowel} includeExamples={includeExamples} />
        ))}
      </div>
    </section>
  );
}

export default function VowelsPage() {
  const [includeExamples, setIncludeExamples] = useState(false);
  const [isPlayingAll, setIsPlayingAll] = useState(false);

  const byPattern = useMemo(() => new Map(VOWELS.map((vowel) => [vowel.pattern, vowel])), []);

  const groupedFamilies = useMemo(
    () =>
      VOWEL_FAMILIES.map((family) => ({
        ...family,
        letters: family.patterns.map((pattern) => byPattern.get(pattern)).filter(Boolean),
      })).filter((family) => family.letters.length > 0),
    [byPattern],
  );

  const orderedVowels = useMemo(
    () => groupedFamilies.flatMap((family) => family.letters),
    [groupedFamilies],
  );

  async function handlePlayAll() {
    if (isPlayingAll) return;

    setIsPlayingAll(true);

    try {
      for (const vowel of orderedVowels) {
        await playVowel(vowel, includeExamples);
      }
    } finally {
      setIsPlayingAll(false);
    }
  }

  return (
    <main className="container">
      <header className="topBar">
        <h1>Lao Vowels</h1>
        <p>Grouped by vowel families (pairs and triples).</p>
      </header>

      <nav className="sectionNav" aria-label="Sections">
        <Link href="/learn">Back to Learn</Link>
        <Link href="/learn/consonants">Consonants</Link>
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

      {groupedFamilies.map((family) => (
        <Section key={family.id} title={family.title} letters={family.letters} includeExamples={includeExamples} />
      ))}
    </main>
  );
}
