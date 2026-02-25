"use client";

import Link from "next/link";
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

function familySizeLabel(length) {
  if (length === 2) return "Pair";
  if (length === 3) return "Triple";
  return "Single";
}

function VowelCard({ vowel }) {
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
  );
}

function Section({ title, letters }) {
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
          <VowelCard key={`${vowel.pattern}-${vowel.standalone}`} vowel={vowel} />
        ))}
      </div>
    </section>
  );
}

export default function VowelsPage() {
  const byPattern = new Map(VOWELS.map((vowel) => [vowel.pattern, vowel]));
  const groupedFamilies = VOWEL_FAMILIES.map((family) => ({
    ...family,
    letters: family.patterns.map((pattern) => byPattern.get(pattern)).filter(Boolean),
  })).filter((family) => family.letters.length > 0);

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

      {groupedFamilies.map((family) => (
        <Section key={family.id} title={family.title} letters={family.letters} />
      ))}
    </main>
  );
}
