import Link from "next/link";
import ConsonantCard from "@/components/ConsonantCard";
import { CONSONANTS } from "@/data/alphabet/consonants";

function Section({ title, letters }) {
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
          <ConsonantCard key={letter.char} letter={letter} />
        ))}
      </div>
    </section>
  );
}

export default function ConsonantsPage() {
  const mid = CONSONANTS.filter((c) => c.class === "mid");
  const high = CONSONANTS.filter((c) => c.class === "high");
  const low = CONSONANTS.filter((c) => c.class === "low");

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

      <Section title="MID CLASS" letters={mid} />
      <Section title="HIGH CLASS" letters={high} />
      <Section title="LOW CLASS" letters={low} />
    </main>
  );
}
