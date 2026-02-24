import Link from "next/link";

export default function LearnPage() {
  return (
    <main className="container">
      <header className="topBar">
        <h1>Learn Lao Alphabet</h1>
        <p>Start with consonants and vowels.</p>
      </header>

      <nav className="sectionNav" aria-label="Sections">
        <Link href="/">Phrasebook</Link>
        <Link href="/learn">Learn Alphabet</Link>
      </nav>

      <section className="learnLinks" aria-label="Alphabet links">
        <Link className="learnLinkCard" href="/learn/consonants">
          <h2>Consonants</h2>
          <p>View Lao consonants with classes and examples.</p>
        </Link>

        <Link className="learnLinkCard" href="/learn/vowels">
          <h2>Vowels</h2>
          <p>Study vowel symbols, sounds, and word examples.</p>
        </Link>
      </section>
    </main>
  );
}
